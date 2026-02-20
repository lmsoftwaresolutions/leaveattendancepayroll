import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";

export default function SuperAdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR (fixed) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-64
          bg-gradient-to-b from-gray-900 to-gray-800
          text-gray-100
          flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="px-6 py-5 text-xl font-bold border-b border-gray-700">
          Payroll Admin
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/superadmin" className="block px-4 py-2 rounded-lg hover:bg-white/10">
            Dashboard
          </Link>
          <Link to="/superadmin/create-admin" className="block px-4 py-2 rounded-lg hover:bg-white/10">
            Create Admin
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* CONTENT — PUSHED BY PADDING, NOT MARGIN */}
      <div className="pl-0 md:pl-64">
        {/* Mobile header */}
        <header className="md:hidden bg-white shadow px-4 py-3 flex items-center">
          <button onClick={() => setOpen(true)} className="text-2xl mr-3">
            ☰
          </button>
          <h1 className="font-semibold text-gray-700">Super Admin</h1>
        </header>

        <main className="p-6 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}