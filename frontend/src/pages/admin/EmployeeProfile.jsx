import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import api from "../../api/axios";
import AttendanceSalaryTable from "./AttendanceSalaryTable";

export default function EmployeeProfile() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const month = searchParams.get("month");

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  /* ===== LOAD EMPLOYEE PROFILE ===== */
  useEffect(() => {
    api
      .get(`/admin/employees/${id}`)
      .then((res) => setEmployee(res.data))
      .finally(() => setLoadingProfile(false));
  }, [id]);

  /* ===== LOAD ATTENDANCE ===== */
  useEffect(() => {
    if (!month) return;

    setLoadingAttendance(true);
    api
      .get(`/admin/attendance?employee_id=${id}&month=${month}`)
      .then((res) => setAttendance(res.data))
      .finally(() => setLoadingAttendance(false));
  }, [id, month]);

  if (loadingProfile) {
    return <div className="p-4 text-sm">Loading employee profile...</div>;
  }

  if (!employee) {
    return <div className="p-4 text-sm">Employee not found</div>;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Back */}
      <Link to="/admin" className="text-sm text-blue-600 underline">
        ← Back to Dashboard
      </Link>

      {/* ================= PROFILE ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* LEFT */}
        <div className="bg-white border rounded p-4 flex flex-col items-center text-center space-y-2">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
            {employee.full_name?.charAt(0)}
          </div>

          <div>
            <h1 className="text-base font-semibold">{employee.full_name}</h1>
            <p className="text-xs text-gray-500">
              {employee.designation || "-"}
            </p>
            <p className="text-[11px] text-gray-400">
              Employee Code: {employee.emp_code}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white border rounded p-4 md:col-span-3">
          <h2 className="text-base font-semibold mb-3">Employee Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Detail label="Department" value={employee.department} />
            <Detail label="Designation" value={employee.designation} />
            <Detail label="Salary" value={`₹ ${employee.salary}`} />
            <Detail
              label="Shift Time"
              value={`${employee.shift_start_time} - ${employee.shift_end_time}`}
            />
          </div>
        </div>
      </div>

      {/* ================= ATTENDANCE & SALARY ================= */}
      <div className="bg-white border rounded p-4 space-y-3">
        {loadingAttendance ? (
          <p className="text-sm text-gray-500">Loading attendance data...</p>
        ) : attendance.length === 0 ? (
          <p className="text-sm text-gray-500">
            No attendance records for this month
          </p>
        ) : (
          <AttendanceSalaryTable
            data={attendance}
            employeeName={employee.full_name}
            month={month}    
            shiftStart={employee.shift_start_time}
            shiftEnd={employee.shift_end_time}
            shiftHours={employee.total_duty_hours_per_day}
            monthlySalary={employee.salary}
          />
        )}
      </div>
    </div>
  );
}

/* ================= DETAIL COMPONENT ================= */
function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  );
}
