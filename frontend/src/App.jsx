import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MasterDataPasient  from "./pages/MasterDataPasien";
import PendaftaranPasien from "./pages/PendaftaranPasien";
import Antrian from "./pages/Antrian";
import PemeriksaanDokter from "./pages/PemeriksaanDokter";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <DashboardLayout title="Dashboard">
              <Dashboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/pasien"
          element={
            <DashboardLayout title="Master Data Pasien">
              <MasterDataPasient />
            </DashboardLayout>
          }
        />

        <Route
          path="/pendaftaran-pasien"
          element={
            <DashboardLayout title="Pendaftaran Pasien">
              <PendaftaranPasien />
            </DashboardLayout>
          }
        />

        <Route
          path="/antrean"
          element={
            <DashboardLayout title="Antrian Pasien">
              <Antrian />
            </DashboardLayout>
          }
        />

        <Route
          path="/pemeriksaan"
          element={
            <DashboardLayout title="Modul Pemeriksaan Dokter">
              <PemeriksaanDokter />
            </DashboardLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;