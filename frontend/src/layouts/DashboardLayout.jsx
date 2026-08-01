import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DashboardLayout = ({ title, children, onLogout }) => {
  return (
    <div className="h-screen bg-slate-100 flex font-sans overflow-hidden">
      <Sidebar onLogout={onLogout} />

      <div className="flex-1 flex flex-col">
        <Header title={title} />

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
