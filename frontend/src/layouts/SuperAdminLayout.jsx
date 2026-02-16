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
    <div className="min-h-screen flex bg-gray-100">
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-40
          w-64 h-screen
          bg-gray-800 text-gray-100
          flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Payroll Admin
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/superadmin"
            className="block px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Dashboard
          </Link>

          <Link
            to="/superadmin/create-admin"
            className="block px-4 py-2 rounded-lg hover:bg-gray-700"
          >
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="md:hidden bg-white shadow px-4 py-3 flex items-center">
          <button
            onClick={() => setOpen(true)}
            className="text-2xl mr-3"
          >
            ☰
          </button>
          <h1 className="font-semibold text-gray-700">
            Super Admin
          </h1>
        </header>

        <main className="flex-1 px-6 py-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
