import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Volume2,
  Plus,
  RefreshCw,
  Eye,
  Check,
  X,
  Search,
  UserCheck,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Sesuaikan URL API Backend Anda
const API_BASE_URL = "http://localhost:3000/api";
const ITEMS_PER_PAGE = 5;

const STATUS_LABEL = {
  WAITING: "Menunggu",
  CHECK_IN: "Dipanggil",
  EXAMINATION: "Sedang Diperiksa",
  FINISHED: "Selesai",
};

const getStatusLabel = (status) => STATUS_LABEL[status] || status;

// ---------- Sub-komponen: Pagination (mengikuti gaya halaman Dashboard) ----------
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

export default function QueuePage() {
  const [queues, setQueues] = useState([]);
  const [unassignedRegistrations, setUnassignedRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 1. Fetch Data Antrean
  const fetchQueues = async () => {
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(`${API_BASE_URL}/queues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setQueues(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data antrean:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Pendaftaran yang belum punya antrean (untuk modal Buat Antrean)
  const fetchRegistrations = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(`${API_BASE_URL}/registrations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const queuedRegIds = new Set(queues.map((q) => q.registrationId));
        const unassigned = response.data.data.filter(
          (reg) => !queuedRegIds.has(reg.id),
        );

        setUnassignedRegistrations(unassigned);
      }
    } catch (error) {
      console.error("Gagal mengambil data pendaftaran:", error);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      fetchRegistrations();
    }
  }, [showCreateModal, queues]);

  // Cari voice Bahasa Indonesia yang tersedia di browser/OS.
  // Daftar voice sering baru ter-load async (event 'voiceschanged'),
  // jadi kita coba ambil langsung dulu, kalau kosong tunggu event-nya.
  const getIndonesianVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Prioritas: voice dengan lang persis "id-ID"
    let voice = voices.find((v) => v.lang?.toLowerCase() === "id-id");
    // Fallback: voice apapun yang mengandung "id" di kode bahasanya
    if (!voice) {
      voice = voices.find((v) => v.lang?.toLowerCase().startsWith("id"));
    }
    // Fallback: voice dengan nama yang menyebut "Indonesia"
    if (!voice) {
      voice = voices.find((v) => v.name?.toLowerCase().includes("indonesia"));
    }
    return voice || null;
  };

  // Fungsi untuk mengucapkan nomor antrean menggunakan Web Speech API
  const speakQueue = (queueItem) => {
    try {
      if (!("speechSynthesis" in window)) {
        console.warn("Browser tidak mendukung Speech Synthesis API");
        return;
      }

      const queueNumber = queueItem.queueNumber || "";
      const polyclinicName =
        queueItem.registration?.polyclinic?.name ||
        queueItem.registration?.polyclinic?.nama ||
        "";

      const textToSpeak = polyclinicName
        ? `Nomor antrean ${queueNumber
            .split("")
            .join(" ")}, silakan menuju ke ${polyclinicName}`
        : `Nomor antrean ${queueNumber.split("").join(" ")}`;

      const doSpeak = () => {
        // Hentikan suara yang sedang berjalan (jika ada) sebelum memulai yang baru
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = "id-ID";
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.volume = 1;

        const idVoice = getIndonesianVoice();
        if (idVoice) {
          utterance.voice = idVoice;
        } else {
          console.warn(
            "Voice Bahasa Indonesia tidak ditemukan di browser ini, memakai voice default.",
          );
        }

        window.speechSynthesis.speak(utterance);
      };

      // Jika daftar voice belum ter-load (umum terjadi di load pertama),
      // tunggu event 'voiceschanged' sebelum bicara.
      const existingVoices = window.speechSynthesis.getVoices();
      if (existingVoices && existingVoices.length > 0) {
        doSpeak();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          doSpeak();
          window.speechSynthesis.onvoiceschanged = null;
        };
        // Fallback safety: kalau event tidak pernah terpicu, tetap coba bicara
        setTimeout(doSpeak, 300);
      }
    } catch (error) {
      console.error("Gagal memutar suara panggilan antrean:", error);
    }
  };

  // Handle Buat Antrean Baru
  const handleCreateQueue = async (e) => {
    e.preventDefault();
    if (!selectedRegistrationId) return;

    const token = localStorage.getItem("token");

    setSubmitLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/queues`,
        {
          registrationId: selectedRegistrationId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setShowCreateModal(false);
        setSelectedRegistrationId("");
        fetchQueues();
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Gagal membuat antrean.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Panggil Antrean
  const handleCallQueue = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `${API_BASE_URL}/queues/${id}/call`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        const calledQueue = response.data.data ||
          queues.find((q) => q.id === id) || { id };

        speakQueue(calledQueue);
        fetchQueues();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Gagal memanggil antrean");
    }
  };

  // Handle Ubah Status Antrean
  const handleUpdateStatus = async (id, status) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `${API_BASE_URL}/queues/${id}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        fetchQueues();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Gagal memperbarui status");
    }
  };

  // Panggil Antrean Berikutnya (Waiting Paling Awal)
  const handleCallNext = () => {
    const nextInLine = queues.find((q) => q.status === "WAITING");
    if (nextInLine) {
      handleCallQueue(nextInLine.id);
    } else {
      alert("Tidak ada antrean dalam status menunggu.");
    }
  };

  // Reset ke halaman 1 setiap kali kata kunci pencarian berubah
  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Reset ke halaman 1 setiap kali filter status berubah
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Filter Data
  const filteredQueues = queues.filter((item) => {
    const patientName =
      item.registration?.patient?.name ||
      item.registration?.patient?.nama ||
      "";
    const queueNo = item.queueNumber || "";
    const matchesSearch =
      patientName.toLowerCase().includes(search.toLowerCase()) ||
      queueNo.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ? true : item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Hitung total halaman & potong data sesuai halaman aktif
  const totalPages = Math.max(1, Math.ceil(filteredQueues.length / ITEMS_PER_PAGE));

  const paginatedQueues = filteredQueues.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Antrean yang sedang dipanggil saat ini
  const currentlyCalling = queues.find((q) => q.status === "CHECK_IN");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50/30 min-h-screen text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Manajemen Antrean
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola dan panggil antrean pasien secara terkontrol
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchQueues}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ambil Antrean Baru
          </button>
        </div>
      </div>

      {/* Banner Pemanggilan & Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Antrean Sedang Dipanggil */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Sedang Dipanggil
              </span>
              {currentlyCalling ? (
                <div className="mt-1">
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {currentlyCalling.queueNumber}
                  </div>
                  <p className="text-sm font-medium text-slate-700 mt-1">
                    {currentlyCalling.registration?.patient?.name ||
                      currentlyCalling.registration?.patient?.nama ||
                      "-"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {currentlyCalling.registration?.polyclinic?.name ||
                      currentlyCalling.registration?.polyclinic?.nama}{" "}
                    •{" "}
                    {currentlyCalling.registration?.doctor?.name ||
                      currentlyCalling.registration?.doctor?.nama}
                  </p>
                </div>
              ) : (
                <div className="mt-2 text-slate-400 text-sm italic">
                  Belum ada antrean yang dipanggil saat ini
                </div>
              )}
            </div>

            <button
              onClick={handleCallNext}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              Panggil Berikutnya
            </button>
          </div>
        </div>

        {/* Counter Ringkasan Antrean */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center space-y-3">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
            <span className="text-slate-500">Menunggu (WAITING)</span>
            <span className="font-semibold text-slate-800">
              {queues.filter((q) => q.status === "WAITING").length}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
            <span className="text-slate-500">Diperiksa (CHECK_IN)</span>
            <span className="font-semibold text-slate-800">
              {queues.filter((q) => q.status === "CHECK_IN").length}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Selesai (DONE)</span>
            <span className="font-semibold text-slate-800">
              {queues.filter((q) => q.status === "FINISHED").length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. Antrean atau Pasien..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400"
          />
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {["ALL", "WAITING", "CHECK_IN", "EXAMINATION", "FINISHED"].map(
            (status) => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === status
                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {status === "ALL" ? "Semua" : getStatusLabel(status)}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Tabel Data Antrean (Clean & Horizontal / Single Baris) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider font-semibold text-slate-600">
                <th className="py-3.5 px-4">No.</th>
                <th className="py-3.5 px-4">No. Antrean</th>
                <th className="py-3.5 px-4">Pasien</th>
                <th className="py-3.5 px-4">Poliklinik</th>
                <th className="py-3.5 px-4">Dokter</th>
                <th className="py-3.5 px-4">Keluhan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    Memuat data antrean...
                  </td>
                </tr>
              ) : paginatedQueues.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    Tidak ada data antrean ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedQueues.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.queueNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.registration?.patient?.name ||
                        item.registration?.patient?.nama ||
                        "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.registration?.polyclinic?.name ||
                        item.registration?.polyclinic?.nama ||
                        "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.registration?.doctor?.name ||
                        item.registration?.doctor?.nama ||
                        "-"}
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate">
                      {item.registration?.complaint || "-"}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {getStatusLabel(item.status)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* Tombol Panggil */}
                        <button
                          onClick={() => handleCallQueue(item.id)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors"
                          title="Panggil Antrean"
                        >
                          <Volume2 className="w-3 h-3" />
                          Panggil
                        </button>

                        {/* Tombol Set Selesai */}
                        {item.status !== "FINISHED" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(item.id, "FINISHED")
                            }
                            className="px-2.5 py-1 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium transition-colors"
                            title="Tandai Selesai"
                          >
                            Selesai
                          </button>
                        )}

                        {/* Detail Modal */}
                        <button
                          onClick={() => {
                            setSelectedQueue(item);
                            setShowDetailModal(true);
                          }}
                          className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg"
                          title="Detail Antrean"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
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

      {/* Modal 1: Generate / Ambil Antrean */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">
                Ambil Antrean Baru
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-slate-100 border border-slate-300 text-slate-700 text-xs rounded-lg">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateQueue} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Pilih Pendaftaran Pasien
                </label>
                <select
                  value={selectedRegistrationId}
                  onChange={(e) => setSelectedRegistrationId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400"
                  required
                >
                  <option value="">-- Pilih Pendaftaran --</option>
                  {unassignedRegistrations.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      #{reg.id} - {reg.patient?.name || reg.patient?.nama} (
                      {reg.polyclinic?.name || reg.polyclinic?.nama})
                    </option>
                  ))}
                </select>
                {unassignedRegistrations.length === 0 && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Semua pendaftaran sudah memiliki nomor antrean.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || !selectedRegistrationId}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-lg text-xs font-medium"
                >
                  {submitLoading ? "Memproses..." : "Generate Antrean"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Detail Antrean (Clean & Monochrome) */}
      {showDetailModal && selectedQueue && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">
                Detail Antrean #{selectedQueue.queueNumber}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400">Nomor Antrean</p>
                <p className="font-bold text-lg text-slate-900">
                  {selectedQueue.queueNumber}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Status</p>
                <p className="font-semibold text-slate-800">
                  {getStatusLabel(selectedQueue.status)}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-slate-400">Pasien</p>
                <p className="font-semibold text-slate-800">
                  {selectedQueue.registration?.patient?.name ||
                    selectedQueue.registration?.patient?.nama ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Poliklinik</p>
                <p className="font-medium text-slate-700">
                  {selectedQueue.registration?.polyclinic?.name ||
                    selectedQueue.registration?.polyclinic?.nama ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Dokter</p>
                <p className="font-medium text-slate-700">
                  {selectedQueue.registration?.doctor?.name ||
                    selectedQueue.registration?.doctor?.nama ||
                    "-"}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-slate-400">Keluhan</p>
                <p className="font-medium text-slate-700">
                  {selectedQueue.registration?.complaint || "-"}
                </p>
              </div>
            </div>

            {/* Ubah Status Manual */}
            <div className="pt-3 border-t border-slate-200">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Ubah Status Antrean
              </label>
              <div className="flex gap-2">
                {["WAITING", "CHECK_IN", "EXAMINATION", "FINISHED"].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => {
                        handleUpdateStatus(selectedQueue.id, st);
                        setShowDetailModal(false);
                      }}
                      className={`px-2.5 py-1 text-[11px] rounded-lg border font-medium transition-colors ${
                        selectedQueue.status === st
                          ? "bg-teal-600 hover:bg-teal-700 text-white"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {getStatusLabel(st)}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}