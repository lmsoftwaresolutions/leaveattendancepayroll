import { useState } from "react";
import api from "../../api/axios";

export default function EditEmployeeModal({ employee, onClose, onUpdated }) {
  const [form, setForm] = useState({
    ...employee,
    emp_code: employee.emp_code || "",
    shift_start_hour: employee.shift_start_time?.split(":")[0] || "",
    shift_start_minute: employee.shift_start_time?.split(":")[1] || "",
    shift_end_hour: employee.shift_end_time?.split(":")[0] || "",
    shift_end_minute: employee.shift_end_time?.split(":")[1] || "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const {
      _id,
      email,
      user_id,
      shift_start_hour,
      shift_start_minute,
      shift_end_hour,
      shift_end_minute,
      ...rest
    } = form;

    const payload = {
      ...rest,
      shift_start_time: `${shift_start_hour}:${shift_start_minute}`,
      shift_end_time: `${shift_end_hour}:${shift_end_minute}`,
    };

    await api.put(`/admin/employees/${employee._id}`, payload);

    onUpdated();
    onClose();
  };

  const hours = [...Array(24)].map((_, i) => String(i).padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[420px]">
        <h3 className="font-bold mb-4 text-lg">Edit Employee</h3>

        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
          placeholder="Full Name"
        />

        <input
          name="designation"
          value={form.designation}
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
          placeholder="Designation"
        />

        <input
          name="department"
          value={form.department}
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
          placeholder="Department"
        />

        <input
          name="salary"
          type="number"
          value={form.salary}
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
          placeholder="Salary"
        />

        <input
          name="emp_code"
          value={form.emp_code || ""}
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
          placeholder="Emp Code (must match biometric machine code)"
        />

        <input
          name="shift"
          value={form.shift}
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
          placeholder="Shift Name"
        />

        {/* Shift Timings */}
        <p className="text-sm font-semibold text-gray-700 mt-3 mb-1">
          Shift Timings (24-hour format)
        </p>

        <div className="flex gap-2 mb-2">
          <select
            name="shift_start_hour"
            value={form.shift_start_hour}
            onChange={handleChange}
            className="border p-2 rounded w-1/2"
          >
            <option value="">Start HH</option>
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <select
            name="shift_start_minute"
            value={form.shift_start_minute}
            onChange={handleChange}
            className="border p-2 rounded w-1/2"
          >
            <option value="">MM</option>
            {minutes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mb-2">
          <select
            name="shift_end_hour"
            value={form.shift_end_hour}
            onChange={handleChange}
            className="border p-2 rounded w-1/2"
          >
            <option value="">End HH</option>
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <select
            name="shift_end_minute"
            value={form.shift_end_minute}
            onChange={handleChange}
            className="border p-2 rounded w-1/2"
          >
            <option value="">MM</option>
            {minutes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <input
          name="total_duty_hours_per_day"
          type="number"
          step="0.5"
          value={form.total_duty_hours_per_day}
          onChange={handleChange}
          className="border p-2 w-full mb-4 rounded"
          placeholder="Duty Hours / Day"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-red-800 text-white px-4 py-1 rounded"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
