import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import SuccessModal from "../components/modal/SuccessModal";
import ConfirmModal from "../components/modal/ConfirmModal";

const API_BASE_URL = "http://localhost:3000/api/patients"; // Sesuaikan URL API Express Anda
const ITEMS_PER_PAGE = 5;

// Helper Axios Instance dengan Header Auth otomatis
const getAuthAxios = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
};

// Helper Format Tanggal untuk Tampilan UI (YYYY-MM-DD)
const formatDateUI = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toISOString().split("T")[0];
};

// ---------- Sub-komponen: Pagination ----------
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
        pasien
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

// ---------- Sub-komponen: Form Modal (Tambah & Ubah) ----------
const emptyForm = {
  nik: "",
  name: "",
  gender: "",
  birthDate: "",
  phone: "",
  address: "",
};

const PatientFormModal = ({
  mode,
  initialData,
  onClose,
  onSubmitSuccess,
  setSuccessModal,
}) => {
  const [form, setForm] = useState(
    mode === "ubah" && initialData
      ? {
          nik: initialData.nik || "",
          name: initialData.name || "",
          gender: initialData.gender || "Laki-laki",
          birthDate: formatDateUI(initialData.birthDate),
          phone: initialData.phone || "",
          address: initialData.address || "",
        }
      : emptyForm,
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{16}$/.test(form.nik)) {
      setError("NIK harus terdiri dari 16 digit angka.");
      return;
    }

    setLoading(true);
    try {
      const axiosClient = getAuthAxios();
      if (mode === "tambah") {
        await axiosClient.post("/", form);
      } else if (mode === "ubah") {
        await axiosClient.put(`/${initialData.id}`, form);
      }
      onSubmitSuccess();
      setSuccessModal({
        open: true,
        title: "Berhasil",
        message:
          mode === "tambah"
            ? "Data pasien berhasil ditambahkan."
            : "Data pasien berhasil diperbarui.",
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">
            {mode === "tambah" ? "Tambah Data Pasien" : "Ubah Data Pasien"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === "ubah" && (
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                No. Rekam Medis
              </label>
              <input
                type="text"
                disabled
                value={initialData?.medicalRecord || ""}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 font-mono"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              NIK
            </label>
            <input
              type="text"
              required
              maxLength={16}
              placeholder="16 digit sesuai KTP"
              value={form.nik}
              onChange={(e) =>
                setForm({ ...form, nik: e.target.value.replace(/\D/g, "") })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Nama Lengkap Pasien
            </label>
            <input
              type="text"
              required
              placeholder="Nama Pasien"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Tgl Lahir
              </label>
              <input
                type="date"
                required
                value={form.birthDate}
                onChange={(e) =>
                  setForm({ ...form, birthDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Nomor Telepon
            </label>
            <input
              type="text"
              required
              placeholder="0812xxxx"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Alamat
            </label>
            <textarea
              rows="2"
              required
              placeholder="Alamat lengkap..."
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm flex items-center space-x-1"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {mode === "tambah" ? "Simpan Pasien" : "Simpan Perubahan"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------- Sub-komponen: Detail Modal (read-only) ----------
const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
      {label}
    </p>
    <p className="text-sm font-semibold text-slate-800 mt-0.5">
      {value || "-"}
    </p>
  </div>
);

const PatientDetailModal = ({ patientId, onClose }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientDetail = async () => {
      try {
        const axiosClient = getAuthAxios();
        const response = await axiosClient.get(`/${patientId}`);
        setPatient(response.data.data);
      } catch (err) {
        console.error("Gagal mengambil detail pasien:", err);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchPatientDetail();
  }, [patientId]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">
            Detail Data Pasien
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            <span className="text-xs">Memuat detail pasien...</span>
          </div>
        ) : patient ? (
          <div className="grid grid-cols-2 gap-4 text-xs pt-2">
            <DetailRow label="No. Rekam Medis" value={patient.medicalRecord} />
            <DetailRow label="Nama Pasien" value={patient.name} />
            <DetailRow label="NIK" value={patient.nik} />
            <DetailRow
              label="Jenis Kelamin"
              value={patient.gender === "MALE" ? "Laki-laki" : "Perempuan"}
            />
            <DetailRow
              label="Tanggal Lahir"
              value={formatDateUI(patient.birthDate)}
            />
            <DetailRow label="Nomor Telepon" value={patient.phone} />
            <div className="col-span-2">
              <DetailRow label="Alamat" value={patient.address} />
            </div>
          </div>
        ) : (
          <p className="text-xs text-red-500 py-4 text-center">
            Data pasien gagal dimuat.
          </p>
        )}

        <div className="flex justify-end pt-5 mt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg shadow-sm text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Komponen Utama: PatientsTable ----------
const PatientsTable = () => {
  const [patients, setPatients] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formModal, setFormModal] = useState(null); // { mode: 'tambah' | 'ubah', data?: patient }
  const [detailPatientId, setDetailPatientId] = useState(null);

  const [successModal, setSuccessModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  // State untuk ConfirmModal — menyimpan data pasien yang MAU dihapus.
  // Selama confirmModal.open === true, belum ada API call apa pun yang jalan;
  // request DELETE baru dikirim setelah user menekan tombol "Hapus" di dalam modal.
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    patient: null,
  });
  const [deleting, setDeleting] = useState(false);

  // Fetch Data Pasien dari Express API
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const axiosClient = getAuthAxios();
      const response = await axiosClient.get("/", {
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm,
        },
      });

      const resData = response.data.data;
      setPatients(resData.data || []);
      setTotalItems(resData.total || 0);
    } catch (err) {
      console.error("Gagal mengambil data pasien:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Klik ikon hapus di tabel → cuma buka ConfirmModal, belum ada API call.
  const handleDeleteClick = (patient) => {
    setConfirmModal({ open: true, patient });
  };

  // Klik "Hapus" di dalam ConfirmModal → baru di sini API delete dijalankan.
  const handleConfirmDelete = async () => {
    const patient = confirmModal.patient;
    if (!patient) return;

    setDeleting(true);
    try {
      const axiosClient = getAuthAxios();
      await axiosClient.delete(`/${patient.id}`);
      await fetchPatients();
      setConfirmModal({ open: false, patient: null });
      setSuccessModal({
        open: true,
        title: "Berhasil",
        message: "Data pasien berhasil dihapus.",
      });
    } catch (err) {
      setConfirmModal({ open: false, patient: null });
      alert(err.response?.data?.message || "Gagal menghapus data pasien");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari No. RM / NIK / nama pasien..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <button
          onClick={() => setFormModal({ mode: "tambah" })}
          className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pasien</span>
        </button>
      </div>

      <div className="overflow-x-auto relative">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider font-semibold text-slate-600">
              <th className="py-3 px-4">No. RM</th>
              <th className="py-3 px-4">NIK</th>
              <th className="py-3 px-4">Nama Pasien</th>
              <th className="py-3 px-4">Gender</th>
              <th className="py-3 px-4">Tgl Lahir</th>
              <th className="py-3 px-4">No. Telepon</th>
              <th className="py-3 px-4">Alamat</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                    <span>Memuat data pasien...</span>
                  </div>
                </td>
              </tr>
            ) : patients.length > 0 ? (
              patients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 text-slate-700">
                  <td className="py-3 px-4 font-mono">
                    {p.medicalRecord || "-"}
                  </td>
                  <td className="py-3 px-4 font-mono">{p.nik}</td>
                  <td className="py-3 px-4">{p.name}</td>
                  <td className="py-3 px-4">
                    {p.gender === "MALE" ? "Laki-laki" : "Perempuan"}
                  </td>
                  <td className="py-3 px-4">{formatDateUI(p.birthDate)}</td>
                  <td className="py-3 px-4">{p.phone}</td>
                  <td className="py-3 px-4 max-w-[160px] truncate">
                    {p.address}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => setDetailPatientId(p.id)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                        title="Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setFormModal({ mode: "ubah", data: p })}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Ubah"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(p)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center space-y-2">
                    <Users className="w-6 h-6" />
                    <span>Tidak ada data pasien yang cocok.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      {formModal && (
        <PatientFormModal
          mode={formModal.mode}
          initialData={formModal.data}
          onClose={() => setFormModal(null)}
          onSubmitSuccess={fetchPatients}
          setSuccessModal={setSuccessModal}
        />
      )}

      {detailPatientId && (
        <PatientDetailModal
          patientId={detailPatientId}
          onClose={() => setDetailPatientId(null)}
        />
      )}

      <ConfirmModal
        open={confirmModal.open}
        title="Hapus Data Pasien"
        message={
          confirmModal.patient
            ? `Hapus data pasien "${confirmModal.patient.name}"? Tindakan ini tidak bisa dibatalkan.`
            : ""
        }
        onCancel={() => setConfirmModal({ open: false, patient: null })}
        onConfirm={handleConfirmDelete}
      />

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
};

export default PatientsTable;