import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  // const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonth = "2026-01"; // January 2026

  const [stats, setStats] = useState({
    total_employees: 0,
    admin_name: "",
  });

  const [month, setMonth] = useState(currentMonth);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data));
  }, []);

  useEffect(() => {
    if (month) {
      loadPayrollSummary();
    }
  }, [month]);

  /* -------- LOAD PAYROLL SUMMARY -------- */
  const loadPayrollSummary = async () => {
    if (!month) return;

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

  /* -------- AUTO LOAD CURRENT MONTH -------- */
  useEffect(() => {
    loadPayrollSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 space-y-5">
      {/* ================= WELCOME ================= */}
      <div className="bg-white border rounded-lg p-5">
        <h1 className="text-xl font-semibold text-gray-800">
          Welcome, {stats.admin_name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here’s what’s happening in your organization today.
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-700 font-medium">
            Total Employees
          </p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {stats.total_employees}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-green-700 font-medium">
            Active Employees
          </p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {stats.total_employees}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-purple-700 font-medium">
            Payroll Status
          </p>
          <p className="text-sm font-semibold text-purple-900 mt-2">
            Not Generated
          </p>
        </div>
      </div>

      {/* ================= PAYROLL SUMMARY ================= */}
      <div className="bg-white border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-base font-semibold text-gray-800">
            Monthly Payroll Summary
          </h2>

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm"
          />
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">
            Loading payroll data...
          </p>
        ) : summary.length === 0 ? (
          <p className="text-sm text-gray-500">
            No payroll data for selected month
          </p>
        ) : (
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b p-3 text-left font-medium">
                    Employee
                  </th>
                  <th className="border-b p-3 text-center font-medium">
                    Present
                    <div className="text-xs text-gray-400">
                      (Incl. Weekly Off)
                    </div>
                  </th>
                  <th className="border-b p-3 text-center font-medium">
                    Absent
                  </th>
                  <th className="border-b p-3 text-center font-medium">
                    Net Salary (₹)
                  </th>
                </tr>
              </thead>

              <tbody>
                {summary.map((row) => (
                  <tr
                    key={row.employee_id}
                    className="hover:bg-gray-50"
                  >
                    <td className="border-b p-3 font-medium text-blue-600">
                      <Link
                        to={`/admin/employees/${row.employee_id}?month=${month}`}
                        className="hover:underline"
                      >
                        {row.name}
                      </Link>
                    </td>

                    <td className="border-b p-3 text-center">
                      {row.present}
                    </td>

                    <td className="border-b p-3 text-center">
                      {row.absent}
                    </td>

                    <td className="border-b p-3 text-center font-semibold">
                      ₹ {Number(row.total_salary).toFixed(2)}
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
