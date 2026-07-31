import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DashboardLayout = ({ title, children, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      <Sidebar onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header title={title} />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;