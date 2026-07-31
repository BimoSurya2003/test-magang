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
} from "lucide-react";

// URL Base API Backend Anda
const API_BASE_URL = "http://localhost:5000/api";

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

  // Fetch Data Dashboard
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Pasien & Antrean secara paralel
      const [patientsRes, queuesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/patients`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE_URL}/queues`).catch(() => ({ data: { data: [] } })),
      ]);

      const patients = patientsRes.data.data || [];
      const queues = queuesRes.data.data || [];

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
      const completed = queuesToday.filter((q) => q.status === "DONE").length;

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
          <p className="text-[11px] text-slate-400">Status WAITING</p>
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
          <p className="text-[11px] text-slate-400">Status DONE</p>
        </div>
      </div>

      {/* Tabel Ringkasan Antrean Hari Ini (Clean & Horizontal Single-Line) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-3">
        <div className="p-4 pb-0 flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Daftar Antrean Pasien Hari Ini
          </h2>
          <span className="text-xs text-slate-400">
            {todayQueues.length} Antrean
          </span>
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
              ) : todayQueues.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    Belum ada antrean untuk hari ini.
                  </td>
                </tr>
              ) : (
                todayQueues.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">{index + 1}</td>
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
                    <td className="py-3 px-4 font-medium">{item.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}