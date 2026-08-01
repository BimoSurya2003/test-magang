import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MasterDataPasient  from "./pages/MasterDataPasien";
import PendaftaranPasien from "./pages/PendaftaranPasien";
import Antrian from "./pages/Antrian";
import PemeriksaanDokter from "./pages/PemeriksaanDokter";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout title="Dashboard">
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Master Pasien */}
        <Route
          path="/pasien"
          element={
            <ProtectedRoute>
              <DashboardLayout title="Master Data Pasien">
                <MasterDataPasient />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Pendaftaran */}
        <Route
          path="/pendaftaran-pasien"
          element={
            <ProtectedRoute>
              <DashboardLayout title="Pendaftaran Pasien">
                <PendaftaranPasien />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Antrean */}
        <Route
          path="/antrean"
          element={
            <ProtectedRoute>
              <DashboardLayout title="Antrian Pasien">
                <Antrian />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Pemeriksaan */}
        <Route
          path="/pemeriksaan"
          element={
            <ProtectedRoute>
              <DashboardLayout title="Modul Pemeriksaan Dokter">
                <PemeriksaanDokter />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;