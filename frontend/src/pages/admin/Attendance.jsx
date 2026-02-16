import { useEffect, useState } from "react";
import api from "../../api/axios";
import AttendanceTable from "./AttendanceTable";
import EditAttendanceModal from "./EditAttendanceModal";

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState("");
  const [file, setFile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);

  /* -------- LOAD EMPLOYEES -------- */
  useEffect(() => {
    api.get("/admin/employees").then((res) => {
      setEmployees(res.data);
    });
  }, []);

  /* -------- UPLOAD BIOMETRIC JSON -------- */
  const uploadJson = async () => {
    if (!file || !month) return alert("Select month and file");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("month", month);

    try {
      setLoading(true);
      await api.post("/admin/attendance/upload", fd);
      alert("Attendance uploaded successfully");
      setFile(null);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* -------- LOAD ATTENDANCE -------- */
  const loadAttendance = async () => {
    if (!employeeId || !month) {
      alert("Select employee and month");
      return;
    }

    setSelectedRow(null);

    const res = await api.get(
      `/admin/attendance?employee_id=${employeeId}&month=${month}`
    );

    setAttendance(res.data);
  };

  /* -------- FETCH FROM BIOMETRIC -------- */
  const fetchFromApi = async () => {
    if (!month) return alert("Select month");

    try {
      setLoading(true);
      await api.post("/admin/attendance/fetch", { month });
      alert("Biometric attendance fetched & stored");
    } catch (err) {
      alert("Failed to fetch biometric attendance");
    } finally {
      setLoading(false);
    }
  };

  /* -------- DELETE ATTENDANCE -------- */
  const deleteAttendance = async (row) => {
    const confirm = window.confirm(
      `Delete attendance for ${row.date}? This action cannot be undone.`
    );

    if (!confirm) return;

    try {
      await api.delete(`/admin/attendance/${row._id}`);
      loadAttendance();
    } catch (err) {
      alert("Failed to delete attendance");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance Management</h1>

      {/* -------- UPLOAD -------- */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <div className="flex gap-3 flex-wrap items-center">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="file"
            accept=".json"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            disabled={loading}
            onClick={uploadJson}
            className="bg-red-800 text-white px-4 py-2 rounded"
          >
            Upload Attendance
          </button>

          <button
            disabled={loading}
            onClick={fetchFromApi}
            className="bg-blue-800 text-white px-4 py-2 rounded"
          >
            Fetch from Biometric
          </button>
        </div>
      </div>

      {/* -------- VIEW -------- */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <div className="flex gap-3 flex-wrap items-center">
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Employee</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>
                {e.full_name}
              </option>
            ))}
          </select>

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={loadAttendance}
            className="bg-red-800 text-white px-4 py-2 rounded"
          >
            Load Attendance
          </button>
        </div>

        {attendance.length === 0 ? (
          <p className="text-sm text-gray-500">No attendance data</p>
        ) : (
          <AttendanceTable
            data={attendance}
            onEdit={(row) => setSelectedRow(row)}
            onDelete={deleteAttendance}
          />
        )}
      </div>

      {/* -------- EDIT MODAL -------- */}
      {selectedRow && (
        <EditAttendanceModal
          record={selectedRow}
          onClose={() => setSelectedRow(null)}
          onSaved={loadAttendance}
        />
      )}
    </div>
  );
}
