import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";

export default function AdminLayout() {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          bg-[#119bd7] text-white w-64
          fixed inset-y-0 left-0 z-40
          transform transition-transform duration-300
          flex flex-col
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="p-4 text-xl font-bold border-b border-white/20">
          Palve Hospital
        </div>

        <nav className="p-4 space-y-4 overflow-y-auto">
          <Link to="/admin" className="block hover:text-blue-100">
            Dashboard
          </Link>

          <Link
            to="/admin/department-designation"
            className="block hover:text-blue-100"
          >
            Department & Designation
          </Link>

          <Link
            to="/admin/create-employee"
            className="block hover:text-blue-100"
          >
            Create Employee
          </Link>

          <Link to="/admin/employees" className="block hover:text-blue-100">
            View Employees
          </Link>

          <Link to="/admin/attendance" className="block hover:text-blue-100">
            Attendance
          </Link>
        </nav>

        <div className="p-4 mt-auto border-t border-white/20">
          <button
            onClick={logout}
            className="w-full bg-white text-[#119bd7] font-semibold py-2 rounded
             hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================= CONTENT ================= */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        {/* Mobile header */}
        <header className="md:hidden bg-white shadow p-4 flex items-center shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-[#119bd7] text-2xl"
          >
            ☰
          </button>
          <h1 className="ml-4 font-semibold">Admin</h1>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
