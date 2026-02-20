import { useState } from "react";
import api from "../../api/axios";

export default function CreateAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/superadmin/create-admin", { email, password });
    alert("Admin created successfully");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="flex justify-center items-start">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-100">
        {/* Header */}
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Create Admin (HR)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Create login credentials for a new HR admin
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                w-full px-4 py-2.5 rounded-lg border
                text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                focus:border-indigo-500
                transition
              "
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                w-full px-4 py-2.5 rounded-lg border
                text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                focus:border-indigo-500
                transition
              "
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="
              w-full mt-2 py-2.5 rounded-lg
              bg-indigo-600 text-white
              font-semibold text-sm
              hover:bg-indigo-700
              active:scale-[0.98]
              transition
            "
          >
            Create Admin
          </button>
        </form>
      </div>
    </div>
  );
}