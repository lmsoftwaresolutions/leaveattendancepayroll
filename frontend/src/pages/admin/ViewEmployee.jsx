import { useEffect, useState } from "react";
import api from "../../api/axios";
import EditEmployeeModal from "./EditEmployeeModal";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);

  const loadEmployees = () => {
    api.get("/admin/employees").then(res => setEmployees(res.data));
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const deleteEmployee = async (id) => {
    if (!confirm("Are you sure?")) return;
    await api.delete(`/admin/employees/${id}`);
    loadEmployees();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Employees</h2>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Designation</th>
            <th className="border p-2">Salary</th>
            <th className="border p-2">Shift</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map(emp => (
            <tr key={emp._id}>
              <td className="border p-2">{emp.full_name}</td>
              <td className="border p-2">{emp.email}</td>
              <td className="border p-2">{emp.designation}</td>
              <td className="border p-2">₹{emp.salary}</td>
              <td className="border p-2">
                {emp.shift_start_time} - {emp.shift_end_time}
              </td>
              <td className="border p-2 flex gap-2">
                <button
                  onClick={() => setSelected(emp)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEmployee(emp._id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <EditEmployeeModal
          employee={selected}
          onClose={() => setSelected(null)}
          onUpdated={loadEmployees}
        />
      )}
    </div>
  );
}
