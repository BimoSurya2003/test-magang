import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// DashboardAdmin sekarang jadi "container": semua state tetap di sini,
// lalu dioper ke Sidebar / Header / Content lewat props. Modal form
// (kunjungan & pasien baru) sengaja dibiarkan di sini karena state-nya
// (form input) memang paling erat kaitannya dengan data induk.
const DashboardAdmin = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('antrean');

  const [patientsList, setPatientsList] = useState([
    { id: 1, nik: '3271012304900001', nama: 'Budi Santoso', tglLahir: '1990-04-12', gender: 'Laki-laki', noHp: '08123456789', alamat: 'Jl. Merdeka No. 12' },
    { id: 2, nik: '3271015508920003', nama: 'Siti Rahma', tglLahir: '1992-08-15', gender: 'Perempuan', noHp: '08567890123', alamat: 'Jl. Mawar No. 45' },
    { id: 3, nik: '3271014102880005', nama: 'Dewi Lestari', tglLahir: '1988-02-01', gender: 'Perempuan', noHp: '08198765432', alamat: 'Jl. Melati No. 8' },
  ]);

  const [queueList, setQueueList] = useState([
    { id: 1, noAntrean: 'A-001', nama: 'Budi Santoso', nik: '3271012304900001', poli: 'Poli Umum', dokter: 'dr. Andi', status: 'Pemeriksaan', jam: '08:30' },
    { id: 2, noAntrean: 'A-002', nama: 'Siti Rahma', nik: '3271015508920003', poli: 'Poli Gigi', dokter: 'drg. Sarah', status: 'Menunggu', jam: '08:45' },
    { id: 3, noAntrean: 'A-003', nama: 'Dewi Lestari', nik: '3271014102880005', poli: 'Poli Umum', dokter: 'dr. Andi', status: 'Menunggu', jam: '09:00' },
  ]);

  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newPatientForm, setNewPatientForm] = useState({ nik: '', nama: '', tglLahir: '', gender: 'Laki-laki', noHp: '', alamat: '' });
  const [newQueueForm, setNewQueueForm] = useState({ nama: '', nik: '', poli: 'Poli Umum', dokter: 'dr. Andi' });

  const handleAddPatient = (e) => {
    e.preventDefault();
    const entry = { id: Date.now(), ...newPatientForm };
    setPatientsList([...patientsList, entry]);
    setIsPatientModalOpen(false);
    setNewPatientForm({ nik: '', nama: '', tglLahir: '', gender: 'Laki-laki', noHp: '', alamat: '' });
  };

  const handleAddQueue = (e) => {
    e.preventDefault();
    const entry = {
      id: Date.now(),
      noAntrean: `A-00${queueList.length + 1}`,
      ...newQueueForm,
      status: 'Menunggu',
      jam: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setQueueList([...queueList, entry]);
    setIsQueueModalOpen(false);
    setNewQueueForm({ nama: '', nik: '', poli: 'Poli Umum', dokter: 'dr. Andi' });
  };

  const handleStatusChange = (id, newStatus) => {
    setQueueList(queueList.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
  };

  const handleDeletePatient = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pasien ini?')) {
      setPatientsList(patientsList.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header
          activeMenu={activeMenu}
          onOpenQueueModal={() => setIsQueueModalOpen(true)}
          onOpenPatientModal={() => setIsPatientModalOpen(true)}
        />

        <Content
          activeMenu={activeMenu}
          queueList={queueList}
          patientsList={patientsList}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleStatusChange={handleStatusChange}
          handleDeletePatient={handleDeletePatient}
        />
      </div>

      {/* MODAL: DAFTAR KUNJUNGAN/ANTREAN */}
      {isQueueModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-800 mb-4">Pendaftaran Kunjungan Pasien</h3>
            <form onSubmit={handleAddQueue} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Pilih / Nama Pasien</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Pasien"
                  value={newQueueForm.nama}
                  onChange={(e) => setNewQueueForm({ ...newQueueForm, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">NIK Pasien</label>
                <input
                  type="text"
                  required
                  placeholder="NIK Pasien"
                  value={newQueueForm.nik}
                  onChange={(e) => setNewQueueForm({ ...newQueueForm, nik: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Poli Tujuan</label>
                <select
                  value={newQueueForm.poli}
                  onChange={(e) => setNewQueueForm({ ...newQueueForm, poli: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  <option value="Poli Umum">Poli Umum</option>
                  <option value="Poli Gigi">Poli Gigi</option>
                  <option value="Poli KIA">Poli KIA</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQueueModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Simpan Antrean
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRASI PASIEN BARU */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-800 mb-4">Registrasi Master Pasien Baru</h3>
            <form onSubmit={handleAddPatient} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">NIK (Sesuai KTP)</label>
                <input
                  type="text"
                  required
                  placeholder="3271xxxx..."
                  value={newPatientForm.nik}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, nik: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nama Lengkap Pasien</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Pasien"
                  value={newPatientForm.nama}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Tgl Lahir</label>
                  <input
                    type="date"
                    required
                    value={newPatientForm.tglLahir}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, tglLahir: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Jenis Kelamin</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">No. Handphone/WhatsApp</label>
                <input
                  type="text"
                  required
                  placeholder="0812xxxx"
                  value={newPatientForm.noHp}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, noHp: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Alamat Domisili</label>
                <textarea
                  rows="2"
                  placeholder="Alamat lengkap..."
                  value={newPatientForm.alamat}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, alamat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPatientModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Simpan Pasien Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;