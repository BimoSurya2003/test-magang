import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Activity,
  ShieldCheck,
  Eye,
  EyeOff,
  Stethoscope,
} from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    navigate("/dashboard", { replace: true });
  }
}, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          username: formData.username,
          password: formData.password,
        },
      );

      const result = response.data;

      // Simpan token jika backend mengirim token
      if (result.data?.token) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }

      // alert(result.message);
      // console.log(result.data);

      navigate("/dashboard");
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Terjadi kesalahan pada server.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      {/* Container utama dengan grid 2 kolom di layar desktop */}
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Sisi Kiri: Branding System & Informasi Klinik */}
        <div className="bg-slate-800 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Aksen lingkaran dekoratif */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-600/20 rounded-full blur-2xl"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-xl"></div>

          <div>
            {/* Header / Logo System */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/40">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wide text-white">
                  MINI <span className="text-teal-400">CLINIC</span>
                </h1>
                <p className="text-xs text-slate-400 tracking-widest uppercase">
                  Information System
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-100 leading-tight">
                Sistem Informasi Pelayanan Klinik
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Solusi tata kelola pelayanan klinik terintegrasi. Membantu
                digitalisasi pencatatan data pasien, manajemen antrean, hingga
                rekam medis pemeriksaan dokter.
              </p>
            </div>
          </div>

          {/* Fitur Utama */}
          <div className="mt-8 pt-6 border-t border-slate-700/60 space-y-3">
            <div className="flex items-center space-x-3 text-slate-300 text-xs">
              <Activity className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Manajemen Antrean & Kunjungan Real-time</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Rekam Medis & Riwayat Pemeriksaan Terintegrasi</span>
            </div>
          </div>
        </div>

        {/* Sisi Kanan: Form Login */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">Selamat Datang</h3>
            <p className="text-slate-500 text-sm mt-1">
              Silakan masuk dengan akun petugas/dokter Anda.
            </p>
          </div>

          {/* Pesan Error */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg flex items-center">
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Masukkan username Anda"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan password Anda"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Opsi Tambahan */}
            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span>Ingat saya</span>
              </label>
              <a
                href="#forgot"
                className="text-teal-600 font-medium hover:underline"
              >
                Lupa Password?
              </a>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all disabled:opacity-70 flex justify-center items-center"
            >
              {isLoading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              ) : (
                "Masuk ke Sistem"
              )}
            </button>
          </form>

          {/* Footer Form */}
          <div className="mt-8 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Mini Clinic Information System.
            All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
