import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================= PDF GENERATOR ================= */

const generateSalarySlip = ({
  employeeName,
  month,
  totals,
  totalOTAmount,
  netSalary,
  dayCounts,
  shiftTime,
}) => {
  const doc = new jsPDF();

  /* ===== HEADER ===== */
  doc.setFontSize(16);
  doc.text("Palve Hospital", 14, 15);

  doc.setFontSize(12);
  doc.text("Salary Slip", 14, 24);

  doc.setFontSize(10);
  doc.text(`Employee: ${employeeName}`, 14, 34);
  doc.text(`Month: ${month}`, 14, 41);
  doc.text(`Shift: ${shiftTime}`, 14, 48);

  /* ===== EARNINGS TABLE ===== */
  autoTable(doc, {
    startY: 58,
    head: [["Earnings", "Amount (₹)"]],
    body: [
      ["Base Salary", totals.baseSalary.toFixed(2)],
      ["Overtime Amount", totalOTAmount.toFixed(2)],
      ["Net Salary", netSalary.toFixed(2)],
    ],
  });

  /* ===== ATTENDANCE TABLE ===== */
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Attendance Summary", "Value"]],
    body: [
      ["Total Work Hours", `${Math.floor(totals.workMinutes / 60)} hrs`],
      ["OT Hours", `${Math.floor(totals.otMinutes / 60)} hrs`],
      ["Present Days", dayCounts.present],
      ["Absent Days", dayCounts.absent],
    ],
  });

  doc.save(`Salary_Slip_${employeeName}_${month}.pdf`);
};

/* ================= MAIN COMPONENT ================= */

