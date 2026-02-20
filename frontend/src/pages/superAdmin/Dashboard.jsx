export default function SuperAdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Super Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
        {/* Admins */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800">
            Admins
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Manage HR/Admin accounts
          </p>
        </div>

        {/* Employees */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800">
            Employees
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            View employee records
          </p>
        </div>

        {/* Payroll */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800">
            Payroll
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Salary & payroll overview
          </p>
        </div>
      </div>
    </div>
  );
}