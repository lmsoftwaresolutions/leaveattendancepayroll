import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/employee/me")
      .then((res) => setProfile(res.data))
      .catch(() => alert("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {profile.full_name}
          </h1>
          <p className="text-gray-500">
            {profile.designation} · {profile.department}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-auto bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Logout
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded p-5">
          <p className="text-sm text-blue-700 font-semibold">
            Shift Timing
          </p>
          <p className="text-lg font-bold text-blue-900 mt-2">
            {profile.shift_start_time || "-"} – {profile.shift_end_time || "-"}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded p-5">
          <p className="text-sm text-green-700 font-semibold">
            Duty Hours / Day
          </p>
          <p className="text-2xl font-bold text-green-900 mt-2">
            {profile.total_duty_hours_per_day || "-"}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded p-5">
          <p className="text-sm text-purple-700 font-semibold">
            Monthly Salary
          </p>
          <p className="text-2xl font-bold text-purple-900 mt-2">
            ₹{profile.salary || 0}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white shadow rounded p-4 sm:p-6">
        <h2 className="text-lg font-bold mb-4">
          Employment Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <p><b>Employment Type:</b> {profile.employment_type}</p>
          <p>
            <b>Date of Joining:</b>{" "}
            {profile.date_of_joining
              ? new Date(profile.date_of_joining).toLocaleDateString()
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
