import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function DepartmentDesignation() {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [deptForm, setDeptForm] = useState({ name: "", code: "" });
  const [desigForm, setDesigForm] = useState({ name: "", department_code: "" });

  const [editingDept, setEditingDept] = useState(null);
  const [editingDesig, setEditingDesig] = useState(null);

  const [loading, setLoading] = useState(false);

  /* -------- LOAD DATA -------- */
  const loadData = async () => {
    const [deptRes, desigRes] = await Promise.all([
      api.get("/admin/departments"),
      api.get("/admin/designations"),
    ]);
    setDepartments(deptRes.data);
    setDesignations(desigRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* -------- CREATE -------- */
  const createDepartment = async () => {
    if (!deptForm.name || !deptForm.code) return alert("Enter department details");

    try {
      setLoading(true);
      await api.post("/admin/departments", deptForm);
      setDeptForm({ name: "", code: "" });
      loadData();
    } finally {
      setLoading(false);
    }
  };

  const createDesignation = async () => {
    if (!desigForm.name || !desigForm.department_code)
      return alert("Enter designation details");

    try {
      setLoading(true);
      await api.post("/admin/designations", desigForm);
      setDesigForm({ name: "", department_code: "" });
      loadData();
    } finally {
      setLoading(false);
    }
  };

  /* -------- UPDATE -------- */
  const updateDepartment = async () => {
    await api.put(`/admin/departments/${editingDept._id}`, editingDept);
    setEditingDept(null);
    loadData();
  };

  const updateDesignation = async () => {
    await api.put(`/admin/designations/${editingDesig._id}`, editingDesig);
    setEditingDesig(null);
    loadData();
  };

  /* -------- DELETE -------- */
  const deleteDesignation = async (d) => {
    if (!window.confirm(`Delete "${d.name}"?`)) return;
    await api.delete(`/admin/designations/${d._id}`);
    loadData();
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <h2 className="text-xl font-bold text-red-900">
        Department & Designation Setup
      </h2>

      {/* ===== CREATE DEPARTMENT ===== */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <h3 className="font-semibold">Create Department</h3>

        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Department Name"
            value={deptForm.name}
            onChange={(e) =>
              setDeptForm({ ...deptForm, name: e.target.value })
            }
            className="border p-2 rounded w-full sm:w-64"
          />

          <input
            placeholder="Code"
            value={deptForm.code}
            onChange={(e) =>
              setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })
            }
            className="border p-2 rounded w-full sm:w-32"
          />

          <button
            onClick={createDepartment}
            disabled={loading}
            className="bg-red-800 text-white px-4 py-2 rounded"
          >
            Add Department
          </button>
        </div>
      </div>

      {/* ===== CREATE DESIGNATION ===== */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <h3 className="font-semibold">Create Designation</h3>

        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Designation Name"
            value={desigForm.name}
            onChange={(e) =>
              setDesigForm({ ...desigForm, name: e.target.value })
            }
            className="border p-2 rounded w-full sm:w-64"
          />

          <select
            value={desigForm.department_code}
            onChange={(e) =>
              setDesigForm({ ...desigForm, department_code: e.target.value })
            }
            className="border p-2 rounded w-full sm:w-48"
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>

          <button
            onClick={createDesignation}
            disabled={loading}
            className="bg-blue-700 text-white px-4 py-2 rounded"
          >
            Add Designation
          </button>
        </div>
      </div>

      {/* ===== SINGLE TABLE ===== */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Department & Designations</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Department</th>
                <th className="border px-3 py-2 text-left">Designation</th>
                <th className="border px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {designations.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                designations.map((d) => {
                  const dept = departments.find(
                    (dep) => dep.code === d.department_code
                  );

                  return (
                    <tr key={d._id}>
                      <td className="border px-3 py-2">
                        {dept?.name || d.department_code}
                      </td>
                      <td className="border px-3 py-2">{d.name}</td>
                      <td className="border px-3 py-2 text-center">
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => setEditingDesig(d)}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteDesignation(d)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== EDIT MODALS (UNCHANGED) ===== */}
      {editingDept && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-5 rounded w-[320px] space-y-3">
            <h4>Edit Department</h4>
            <input
              value={editingDept.name}
              onChange={(e) =>
                setEditingDept({ ...editingDept, name: e.target.value })
              }
              className="border p-2 w-full"
            />
            <input
              value={editingDept.code}
              onChange={(e) =>
                setEditingDept({
                  ...editingDept,
                  code: e.target.value.toUpperCase(),
                })
              }
              className="border p-2 w-full"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingDept(null)}>Cancel</button>
              <button
                onClick={updateDepartment}
                className="bg-red-800 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {editingDesig && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-5 rounded w-[320px] space-y-3">
            <h4>Edit Designation</h4>
            <input
              value={editingDesig.name}
              onChange={(e) =>
                setEditingDesig({ ...editingDesig, name: e.target.value })
              }
              className="border p-2 w-full"
            />
            <select
              value={editingDesig.department_code}
              onChange={(e) =>
                setEditingDesig({
                  ...editingDesig,
                  department_code: e.target.value,
                })
              }
              className="border p-2 w-full"
            >
              {departments.map((d) => (
                <option key={d._id} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingDesig(null)}>Cancel</button>
              <button
                onClick={updateDesignation}
                className="bg-blue-700 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
