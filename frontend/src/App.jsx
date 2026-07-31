import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MasterDataPasient  from "./pages/MasterDataPasien";
import PendaftaranPasien from "./pages/PendaftaranPasien";
import DashboardAdmin from "./pages/DashboardAdmin";
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
              <DashboardAdmin />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;