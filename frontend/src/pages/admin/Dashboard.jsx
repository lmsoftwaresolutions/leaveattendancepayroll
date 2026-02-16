import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_employees: 0,
    admin_name: "",
  });

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data));
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div className="bg-white shadow rounded p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {stats.admin_name}
        </h1>
        <p className="text-gray-500 mt-1">
          Here’s what’s happening in your organization today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded p-5">
          <p className="text-sm text-blue-700 font-semibold">
            Total Employees
          </p>
          <p className="text-3xl font-bold text-blue-900 mt-2">
            {stats.total_employees}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded p-5">
          <p className="text-sm text-green-700 font-semibold">
            Active Employees
          </p>
          <p className="text-3xl font-bold text-green-900 mt-2">
            {stats.total_employees}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded p-5">
          <p className="text-sm text-purple-700 font-semibold">
            Payroll Status
          </p>
          <p className="text-lg font-semibold text-purple-900 mt-3">
            Not Generated
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/admin/create-employee"
            className="bg-red-800 hover:bg-red-700 text-white px-5 py-2 rounded"
          >
            + Create Employee
          </Link>

          <Link
            to="/admin/employees"
            className="border border-gray-300 hover:bg-gray-100 px-5 py-2 rounded"
          >
            View Employees
          </Link>
        </div>
      </div>
    </div>
  );
}
