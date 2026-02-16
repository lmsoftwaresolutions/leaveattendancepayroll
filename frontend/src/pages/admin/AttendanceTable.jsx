export default function AttendanceTable({ data, onEdit, onDelete }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-sm text-gray-500">No attendance records</p>;
  }

  const minutesToHours = (m) => (m ? (m / 60).toFixed(2) : "0.00");

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">In</th>
            <th className="border p-2">Out</th>
            <th className="border p-2">Work (hrs)</th>
            <th className="border p-2">OT (hrs)</th>
            <th className="border p-2">Pay Day</th>
            <th className="border p-2">Day Salary</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row._id}>
              <td className="border p-2">{row.date}</td>
              <td className="border p-2">{row.status}</td>
              <td className="border p-2">{row.first_in || "--"}</td>
              <td className="border p-2">{row.last_out || "--"}</td>

              <td className="border p-2 text-right">
                {minutesToHours(row.work_minutes)}
              </td>

              <td className="border p-2 text-right text-green-700 font-semibold">
                {minutesToHours(row.overtime_minutes)}
              </td>

              <td className="border p-2 text-center font-semibold">
                {row.salary_day_count ?? 0}
              </td>
              <td className="border p-2 text-right font-semibold">
                ₹ {row.day_salary?.toFixed(2) ?? "0.00"}
              </td>

              <td className="border p-2 text-center space-x-3">
                <button
                  onClick={() => onEdit(row)}
                  className="text-blue-600 underline"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(row)}
                  className="text-red-600 underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
