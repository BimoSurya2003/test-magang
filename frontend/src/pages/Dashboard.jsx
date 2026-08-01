import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  ListOrdered,
  RefreshCw,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// URL Base API Backend Anda
const API_BASE_URL = "http://localhost:3000/api";
const ITEMS_PER_PAGE = 5;

// Helper untuk mengambil array data dari berbagai kemungkinan bentuk respons API.
// Menjaga agar .filter/.map tidak error walau struktur backend sedikit berbeda
// (mis. data.data, data.data.data, data.data.patients, data.data.queues, atau langsung array).
const extractArray = (payload, possibleKeys = []) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  if (Array.isArray(payload.data)) return payload.data;

  for (const key of possibleKeys) {
    if (Array.isArray(payload[key])) return payload[key];
    if (payload.data && Array.isArray(payload.data[key])) return payload.data[key];
  }

  if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;

  return [];
};

const formatQueueStatus = (status) => {
  const statusMap = {
    WAITING: "Menunggu",
    CHECK_IN: "Sudah Dipanggil",
    EXAMINATION: "Sedang Diperiksa",
    FINISHED: "Selesai",
  };

  return statusMap[status] || "-";
};

// ---------- Sub-komponen: Pagination (mengikuti gaya halaman Data Pasien) ----------
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs">
      <p className="text-slate-500">
        Menampilkan{" "}
        <span className="font-semibold text-slate-700">
          {totalItems > 0 ? startItem : 0}-{endItem}
        </span>{" "}
        dari <span className="font-semibold text-slate-700">{totalItems}</span>{" "}
        antrean
      </p>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {pageNumbers.map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`w-7 h-7 rounded-lg font-semibold ${
              num === currentPage
                ? "bg-teal-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalPatientsToday: 0,
    totalQueueToday: 0,
    waitingPatients: 0,
    completedPatients: 0,
  });

  const [todayQueues, setTodayQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Data Dashboard
  const fetchDashboardData = async () => {
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      // Fetch Pasien & Antrean secara paralel
      const [patientsRes, queuesRes] = await Promise.all([
        axios
          .get(`${API_BASE_URL}/patients`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .catch(() => ({ data: { data: [] } })),
        axios
          .get(`${API_BASE_URL}/queues`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .catch(() => ({ data: { data: [] } })),
      ]);

      const patients = extractArray(patientsRes.data, ["patients"]);
      const queues = extractArray(queuesRes.data, ["queues"]);

      // Tanggal hari ini dalam format YYYY-MM-DD
      const todayStr = new Date().toISOString().split("T")[0];

      // Filter Pasien Hari Ini
      const patientsToday = patients.filter((p) => {
        if (!p.createdAt) return false;
        return new Date(p.createdAt).toISOString().split("T")[0] === todayStr;
      });

      // Filter Antrean Hari Ini
      const queuesToday = queues.filter((q) => {
        const queueDate = q.createdAt || q.registration?.visitDate;
        if (!queueDate) return true; // jika tidak ada tanggal, dianggap hari ini
        return new Date(queueDate).toISOString().split("T")[0] === todayStr;
      });

      // Hitung Status Antrean Hari Ini
      const waiting = queuesToday.filter((q) => q.status === "WAITING").length;
      const completed = queuesToday.filter((q) => q.status === "FINISHED").length;

      setStats({
        totalPatients: patients.length,
        totalPatientsToday: patientsToday.length,
        totalQueueToday: queuesToday.length,
        waitingPatients: waiting,
        completedPatients: completed,
      });

      setTodayQueues(queuesToday);
    } catch (error) {
      console.error("Gagal memuat data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Reset ke halaman 1 setiap kali kata kunci pencarian berubah
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Filter antrean hari ini berdasarkan No. Antrean, Nama Pasien, Poliklinik, atau Dokter
  const filteredQueues = todayQueues.filter((item) => {
    const keyword = searchTerm.toLowerCase();
    const queueNumber = (item.queueNumber || "").toLowerCase();
    const patientName = (
      item.registration?.patient?.name ||
      item.registration?.patient?.nama ||
      ""
    ).toLowerCase();
    const polyclinicName = (
      item.registration?.polyclinic?.name ||
      item.registration?.polyclinic?.nama ||
      ""
    ).toLowerCase();
    const doctorName = (
      item.registration?.doctor?.name ||
      item.registration?.doctor?.nama ||
      ""
    ).toLowerCase();

    return (
      queueNumber.includes(keyword) ||
      patientName.includes(keyword) ||
      polyclinicName.includes(keyword) ||
      doctorName.includes(keyword)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredQueues.length / ITEMS_PER_PAGE));

  const paginatedQueues = filteredQueues.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50/30 min-h-screen text-slate-800">
      {/* Header Dashboard */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard Utama</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan informasi statistik dan aktivitas antrean harian
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          title="Segarkan Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Grid Ringkasan Statistik (Monokrom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Pasien */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Pasien
            </span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats.totalPatients}
          </div>
          <p className="text-[11px] text-slate-400">Terdaftar di sistem</p>
        </div>

        {/* Card 2: Total Pasien Hari Ini */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Pasien Hari Ini
            </span>
            <TrendingUp className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats.totalPatientsToday}
          </div>
          <p className="text-[11px] text-slate-400">Pendaftaran baru hari ini</p>
        </div>

        {/* Card 3: Total Antrean Hari Ini */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Antrean Hari Ini
            </span>
            <ListOrdered className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats.totalQueueToday}
          </div>
          <p className="text-[11px] text-slate-400">Total nomor antrean</p>
        </div>

        {/* Card 4: Total Pasien Menunggu */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Menunggu
            </span>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats.waitingPatients}
          </div>
          <p className="text-[11px] text-slate-400">Status Menunggu</p>
        </div>

        {/* Card 5: Total Pasien Selesai Dilayani */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Selesai Dilayani
            </span>
            <CheckCircle2 className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats.completedPatients}
          </div>
          <p className="text-[11px] text-slate-400">Status Selesai</p>
        </div>
      </div>

      {/* Tabel Ringkasan Antrean Hari Ini (Clean & Horizontal Single-Line) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-3">
        <div className="p-4 pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Daftar Antrean Pasien Hari Ini
          </h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Box (mengikuti gaya halaman Data Pasien) */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari No. Antrean / Pasien / Poli / Dokter..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {filteredQueues.length} Antrean
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider font-semibold text-slate-600">
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">No. Antrean</th>
                <th className="py-3 px-4">Pasien</th>
                <th className="py-3 px-4">Poliklinik</th>
                <th className="py-3 px-4">Dokter</th>
                <th className="py-3 px-4">Pembayaran</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    Memuat data statistik...
                  </td>
                </tr>
              ) : paginatedQueues.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    {searchTerm
                      ? "Tidak ada antrean yang cocok dengan pencarian."
                      : "Belum ada antrean untuk hari ini."}
                  </td>
                </tr>
              ) : (
                paginatedQueues.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.queueNumber}
                    </td>
                    <td className="py-3 px-4">
                      {item.registration?.patient?.name ||
                        item.registration?.patient?.nama ||
                        "-"}
                    </td>
                    <td className="py-3 px-4">
                      {item.registration?.polyclinic?.name ||
                        item.registration?.polyclinic?.nama ||
                        "-"}
                    </td>
                    <td className="py-3 px-4">
                      {item.registration?.doctor?.name ||
                        item.registration?.doctor?.nama ||
                        "-"}
                    </td>
                    <td className="py-3 px-4">
                      {item.registration?.paymentType || "-"}
                    </td>
                    <td className="py-3 px-4 font-medium">{formatQueueStatus(item.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredQueues.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}