import React from "react";
import {
  Stethoscope,
  CalendarCheck,
  Users,
  Building2,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  FileText,
} from "lucide-react";
import { NavLink } from "react-router-dom";

// Menu disusun mengikuti ruang lingkup pada dokumen assignment (bagian D):
// Dashboard, Pendaftaran Pasien, Antrean, Master Data Pasien,
// Pemeriksaan Dokter (SOAP), Riwayat Rekam Medis, dan data pendukung Dokter & Poli.
// Kalau nanti sidebar ini dibedakan per role (Administrator / Dokter /
// Petugas Pendaftaran), tinggal filter array ini berdasarkan prop `role`
// sebelum di-map ke tombol.
const Sidebar = ({ onLogout }) => {
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/pendaftaran", label: "Pendaftaran Pasien", icon: ClipboardList },
    { path: "/antrean", label: "Manajemen Antrean", icon: CalendarCheck },
    { path: "/pasien", label: "Data Master Pasien", icon: Users },
    { path: "/pemeriksaan", label: "Pemeriksaan Dokter", icon: Stethoscope },
    { path: "/rekam-medis", label: "Riwayat Rekam Medis", icon: FileText },
    { path: "/dokter", label: "Master Dokter & Poli", icon: Building2 },
  ];

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col shrink-0 hidden md:flex">
      <div className="p-5 border-b border-slate-700/60 flex items-center space-x-3">
        <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-none">
            MINI <span className="text-teal-400">CLINIC</span>
          </h1>
          <span className="text-[9px] text-slate-400 tracking-wider uppercase">
            Panel Admin Klinik
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-700/50"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
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
  );
};

export default Sidebar;
