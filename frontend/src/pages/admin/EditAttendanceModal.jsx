import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function EditAttendanceModal({ record, onClose, onSaved }) {
  if (!record) return null;

  const [form, setForm] = useState({
    status: "PRESENT",
    first_in: "",
    last_out: "",
  });

  useEffect(() => {
    if (record) {
      setForm({
        status: record.status ?? "PRESENT",
        first_in: record.first_in ?? "",
        last_out: record.last_out ?? "",
      });
    }
  }, [record]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "status" && value !== "PRESENT") {
      setForm({
        status: value,
        first_in: "",
        last_out: "",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/admin/attendance/${record._id}`, form);
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to save attendance");
    }
  };

  const isPresent = form.status.startsWith("PRESENT");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[400px] space-y-3">
        <h2 className="text-lg font-bold">Edit Attendance</h2>

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >
          <option value="PRESENT_COMPLETE">Present (Full Day)</option>
          <option value="PRESENT_INCOMPLETE">Present (Partial)</option>
          <option value="PRESENT_OVERTIME">Present (Overtime)</option>

          <option value="ABSENT">Absent</option>
          <option value="WEEKLY_OFF">Weekly Off</option>
        </select>

        <input
          type="time"
          name="first_in"
          value={form.first_in}
          onChange={handleChange}
          disabled={!isPresent}
          className={`border p-2 w-full rounded ${
            !isPresent ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        />

        <input
          type="time"
          name="last_out"
          value={form.last_out}
          onChange={handleChange}
          disabled={!isPresent}
          className={`border p-2 w-full rounded ${
            !isPresent ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        />

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="border px-4 py-1 rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-red-800 text-white px-4 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
