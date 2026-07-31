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
const API_BASE_URL = "http://localhost:5000/api";

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

  // State Tindakan Medis (Array)
  const [treatments, setTreatments] = useState([
    { name: "", note: "" },
  ]);

  // State Resep Obat (Array)
  const [prescriptions, setPrescriptions] = useState([
    { medicineName: "", dosage: "", quantity: "", instruction: "" },
  ]);

  // 1. Fetch Daftar Antrean Pasien yang SIAP diperiksa (status CHECK_IN / WAITING)
  const fetchQueues = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/queues`);
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
    setTreatments([{ name: "", note: "" }]);
    setPrescriptions([{ medicineName: "", dosage: "", quantity: "", instruction: "" }]);

    // Fetch Riwayat Pasien jika ID Pasien tersedia
    const patientId = queueItem.registration?.patientId;
    if (patientId) {
      fetchPatientHistory(patientId);
    }
  };

  const fetchPatientHistory = async (patientId) => {
    setLoading(true);
    try {
      // Ganti URL endpoint sesuai API riwayat pemeriksaan Anda
      const res = await axios.get(`${API_BASE_URL}/examinations/patient/${patientId}`);
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
    setTreatments([...treatments, { name: "", note: "" }]);
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
      { medicineName: "", dosage: "", quantity: "", instruction: "" },
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
    const payload = {
      queueId: activeQueue.id,
      registrationId: activeQueue.registrationId,
      patientId: activeQueue.registration?.patientId,
      subjective: soap.subjective,
      objective: {
        bloodPressure: soap.bloodPressure,
        temperature: soap.temperature,
        weight: soap.weight,
        height: soap.height,
      },
      assessment: soap.assessment,
      plan: soap.plan,
      treatments: treatments.filter((t) => t.name.trim() !== ""),
      prescriptions: prescriptions.filter((p) => p.medicineName.trim() !== ""),
    };

    try {
      // Tembak endpoint simpan pemeriksaan
      const res = await axios.post(`${API_BASE_URL}/examinations`, payload);
      
      // Update status antrean menjadi DONE jika API mendukung
      await axios.put(`${API_BASE_URL}/queues/${activeQueue.id}/status`, {
        status: "DONE",
      });

      alert("Pemeriksaan pasien berhasil disimpan!");
      fetchQueues();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan data pemeriksaan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50/30 min-h-screen text-slate-800">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Pemeriksaan Dokter (SOAP)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Input data rekam medis, tindakan, serta resep obat pasien
          </p>
        </div>

        {/* Tab Navigasi Sederhana */}
        <div className="flex items-center gap-2 border border-slate-200 bg-white p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("examination")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "examination"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Form Pemeriksaan
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-slate-100"
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
          <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Pasien Terpilih</div>
            <div className="text-sm font-bold text-slate-900">
              {activeQueue
                ? activeQueue.registration?.patient?.name ||
                  activeQueue.registration?.patient?.nama
                : "Belum Ada Pasien Dipilih"}
            </div>
            {activeQueue && (
              <div className="text-xs text-slate-500">
                No. Antrean: <span className="font-semibold text-slate-800">{activeQueue.queueNumber}</span> • Poli:{" "}
                {activeQueue.registration?.polyclinic?.name || activeQueue.registration?.polyclinic?.nama || "-"}
              </div>
            )}
          </div>
        </div>

        {/* Dropdown Pasien Antrean */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs text-slate-500 whitespace-nowrap">Pilih Pasien:</label>
          <select
            value={activeQueue?.id || ""}
            onChange={(e) => {
              const selected = queueList.find((q) => q.id === Number(e.target.value));
              if (selected) selectPatient(selected);
            }}
            className="w-full md:w-64 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400 bg-white"
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
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
              Pemeriksaan SOAP
            </h2>

            {/* Subjective */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Subjective (Keluhan Pasien)
              </label>
              <textarea
                rows="2"
                value={soap.subjective}
                onChange={(e) => setSoap({ ...soap, subjective: e.target.value })}
                placeholder="Keluhan utama, riwayat penyakit saat ini..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-slate-400"
                required
              />
            </div>

            {/* Objective (Vital Signs) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Objective (Tanda-Tanda Vital)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Tekanan Darah</span>
                  <input
                    type="text"
                    placeholder="120/80 mmHg"
                    value={soap.bloodPressure}
                    onChange={(e) => setSoap({ ...soap, bloodPressure: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Suhu Tubuh (°C)</span>
                  <input
                    type="text"
                    placeholder="36.5"
                    value={soap.temperature}
                    onChange={(e) => setSoap({ ...soap, temperature: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Berat Badan (kg)</span>
                  <input
                    type="text"
                    placeholder="65"
                    value={soap.weight}
                    onChange={(e) => setSoap({ ...soap, weight: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Tinggi Badan (cm)</span>
                  <input
                    type="text"
                    placeholder="170"
                    value={soap.height}
                    onChange={(e) => setSoap({ ...soap, height: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Assessment */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Assessment (Diagnosa)
              </label>
              <textarea
                rows="2"
                value={soap.assessment}
                onChange={(e) => setSoap({ ...soap, assessment: e.target.value })}
                placeholder="Diagnosa utama, ICD-10, atau hasil observasi klinis..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-slate-400"
                required
              />
            </div>

            {/* Plan */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Plan (Rencana Terapi & Edukasi)
              </label>
              <textarea
                rows="2"
                value={soap.plan}
                onChange={(e) => setSoap({ ...soap, plan: e.target.value })}
                placeholder="Rencana tindakan, saran perawataan, atau instruksi pasien..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* SECTION 2: INPUT TINDAKAN MEDIS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tindakan Medis
              </h2>
              <button
                type="button"
                onClick={handleAddTreatment}
                className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg"
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
                    value={item.name}
                    onChange={(e) => handleTreatmentChange(idx, "name", e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Catatan / Biaya (Opsional)"
                    value={item.note}
                    onChange={(e) => handleTreatmentChange(idx, "note", e.target.value)}
                    className="w-1/3 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400"
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
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resep Obat
              </h2>
              <button
                type="button"
                onClick={handleAddPrescription}
                className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Obat
              </button>
            </div>

            <div className="space-y-3">
              {prescriptions.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Nama Obat"
                      value={item.medicineName}
                      onChange={(e) => handlePrescriptionChange(idx, "medicineName", e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Dosis (500mg)"
                      value={item.dosage}
                      onChange={(e) => handlePrescriptionChange(idx, "dosage", e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Jumlah (10 Tab)"
                      value={item.quantity}
                      onChange={(e) => handlePrescriptionChange(idx, "quantity", e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Aturan Pakai (3x1 Sehari)"
                      value={item.instruction}
                      onChange={(e) => handlePrescriptionChange(idx, "instruction", e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400"
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
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Riwayat Rekam Medis Pasien
            </h2>
            <span className="text-xs text-slate-400">
              {historyList.length} Rekam Medis Ditemukan
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Memuat riwayat rekam medis...
            </div>
          ) : historyList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
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
                    <span className="text-slate-500">
                      Dokter: {item.doctorName || "Dokter Pemeriksa"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-slate-400">Subjective (Keluhan):</p>
                      <p className="font-medium text-slate-800">{item.subjective || "-"}</p>
                    </div>

                    <div>
                      <p className="text-slate-400">Objective (Vitals):</p>
                      <p className="font-medium text-slate-800">
                        TD: {item.objective?.bloodPressure || "-"} | Suhu: {item.objective?.temperature || "-"}°C | BB: {item.objective?.weight || "-"}kg
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400">Assessment (Diagnosa):</p>
                      <p className="font-medium text-slate-800">{item.assessment || "-"}</p>
                    </div>

                    <div>
                      <p className="text-slate-400">Plan (Rencana):</p>
                      <p className="font-medium text-slate-800">{item.plan || "-"}</p>
                    </div>
                  </div>

                  {/* Resep & Tindakan Jika Ada */}
                  {item.treatments?.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-slate-400 mb-1">Tindakan Medis:</p>
                      <ul className="list-disc list-inside text-slate-700">
                        {item.treatments.map((t, i) => (
                          <li key={i}>{t.name} {t.note ? `(${t.note})` : ""}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.prescriptions?.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-slate-400 mb-1">Resep Obat:</p>
                      <ul className="list-disc list-inside text-slate-700">
                        {item.prescriptions.map((p, i) => (
                          <li key={i}>
                            {p.medicineName} {p.dosage} - {p.quantity} ({p.instruction})
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