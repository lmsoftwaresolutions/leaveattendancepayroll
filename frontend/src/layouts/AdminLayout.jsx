import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";

export default function AdminLayout() {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 md:flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
    bg-red-900 text-white w-64
    fixed inset-y-0 left-0 z-40
    transform transition-transform duration-300
    flex flex-col               
    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
    md:static md:translate-x-0
  `}
      >
        <div className="p-4 text-xl font-bold border-b border-red-800">
          Admin Panel
        </div>

        <nav className="p-4 space-y-4">
          <Link to="/admin" className="block hover:text-red-300">
            Dashboard
          </Link>
          <Link
            to="/admin/department-designation" className="block hover:text-red-300">
            Department & Designation
          </Link>
          <Link
            to="/admin/create-employee"
            className="block hover:text-red-300"
          >
            Create Employee
          </Link>
          <Link to="/admin/employees" className="block hover:text-red-300">
            View Employees
          </Link>
          <Link to="/admin/attendance" className="block hover:text-red-300">
            Attendance
          </Link>
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={logout}
            className="w-full bg-red-700 hover:bg-red-600 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden bg-white shadow p-4 flex items-center">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-red-900 text-2xl"
          >
            ☰
          </button>
          <h1 className="ml-4 font-semibold">Admin</h1>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