export default function AttendanceSalaryTable({
  data,
  employeeName,
  month,
  shiftStart,
  shiftEnd,
  shiftHours,
  otMultiplier = 1.5,
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-sm text-gray-500">No attendance records</p>;
  }

  /* ================= STATES ================= */

  const [editRow, setEditRow] = useState(null);
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [saving, setSaving] = useState(false);

  /* ================= HELPERS ================= */

  const toHHMM = (minutes = 0) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}:${String(mins).padStart(2, "0")}`;
  };

  const toDateTimeLocal = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate(),
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  /* ================= DERIVED DATA ================= */
  const shiftTime =
    shiftStart && shiftEnd ? `${shiftStart} - ${shiftEnd}` : "--";

  const totals = data.reduce(
    (acc, row) => {
      acc.workMinutes += row.work_minutes || 0;
      acc.otMinutes += row.overtime_minutes || 0;
      acc.baseSalary += row.day_salary || 0;
      return acc;
    },
    { workMinutes: 0, otMinutes: 0, baseSalary: 0 },
  );

  const totalOTAmount = data.reduce((sum, row) => {
    if (!row.overtime_minutes || row.overtime_minutes <= 0) return sum;
    const perHourRate = shiftHours > 0 ? (row.day_salary || 0) / shiftHours : 0;
    return sum + (row.overtime_minutes / 60) * perHourRate * otMultiplier;
  }, 0);

  const netSalary = totals.baseSalary + totalOTAmount;

  const dayCounts = data.reduce(
    (acc, row) => {
      if (
        row.status === "PRESENT_COMPLETE" ||
        row.status === "PRESENT_INCOMPLETE" ||
        row.status === "PRESENT_OVERTIME" ||
        row.status === "WEEKLY_OFF"
      ) {
        acc.present += 1;
      } else if (row.status === "ABSENT") {
        acc.absent += 1;
      }
      return acc;
    },
    { present: 0, absent: 0 },
  );

  /* ================= EDIT LOGIC ================= */

  const openEdit = (row) => {
    setEditRow(row);
    setInTime(toDateTimeLocal(row.in_datetime));
    setOutTime(toDateTimeLocal(row.out_datetime));
  };

  const handleSave = async () => {
    if (!inTime || !outTime) {
      alert("In and Out time required");
      return;
    }

    setSaving(true);

    const res = await fetch(`/api/admin/attendance/${editRow._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        in_datetime: inTime,
        out_datetime: outTime,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      alert(await res.text());
      return;
    }

    setEditRow(null);
    window.location.reload();
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-5">
      {/* ===== SUMMARY ===== */}
      {/* <h2 className="text-base font-semibold">
          Attendance & Salary ({month || "N/A"})
        </h2>
      <div className="flex justify-end">
          <button
            onClick={() =>
              generateSalarySlip({
                employeeName,
                month,
                totals,
                totalOTAmount,
                netSalary,
                dayCounts,
                shiftTime,
              })
            }
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded"
          >
            Download Salary Slip
          </button>
        </div> */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">
          Attendance & Salary ({month || "N/A"})
        </h2>

        <button
          onClick={() =>
            generateSalarySlip({
              employeeName,
              month,
              totals,
              totalOTAmount,
              netSalary,
              dayCounts,
              shiftTime,
            })
          }
          className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded"
        >
          Download Salary Slip
        </button>
      </div>
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
          <Summary
            label="Total Work Hours"
            value={toHHMM(totals.workMinutes)}
          />
          <Summary
            label="Total OT Hours"
            value={toHHMM(totals.otMinutes)}
            className="text-indigo-600"
          />
          <Summary
            label="Present Days"
            value={dayCounts.present}
            className="text-green-600"
          />
          <Summary
            label="Absent Days"
            value={dayCounts.absent}
            className="text-red-500"
          />
          <Summary
            label="Base Salary"
            value={`₹ ${totals.baseSalary.toFixed(2)}`}
          />
          <div className="lg:text-right">
            <p className="text-xs text-green-700 font-medium">Net Salary</p>
            <p className="text-xl font-bold text-green-800">
              ₹ {netSalary.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b p-2">Date</th>
              <th className="border-b p-2">Status</th>
              <th className="border-b p-2">In</th>
              <th className="border-b p-2">Out</th>
              <th className="border-b p-2 text-right">Work (hr)</th>
              <th className="border-b p-2 text-right">OT</th>
              <th className="border-b p-2 text-right">Day Amount</th>
              <th className="border-b p-2 text-right">OT Amount</th>
              <th className="border-b p-2 text-center">Shift Time</th>
              <th className="border-b p-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => {
              const perHourRate =
                shiftHours > 0 ? (row.day_salary || 0) / shiftHours : 0;

              const otAmount =
                ((row.overtime_minutes || 0) / 60) * perHourRate * otMultiplier;

              return (
                <tr key={row._id} className="hover:bg-gray-50">
                  <td className="border-b p-2">{row.date}</td>
                  <td className="border-b p-2 font-medium">{row.status}</td>
                  <td className="border-b p-2">
                    {row.in_datetime
                      ? row.in_datetime.replace("T", " ").slice(0, 16)
                      : "--"}
                  </td>
                  <td className="border-b p-2">
                    {row.out_datetime
                      ? row.out_datetime.replace("T", " ").slice(0, 16)
                      : "--"}
                  </td>
                  <td className="border-b p-2 text-right">
                    {toHHMM(row.work_minutes)}
                  </td>
                  <td className="border-b p-2 text-right text-green-700 font-semibold">
                    {toHHMM(row.overtime_minutes)}
                  </td>
                  <td className="border-b p-2 text-right font-medium">
                    ₹ {(row.day_salary || 0).toFixed(2)}
                  </td>
                  <td className="border-b p-2 text-right text-green-700">
                    ₹ {otAmount.toFixed(2)}
                  </td>
                  <td className="border-b p-2 text-center">{shiftTime}</td>
                  <td className="border-b p-2 text-center">
                    <button
                      onClick={() => openEdit(row)}
                      className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {editRow && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 space-y-4">
            <h3 className="font-semibold text-lg">Edit Attendance</h3>

            <div>
              <label className="text-sm">In Time</label>
              <input
                type="datetime-local"
                value={inTime}
                onChange={(e) => setInTime(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="text-sm">Out Time</label>
              <input
                type="datetime-local"
                value={outTime}
                onChange={(e) => setOutTime(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditRow(null)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 bg-green-600 text-white rounded"
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

/* ================= SUMMARY COMPONENT ================= */

function Summary({ label, value, className = "" }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-semibold ${className}`}>{value}</p>
    </div>
  );
}
