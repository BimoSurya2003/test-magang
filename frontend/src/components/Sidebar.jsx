import React, { useEffect, useState } from "react";
import {
  Stethoscope,
  CalendarCheck,
  Users,
  LogOut,
  LayoutDashboard,
  ClipboardList,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "PETUGAS", "DOKTER"],
    },
    {
      path: "/pendaftaran-pasien",
      label: "Pendaftaran Pasien",
      icon: ClipboardList,
      roles: ["ADMIN", "PETUGAS"],
    },
    {
      path: "/antrean",
      label: "Manajemen Antrean",
      icon: CalendarCheck,
      roles: ["ADMIN", "PETUGAS", "DOKTER"],
    },
    {
      path: "/pasien",
      label: "Data Master Pasien",
      icon: Users,
      roles: ["ADMIN", "PETUGAS"],
    },
    {
      path: "/pemeriksaan",
      label: "Pemeriksaan Dokter",
      icon: Stethoscope,
      roles: ["ADMIN", "DOKTER"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const roleLabel = {
    ADMIN: "Administrator",
    PETUGAS: "Registration Officer",
    DOKTER: "Doctor",
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/", { replace: true });
  };

  return (
    <aside className="w-64 h-screen bg-slate-800 text-white flex flex-col shrink-0 hidden md:flex">
      {/* Logo */}
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

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredMenuItems.map(({ path, label, icon: Icon }) => (
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

      {/* User */}
      <div className="mt-auto p-4 border-t border-slate-700/60 flex items-center justify-between bg-slate-900/40">
        <div className="text-xs">
          <p className="font-semibold text-slate-200">
            {roleLabel[user?.role] || "-"}
          </p>

          {/* 
          <p className="text-[10px] text-teal-400">
            {user?.username || ""}
          </p> 
          */}
        </div>

        <button
          onClick={handleLogout}
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