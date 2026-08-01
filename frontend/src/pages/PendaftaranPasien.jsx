import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SuccessModal from "../components/modal/SuccessModal";

const API_BASE_URL = "http://localhost:3000/api"; // Sesuaikan port & prefix API kamu
const ITEMS_PER_PAGE = 10;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const statusLabel = {
  WAITING: "Menunggu",
  CHECK_IN: "Check-in",
  EXAMINATION: "Pemeriksaan",
  FINISHED: "Selesai",
};

const statusClass = {
  WAITING: "bg-amber-50 text-amber-700 border border-amber-200",
  CHECK_IN: "bg-sky-50 text-sky-700 border border-sky-200",
  EXAMINATION: "bg-purple-50 text-purple-700 border border-purple-200",
  FINISHED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
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
        pendaftaran
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

export default function RegistrationPage() {
  const [registrations, setRegistrations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [polyclinics, setPolyclinics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [detailRegistration, setDetailRegistration] = useState(null);

  // Success Modal State (mengikuti pola di PatientsTable)
  const [successModal, setSuccessModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  // Form State
  const [formData, setFormData] = useState({
    patientId: "",
    polyclinicId: "",
    doctorId: "",
    visitDate: new Date().toISOString().split("T")[0],
    paymentType: "UMUM",
    complaint: "",
  });

  // Fetch all initial data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);

    try {
      const [regRes, patRes, docRes, polyRes] = await Promise.all([
        api.get("/registrations"),
        api.get("/patients"),
        api.get("/doctors"),
        api.get("/polyclinics"),
      ]);

      setRegistrations(regRes.data.data);

      // karena endpoint patient memakai pagination
      setPatients(patRes.data.data.data);

      setDoctors(docRes.data.data);
      setPolyclinics(polyRes.data.data);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      patientId: "",
      polyclinicId: "",
      doctorId: "",
      visitDate: new Date().toISOString().split("T")[0],
      paymentType: "UMUM",
      complaint: "",
    });
    setSelectedItem(null);
  };

  // Open Edit Modal
  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      patientId: item.patientId || item.patient?.id || "",
      polyclinicId: item.polyclinicId || item.polyclinic?.id || "",
      doctorId: item.doctorId || item.doctor?.id || "",
      visitDate: item.visitDate
        ? new Date(item.visitDate).toISOString().split("T")[0]
        : "",
      paymentType: item.paymentType || "UMUM",
      complaint: item.complaint || "",
    });
    setIsFormOpen(true);
  };

  // Open Delete Modal
  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  // Submit Form (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let result;
      const isEdit = Boolean(selectedItem);

      if (isEdit) {
        result = await api.put(`/registrations/${selectedItem.id}`, formData);
      } else {
        result = await api.post("/registrations", formData);
      }

      if (result.data.success) {
        fetchAllData();
        setIsFormOpen(false);
        resetForm();

        // Tampilkan modal sukses, sama seperti di kode pasien
        setSuccessModal({
          open: true,
          title: "Berhasil",
          message: isEdit
            ? "Data pendaftaran berhasil diperbarui."
            : "Data pendaftaran berhasil ditambahkan.",
        });
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Terjadi kesalahan");
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    try {
      const result = await api.delete(`/registrations/${selectedItem.id}`);

      if (result.data.success) {
        fetchAllData();
        setIsDeleteOpen(false);
        setSelectedItem(null);

        // Tampilkan modal sukses setelah hapus berhasil
        setSuccessModal({
          open: true,
          title: "Berhasil",
          message: "Data pendaftaran berhasil dihapus.",
        });
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal menghapus");
    }
  };

  // Reset ke halaman 1 setiap kali kata kunci pencarian berubah
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Filter Search
  const filteredRegistrations = registrations.filter((reg) => {
    const patientName = reg.patient?.name || reg.patient?.nama || "";
    const doctorName = reg.doctor?.name || reg.doctor?.nama || "";
    const polyName = reg.polyclinic?.name || reg.polyclinic?.nama || "";
    const search = searchTerm.toLowerCase();

    return (
      patientName.toLowerCase().includes(search) ||
      doctorName.toLowerCase().includes(search) ||
      polyName.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRegistrations.length / ITEMS_PER_PAGE)
  );

  const paginatedRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Pendaftaran Pasien
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data antrean dan pendaftaran konsultasi medis
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Pendaftaran
        </button>
      </div>

      {/* Control Bar: Search */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pasien, dokter, atau poli..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider font-semibold text-slate-600">
                <th className="py-3.5 px-4">No.</th>
                <th className="py-3.5 px-4">Pasien</th>
                <th className="py-3.5 px-4">Poliklinik</th>
                <th className="py-3.5 px-4">Dokter</th>
                <th className="py-3.5 px-4">Keluhan</th>
                <th className="py-3.5 px-4">Tgl Berobat</th>
                <th className="py-3.5 px-4">Pembayaran</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500">
                    Memuat data pendaftaran...
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500">
                    Tidak ada data pendaftaran ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedRegistrations.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.patient?.name ||
                        item.patient?.nama ||
                        `Pasien #${item.patientId}`}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.polyclinic?.name || item.polyclinic?.nama || "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.doctor?.name || item.doctor?.nama || "-"}
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate">
                      {item.complaint || "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      {new Date(item.visitDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">{item.paymentType}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          statusClass[item.status] ||
                          "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {statusLabel[item.status] || item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => setDetailRegistration(item)}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                          title="Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Ubah"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
          totalItems={filteredRegistrations.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Form (Tambah / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                {selectedItem
                  ? "Edit Pendaftaran Pasien"
                  : "Tambah Pendaftaran Baru"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Select Pasien */}
              {!selectedItem && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pasien
                  </label>
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) =>
                      setFormData({ ...formData, patientId: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                  >
                    <option value="">-- Pilih Pasien --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.nama} ({p.nik || `#${p.id}`})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Select Poliklinik & Dokter */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Poliklinik
                  </label>
                  <select
                    required
                    value={formData.polyclinicId}
                    onChange={(e) =>
                      setFormData({ ...formData, polyclinicId: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                  >
                    <option value="">-- Pilih Poli --</option>
                    {polyclinics.map((poly) => (
                      <option key={poly.id} value={poly.id}>
                        {poly.name || poly.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dokter
                  </label>
                  <select
                    required
                    value={formData.doctorId}
                    onChange={(e) =>
                      setFormData({ ...formData, doctorId: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                  >
                    <option value="">-- Pilih Dokter --</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name || doc.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tanggal & Jenis Pembayaran */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Kunjungan
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.visitDate}
                    onChange={(e) =>
                      setFormData({ ...formData, visitDate: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Pembayaran
                  </label>
                  <select
                    value={formData.paymentType}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentType: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                  >
                    <option value="UMUM">UMUM</option>
                    <option value="BPJS">BPJS</option>
                    <option value="ASURANSI">ASURANSI</option>
                  </select>
                </div>
              </div>

              {/* Keluhan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keluhan / Catatan
                </label>
                <textarea
                  rows="3"
                  placeholder="Tuliskan keluhan singkat pasien..."
                  value={formData.complaint}
                  onChange={(e) =>
                    setFormData({ ...formData, complaint: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="py-2 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
                >
                  {selectedItem ? "Simpan Perubahan" : "Daftarkan Pasien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-bold text-slate-800">
              Hapus Pendaftaran?
            </h3>

            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin menghapus data pendaftaran ini? Tindakan
              ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="w-1/2 py-2 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Batal
              </button>

              <button
                onClick={handleConfirmDelete}
                className="w-1/2 py-2 px-3 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {detailRegistration && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-lg space-y-4">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">
                Detail Pendaftaran
              </h3>
              <button
                onClick={() => setDetailRegistration(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <p className="text-slate-400">Pasien</p>
                <p className="font-semibold text-slate-800">
                  {detailRegistration.patient?.name ||
                    detailRegistration.patient?.nama ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Poliklinik</p>
                <p className="font-medium text-slate-700">
                  {detailRegistration.polyclinic?.name ||
                    detailRegistration.polyclinic?.nama ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Dokter</p>
                <p className="font-medium text-slate-700">
                  {detailRegistration.doctor?.name ||
                    detailRegistration.doctor?.nama ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Tanggal Kunjungan</p>
                <p className="font-medium text-slate-700">
                  {new Date(detailRegistration.visitDate).toLocaleDateString(
                    "id-ID",
                  )}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Pembayaran</p>
                <p className="font-medium text-slate-700">
                  {detailRegistration.paymentType}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Status</p>
                <p>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      statusClass[detailRegistration.status] ||
                      "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {statusLabel[detailRegistration.status] ||
                      detailRegistration.status}
                  </span>
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-slate-400">Keluhan</p>
                <p className="font-medium text-slate-700">
                  {detailRegistration.complaint || "-"}
                </p>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setDetailRegistration(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses (Tambah / Ubah / Hapus) — mengikuti pola PatientsTable */}
      {successModal.open && (
        <SuccessModal
          title={successModal.title}
          message={successModal.message}
          onClose={() =>
            setSuccessModal({
              open: false,
              title: "",
              message: "",
            })
          }
        />
      )}
    </div>
  );
}