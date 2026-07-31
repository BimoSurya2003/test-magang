import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Clock, 
  CheckCircle2, 
  Stethoscope, 
  FileText, 
  Search, 
  Plus, 
  LogOut,
  LayoutDashboard,
  CalendarCheck,
  Building2,
  Trash2,
  Edit,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const DashboardAdmin = ({ onLogout }) => {
  // Navigation State
  const [activeMenu, setActiveMenu] = useState('antrean'); // 'dashboard' | 'antrean' | 'pasien' | 'dokter'

  // Master Data Dummy
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

  // Modals & Forms
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [newPatientForm, setNewPatientForm] = useState({ nik: '', nama: '', tglLahir: '', gender: 'Laki-laki', noHp: '', alamat: '' });
  const [newQueueForm, setNewQueueForm] = useState({ nama: '', nik: '', poli: 'Poli Umum', dokter: 'dr. Andi' });

  // Handlers
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
      jam: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setQueueList([...queueList, entry]);
    setIsQueueModalOpen(false);
    setNewQueueForm({ nama: '', nik: '', poli: 'Poli Umum', dokter: 'dr. Andi' });
  };

  const handleStatusChange = (id, newStatus) => {
    setQueueList(queueList.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleDeletePatient = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pasien ini?')) {
      setPatientsList(patientsList.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      
      {/* SIDEBAR NAVIGATION ADMIN */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shrink-0 hidden md:flex">
        <div className="p-5 border-b border-slate-700/60 flex items-center space-x-3">
          <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none">MINI <span className="text-teal-400">CLINIC</span></h1>
            <span className="text-[9px] text-slate-400 tracking-wider uppercase">Panel Admin Klinik</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveMenu('antrean')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'antrean' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Manajemen Antrean</span>
          </button>

          <button
            onClick={() => setActiveMenu('pasien')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'pasien' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Master Pasien</span>
          </button>

          <button
            onClick={() => setActiveMenu('dokter')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'dokter' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Jadwal Dokter & Poli</span>
          </button>
        </nav>

        {/* User Info Bottom Sidebar */}
        <div className="p-4 border-t border-slate-700/60 flex items-center justify-between bg-slate-900/40">
          <div className="text-xs">
            <p className="font-semibold text-slate-200">Administrator</p>
            <p className="text-[10px] text-teal-400">Loket & Registrasi</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* HEADER TOP */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-800">
              {activeMenu === 'antrean' && 'Manajemen Kunjungan & Antrean'}
              {activeMenu === 'pasien' && 'Master Data Pasien'}
              {activeMenu === 'dokter' && 'Pengelolaan Jadwal Dokter & Poliklinik'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsQueueModalOpen(true)}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Daftar Kunjungan</span>
            </button>
            <button
              onClick={() => setIsPatientModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Pasien Baru</span>
            </button>
          </div>
        </header>

        {/* BODY CONTENT */}
        <main className="p-6 space-y-6">
          
          {/* CARDS METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-3">
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase">Total Kunjungan</p>
                <p className="text-xl font-bold text-slate-800">{queueList.length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase">Menunggu</p>
                <p className="text-xl font-bold text-slate-800">{queueList.filter(q => q.status === 'Menunggu').length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase">Sedang Diperiksa</p>
                <p className="text-xl font-bold text-slate-800">{queueList.filter(q => q.status === 'Pemeriksaan').length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase">Total Pasien Terdaftar</p>
                <p className="text-xl font-bold text-slate-800">{patientsList.length}</p>
              </div>
            </div>
          </div>

          {/* VIEW MENU 1: ANTREAN */}
          {activeMenu === 'antrean' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari pasien / nomor antrean..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">No. Antrean</th>
                      <th className="py-3 px-4">Pasien</th>
                      <th className="py-3 px-4">NIK</th>
                      <th className="py-3 px-4">Poli & Dokter</th>
                      <th className="py-3 px-4">Jam Datang</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {queueList
                      .filter(q => q.nama.toLowerCase().includes(searchTerm.toLowerCase()) || q.noAntrean.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-teal-600">{item.noAntrean}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{item.nama}</td>
                        <td className="py-3 px-4 text-slate-400">{item.nik}</td>
                        <td className="py-3 px-4">
                          <div>{item.poli}</div>
                          <div className="text-[10px] text-slate-400">{item.dokter}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{item.jam} WIB</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Menunggu' ? 'bg-amber-100 text-amber-700' :
                            item.status === 'Pemeriksaan' ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center space-x-1">
                          {item.status === 'Menunggu' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'Pemeriksaan')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px]"
                            >
                              Panggil
                            </button>
                          )}
                          {item.status === 'Pemeriksaan' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'Selesai')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px]"
                            >
                              Selesaikan
                            </button>
                          )}
                          {item.status === 'Selesai' && (
                            <span className="text-slate-400 text-[10px] italic">Selesai</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MENU 2: MASTER PASIEN */}
          {activeMenu === 'pasien' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">NIK</th>
                      <th className="py-3 px-4">Nama Pasien</th>
                      <th className="py-3 px-4">Tgl Lahir</th>
                      <th className="py-3 px-4">Gender</th>
                      <th className="py-3 px-4">No. HP</th>
                      <th className="py-3 px-4">Alamat</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {patientsList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-600">{p.nik}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{p.nama}</td>
                        <td className="py-3 px-4">{p.tglLahir}</td>
                        <td className="py-3 px-4">{p.gender}</td>
                        <td className="py-3 px-4">{p.noHp}</td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{p.alamat}</td>
                        <td className="py-3 px-4 text-center space-x-2">
                          <button 
                            onClick={() => handleDeletePatient(p.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded" 
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MENU 3: DOKTER & POLI */}
          {activeMenu === 'dokter' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { nama: 'dr. Andi', poli: 'Poli Umum', jam: '08:00 - 14:00', status: 'Aktif' },
                { nama: 'drg. Sarah', poli: 'Poli Gigi', jam: '09:00 - 15:00', status: 'Aktif' },
                { nama: 'dr. Maya', poli: 'Poli KIA', jam: '10:00 - 16:00', status: 'Aktif' },
              ].map((doc, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 text-sm">{doc.nama}</h4>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{doc.status}</span>
                  </div>
                  <p className="text-xs text-teal-600 font-semibold">{doc.poli}</p>
                  <p className="text-xs text-slate-400">Praktik: {doc.jam}</p>
                </div>
              ))}
            </div>
          )}

        </main>
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