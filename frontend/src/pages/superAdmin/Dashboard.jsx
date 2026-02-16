export default function SuperAdminDashboard() {
  return (
    <div className="w-full text-left">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Super Admin Dashboard
      </h1>

      {/* Cards */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          
          {/* Admins */}
          <div className="w-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-800">
              Admins
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Manage HR/Admin accounts
            </p>
          </div>

          {/* Employees */}
          <div className="w-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-800">
              Employees
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              View employee records
            </p>
          </div>

          {/* Payroll */}
          <div className="w-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-800">
              Payroll
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Salary & payroll overview
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
