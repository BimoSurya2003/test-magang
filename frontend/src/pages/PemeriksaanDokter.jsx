import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Stethoscope,
  User,
  Plus,
  Trash2,
  Save,
  History,
  FileText,
  Search,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";

// URL Base API Backend Anda
const API_BASE_URL = "http://localhost:3000/api";

// Ambil konfigurasi header Authorization berisi JWT Bearer Token.
// Token diasumsikan tersimpan di localStorage dengan key "token" setelah login.
// Sesuaikan key ini jika di project Anda token disimpan dengan nama lain
// (misal "accessToken") atau disimpan di tempat lain (misal cookie / context auth).
const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

export default function MedicalExaminationPage() {
  // State Pasien Yang Sedang Diperiksa
  const [activeQueue, setActiveQueue] = useState(null);
  const [queueList, setQueueList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("examination"); // 'examination' | 'history'

  // Form SOAP State
  const [soap, setSoap] = useState({
    subjective: "",
    bloodPressure: "",
    temperature: "",
    weight: "",
    height: "",
    assessment: "",
    plan: "",
  });

  // State Tindakan Medis (Array) -> Disesuaikan dengan Prisma (action)
  const [treatments, setTreatments] = useState([
    { action: "" },
  ]);

  // State Resep Obat (Array) -> Disesuaikan dengan Prisma (medicine, dosage, instruction)
  const [prescriptions, setPrescriptions] = useState([
    { medicine: "", dosage: "", instruction: "" },
  ]);

  // 1. Fetch Daftar Antrean Pasien yang SIAP diperiksa (status CHECK_IN)
  const fetchQueues = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/queues`, getAuthConfig());
      if (res.data.success) {
        // Filter pasien yang statusnya CHECK_IN atau WAITING
        const available = res.data.data.filter(
          (q) => q.status === "CHECK_IN" || q.status === "WAITING"
        );
        setQueueList(available);

        // Auto select pasien pertama jika belum ada yang dipilih
        if (available.length > 0 && !activeQueue) {
          selectPatient(available[0]);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil antrean:", err);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  // Pilih Pasien & Ambil Riwayat Pemeriksaan Lalu
  const selectPatient = async (queueItem) => {
    setActiveQueue(queueItem);
    setSoap({
      subjective: queueItem.registration?.complaint || "",
      bloodPressure: "",
      temperature: "",
      weight: "",
      height: "",
      assessment: "",
      plan: "",
    });
    setTreatments([{ action: "" }]);
    setPrescriptions([{ medicine: "", dosage: "", instruction: "" }]);

    // Fetch Riwayat Pasien jika ID Pasien tersedia
    const patientId = queueItem.registration?.patientId;
    if (patientId) {
      fetchPatientHistory(patientId);
    }
  };

  const fetchPatientHistory = async (patientId) => {
    setLoading(true);
    try {
      // Endpoint disesuaikan ke router GET /medical-records/:patientId
      const res = await axios.get(
        `${API_BASE_URL}/medical-records/${patientId}`,
        getAuthConfig()
      );
      if (res.data.success) {
        setHistoryList(res.data.data);
      }
    } catch (err) {
      console.log("Riwayat belum ditemukan atau belum ada.");
      setHistoryList([]);
    } finally {
      setLoading(false);
    }
  };

  // Handler Tindakan Medis
  const handleAddTreatment = () => {
    setTreatments([...treatments, { action: "" }]);
  };

  const handleRemoveTreatment = (index) => {
    setTreatments(treatments.filter((_, i) => i !== index));
  };

  const handleTreatmentChange = (index, field, value) => {
    const updated = [...treatments];
    updated[index][field] = value;
    setTreatments(updated);
  };

  // Handler Resep Obat
  const handleAddPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      { medicine: "", dosage: "", instruction: "" },
    ]);
  };

  const handleRemovePrescription = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  // Submit Form Pemeriksaan Dokter
  const handleSubmitExamination = async (e) => {
    e.preventDefault();
    if (!activeQueue) {
      alert("Pilih pasien terlebih dahulu.");
      return;
    }

    setSaving(true);

    // Structure Payload disesuaikan dengan createMedicalRecordService (Prisma)
    const payload = {
      registrationId: activeQueue.registrationId,
      subjective: soap.subjective,
      bloodPressure: soap.bloodPressure,
      temperature: soap.temperature,
      weight: soap.weight,
      height: soap.height,
      assessment: soap.assessment,
      plan: soap.plan,
      actions: treatments
        .filter((t) => t.action.trim() !== "")
        .map((t) => ({ action: t.action })),
      prescriptions: prescriptions
        .filter((p) => p.medicine.trim() !== "")
        .map((p) => ({
          medicine: p.medicine,
          dosage: p.dosage,
          instruction: p.instruction,
        })),
    };

    try {
      // Endpoint disesuaikan ke POST /medical-records
      const res = await axios.post(
        `${API_BASE_URL}/medical-records`,
        payload,
        getAuthConfig()
      );

      if (res.data.success) {
        alert("Pemeriksaan pasien berhasil disimpan!");
        setActiveQueue(null);
        fetchQueues();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan data pemeriksaan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50/30 min-h-screen text-slate-900">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Pemeriksaan Dokter (SOAP)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Input data rekam medis, tindakan, serta resep obat pasien
          </p>
        </div>

        {/* Tab Navigasi Sederhana */}
        <div className="flex items-center gap-2 border border-slate-200 bg-white p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("examination")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "examination"
                ? "bg-teal-600 hover:bg-teal-700 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            Form Pemeriksaan
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-teal-600 hover:bg-teal-700 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Riwayat Pasien
          </button>
        </div>
      </div>

      {/* Bar Selector Pasien Aktif */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 rounded-lg text-slate-800">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Pasien Terpilih</div>
            <div className="text-sm font-bold text-slate-900">
              {activeQueue
                ? activeQueue.registration?.patient?.name ||
                  activeQueue.registration?.patient?.nama
                : "Belum Ada Pasien Dipilih"}
            </div>
            {activeQueue && (
              <div className="text-xs text-slate-600">
                No. Antrean: <span className="font-semibold text-slate-900">{activeQueue.queueNumber}</span> • Poli:{" "}
                {activeQueue.registration?.polyclinic?.name || activeQueue.registration?.polyclinic?.nama || "-"}
              </div>
            )}
          </div>
        </div>

        {/* Dropdown Pasien Antrean */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-medium text-slate-700 whitespace-nowrap">Pilih Pasien:</label>
          <select
            value={activeQueue?.id || ""}
            onChange={(e) => {
              const selected = queueList.find((q) => q.id === Number(e.target.value));
              if (selected) selectPatient(selected);
            }}
            className="w-full md:w-64 border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-500 bg-white"
          >
            {queueList.length === 0 && <option value="">Tidak ada antrean aktif</option>}
            {queueList.map((q) => (
              <option key={q.id} value={q.id}>
                {q.queueNumber} - {q.registration?.patient?.name || q.registration?.patient?.nama}
              </option>
            ))}
          </select>
          <button
            onClick={fetchQueues}
            className="p-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            title="Refresh Antrean"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KONTEN TAB 1: FORM PEMERIKSAAN SOAP */}
      {activeTab === "examination" && (
        <form onSubmit={handleSubmitExamination} className="space-y-6">
          {/* SECTION 1: METHOD SOAP */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              Pemeriksaan SOAP
            </h2>

            {/* Subjective */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Subjective (Keluhan Pasien)
              </label>
              <textarea
                rows="2"
                value={soap.subjective}
                onChange={(e) => setSoap({ ...soap, subjective: e.target.value })}
                placeholder="Keluhan utama, riwayat penyakit saat ini..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
                required
              />
            </div>

            {/* Objective (Vital Signs) */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-2">
                Objective (Tanda-Tanda Vital)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <span className="text-[11px] text-slate-700 font-medium block mb-1">Tekanan Darah</span>
                  <input
                    type="text"
                    placeholder="120/80 mmHg"
                    value={soap.bloodPressure}
                    onChange={(e) => setSoap({ ...soap, bloodPressure: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-700 font-medium block mb-1">Suhu Tubuh (°C)</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={soap.temperature}
                    onChange={(e) => setSoap({ ...soap, temperature: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-700 font-medium block mb-1">Berat Badan (kg)</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="65"
                    value={soap.weight}
                    onChange={(e) => setSoap({ ...soap, weight: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-700 font-medium block mb-1">Tinggi Badan (cm)</span>
                  <input
                    type="number"
                    placeholder="170"
                    value={soap.height}
                    onChange={(e) => setSoap({ ...soap, height: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Assessment */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Assessment (Diagnosa)
              </label>
              <textarea
                rows="2"
                value={soap.assessment}
                onChange={(e) => setSoap({ ...soap, assessment: e.target.value })}
                placeholder="Diagnosa utama, ICD-10, atau hasil observasi klinis..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
                required
              />
            </div>

            {/* Plan */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Plan (Rencana Terapi & Edukasi)
              </label>
              <textarea
                rows="2"
                value={soap.plan}
                onChange={(e) => setSoap({ ...soap, plan: e.target.value })}
                placeholder="Rencana tindakan, saran perawataan, atau instruksi pasien..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          {/* SECTION 2: INPUT TINDAKAN MEDIS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Tindakan Medis
              </h2>
              <button
                type="button"
                onClick={handleAddTreatment}
                className="flex items-center gap-1 text-xs font-medium text-slate-800 hover:text-slate-900 border border-slate-300 px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Tindakan
              </button>
            </div>

            <div className="space-y-3">
              {treatments.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Nama Tindakan (misal: Nebulizer, Jahit Luka)"
                    value={item.action}
                    onChange={(e) => handleTreatmentChange(idx, "action", e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
                  />
                  {treatments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTreatment(idx)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: INPUT RESEP OBAT */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Resep Obat
              </h2>
              <button
                type="button"
                onClick={handleAddPrescription}
                className="flex items-center gap-1 text-xs font-medium text-slate-800 hover:text-slate-900 border border-slate-300 px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Obat
              </button>
            </div>

            <div className="space-y-3">
              {prescriptions.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Nama Obat"
                      value={item.medicine}
                      onChange={(e) => handlePrescriptionChange(idx, "medicine", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Dosis (misal: 500mg)"
                      value={item.dosage}
                      onChange={(e) => handlePrescriptionChange(idx, "dosage", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Aturan Pakai (misal: 3x1 Sehari)"
                      value={item.instruction}
                      onChange={(e) => handlePrescriptionChange(idx, "instruction", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePrescription(idx)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIMPAN BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving || !activeQueue}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 rounded-lg text-xs font-medium transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan Hasil Pemeriksaan"}
            </button>
          </div>
        </form>
      )}

      {/* KONTEN TAB 2: RIWAYAT PEMERIKSAAN PASIEN */}
      {activeTab === "history" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Riwayat Rekam Medis Pasien
            </h2>
            <span className="text-xs font-medium text-slate-600">
              {historyList.length} Rekam Medis Ditemukan
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs font-medium text-slate-500">
              Memuat riwayat rekam medis...
            </div>
          ) : historyList.length === 0 ? (
            <div className="py-8 text-center text-xs font-medium text-slate-500">
              Belum ada riwayat pemeriksaan untuk pasien ini.
            </div>
          ) : (
            <div className="space-y-4">
              {historyList.map((item, index) => (
                <div
                  key={item.id || index}
                  className="border border-slate-200 rounded-xl p-4 space-y-3 text-xs"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900">
                      Tanggal: {new Date(item.createdAt || item.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-slate-700 font-medium">
                      Dokter: {item.registration?.doctor?.name || item.registration?.doctor?.nama || "Dokter Pemeriksa"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-slate-500 font-medium">Subjective (Keluhan):</p>
                      <p className="font-semibold text-slate-900">{item.subjective || "-"}</p>
                    </div>

                    <div>
                      <p className="text-slate-500 font-medium">Objective (Vitals):</p>
                      <p className="font-semibold text-slate-900">
                        TD: {item.bloodPressure || "-"} | Suhu: {item.temperature || "-"}°C | BB: {item.weight || "-"}kg | TB: {item.height || "-"}cm
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 font-medium">Assessment (Diagnosa):</p>
                      <p className="font-semibold text-slate-900">{item.assessment || "-"}</p>
                    </div>

                    <div>
                      <p className="text-slate-500 font-medium">Plan (Rencana):</p>
                      <p className="font-semibold text-slate-900">{item.plan || "-"}</p>
                    </div>
                  </div>

                  {/* Resep & Tindakan Jika Ada */}
                  {item.actions?.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-slate-500 font-medium mb-1">Tindakan Medis:</p>
                      <ul className="list-disc list-inside text-slate-900 font-medium">
                        {item.actions.map((act, i) => (
                          <li key={i}>{act.action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.prescriptions?.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-slate-500 font-medium mb-1">Resep Obat:</p>
                      <ul className="list-disc list-inside text-slate-900 font-medium">
                        {item.prescriptions.map((p, i) => (
                          <li key={i}>
                            {p.medicine} {p.dosage} - ({p.instruction})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}