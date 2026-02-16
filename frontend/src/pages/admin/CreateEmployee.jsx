import { useState } from "react";
import api from "../../api/axios";

export default function CreateEmployee() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    designation: "",
    department: "",
    employment_type: "",
    shift: "",
    shift_start_hour: "",
    shift_start_minute: "",
    shift_end_hour: "",
    shift_end_minute: "",
    total_duty_hours_per_day: "",
    salary: "",
    date_of_joining: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email: form.email,
      password: form.password,
      full_name: form.full_name,
      designation: form.designation,
      department: form.department,
      employment_type: form.employment_type,
      shift: form.shift,
      salary: Number(form.salary),
      total_duty_hours_per_day: Number(form.total_duty_hours_per_day),
      date_of_joining: form.date_of_joining,
      shift_start_time: `${form.shift_start_hour}:${form.shift_start_minute}`,
      shift_end_time: `${form.shift_end_hour}:${form.shift_end_minute}`,
    };

    await api.post("/admin/create-employee", payload);
    alert("Employee created successfully");
  };

  const hours = [...Array(24)].map((_, i) =>
    String(i).padStart(2, "0")
  );
  const minutes = ["00", "15", "30", "45"];

  return (
    <div className="max-w-2xl bg-white shadow rounded p-6">
      <h2 className="text-xl font-bold mb-4 text-red-900">
        Create Employee
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        {/* Login details */}
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        {/* Basic details */}
        <input
          name="full_name"
          placeholder="Full Name"
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="designation"
          placeholder="Designation"
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          name="department"
          placeholder="Department"
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="employment_type"
          placeholder="Employment Type (Full Time / Part Time)"
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="emp_code"
          placeholder="Emp Code (must match biometric machine code)"
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
          required
        />
        <input
          name="shift"
          placeholder="Shift Name (Morning / Night)"
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="salary"
          type="number"
          placeholder="Monthly Salary"
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        {/* Shift timing info */}
        <div className="col-span-2">
          <p className="text-sm font-semibold text-gray-700">
            Shift Timings (24-hour format)
          </p>
          <p className="text-xs text-gray-500 mb-2">
            Used for attendance, late entry, overtime and payroll calculations.
          </p>
        </div>

        {/* Shift Start */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Shift Start Time
          </label>
          <div className="flex gap-2">
            <select
              name="shift_start_hour"
              onChange={handleChange}
              className="border p-2 rounded w-1/2"
              required
            >
              <option value="">HH</option>
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            <select
              name="shift_start_minute"
              onChange={handleChange}
              className="border p-2 rounded w-1/2"
              required
            >
              <option value="">MM</option>
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Shift End */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Shift End Time
          </label>
          <div className="flex gap-2">
            <select
              name="shift_end_hour"
              onChange={handleChange}
              className="border p-2 rounded w-1/2"
              required
            >
              <option value="">HH</option>
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            <select
              name="shift_end_minute"
              onChange={handleChange}
              className="border p-2 rounded w-1/2"
              required
            >
              <option value="">MM</option>
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duty hours */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            Total Duty Hours Per Day
          </label>
          <input
            name="total_duty_hours_per_day"
            type="number"
            step="0.5"
            placeholder="e.g. 8 or 7.5"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Date of joining */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            Date of Joining
          </label>
          <input
            name="date_of_joining"
            type="date"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <button className="col-span-2 bg-red-800 hover:bg-red-700 text-white py-2 rounded font-semibold">
          Create Employee
        </button>
      </form>
    </div>
  );
}
