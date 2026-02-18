import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_employees: 0,
    admin_name: "",
  });

  // Payroll summary state
  const [month, setMonth] = useState("");
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data));
  }, []);

  /* -------- LOAD PAYROLL SUMMARY -------- */
  const loadPayrollSummary = async () => {
    if (!month) {
      alert("Please select a month");
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(
        `/admin/attendance/monthly-summary?month=${month}`,
      );
      setSummary(res.data);
    } catch (err) {
      alert("Failed to load payroll summary");
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-sm text-blue-700 font-semibold">Total Employees</p>
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

      {/* <div className="bg-white shadow rounded p-6">
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
      </div> */}

      {/* ================= PAYROLL SUMMARY ================= */}
      <div className="bg-white shadow rounded p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">
          Monthly Payroll Summary
        </h2>

        <div className="flex gap-3 items-center flex-wrap">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={loadPayrollSummary}
            className="bg-red-800 text-white px-4 py-2 rounded"
          >
            Load Summary
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading payroll data...</p>
        ) : summary.length === 0 ? (
          <p className="text-sm text-gray-500">
            No payroll data for selected month
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-center">Present</th>
                  <th className="border p-2 text-center">Absent</th>
                  <th className="border p-2 text-center">
                    Working Days <br />
                    <span className="text-sm">(Including Week-Offs)</span>
                  </th>
                  <th className="border p-2 text-right">OT (hrs)</th>
                  <th className="border p-2 text-right">Total Salary</th>
                  <th className="border p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row) => (
                  <tr key={row.employee_id}>
                    <td className="border p-2">{row.name}</td>
                    <td className="border p-2 text-center">{row.present}</td>
                    <td className="border p-2 text-center">{row.absent}</td>
                    <td className="border p-2 text-center">
                      {row.working_days}
                    </td>
                    <td className="border p-2 text-right">{row.ot_hours}</td>
                    <td className="border p-2 text-right font-semibold">
                      ₹ {row.total_salary}
                    </td>
                    <td className="border p-2 text-center">
                      <Link
                        to={`/admin/employees/${row.employee_id}?month=${month}`}
                        className="text-blue-600 underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
