import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const currentMonth = "2026-01";

  const [stats, setStats] = useState({
    total_employees: 0,
    admin_name: "",
  });

  const [month, setMonth] = useState(currentMonth);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD STATS ================= */
  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data));
  }, []);

  /* ================= PAYROLL CALC (SOURCE OF TRUTH) ================= */
  const calculatePayrollFromAttendance = (
    attendance,
    shiftHours,
    otMultiplier = 1.5
  ) => {
    let baseSalary = 0;
    let present = 0;
    let absent = 0;

    attendance.forEach((row) => {
      baseSalary += row.day_salary || 0;

      if (
        row.status === "PRESENT_COMPLETE" ||
        row.status === "PRESENT_INCOMPLETE" ||
        row.status === "PRESENT_OVERTIME" ||
        row.status === "WEEKLY_OFF"
      ) {
        present += 1;
      } else if (row.status === "ABSENT") {
        absent += 1;
      }
    });

    const otAmount = attendance.reduce((sum, row) => {
      if (!row.overtime_minutes) return sum;

      const perHourRate =
        shiftHours > 0 ? (row.day_salary || 0) / shiftHours : 0;

      return sum + (row.overtime_minutes / 60) * perHourRate * otMultiplier;
    }, 0);

    return {
      present,
      absent,
      netSalary: baseSalary + otAmount,
    };
  };

  /* ================= LOAD DASHBOARD PAYROLL ================= */
  const loadDashboardPayroll = async () => {
    if (!month) return;

    try {
      setLoading(true);

      // 1️⃣ Load employees
      const empRes = await api.get("/admin/employees");
      const employees = empRes.data || [];

      // 2️⃣ Attendance-based payroll (same logic as salary table)
      const payrollRows = await Promise.all(
        employees.map(async (emp) => {
          const attRes = await api.get(
            `/admin/attendance?employee_id=${emp._id}&month=${month}`
          );

          const attendance = attRes.data || [];

          const payroll = calculatePayrollFromAttendance(
            attendance,
            emp.total_duty_hours_per_day
          );

          return {
            employee_id: emp._id,
            name: emp.full_name,
            present: payroll.present,
            absent: payroll.absent,
            netSalary: payroll.netSalary,
          };
        })
      );

      setRows(payrollRows);
    } catch (err) {
      alert("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardPayroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

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
          <p className="text-xs text-blue-700 font-medium">Total Employees</p>
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
          <p className="text-xs text-purple-700 font-medium">Payroll Status</p>
          <p className="text-sm font-semibold text-purple-900 mt-2">
            Calculated from Attendance
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
            Calculating payroll…
          </p>
        ) : rows.length === 0 ? (
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
                {rows.map((row) => (
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
                      ₹ {row.netSalary.toFixed(2)}
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