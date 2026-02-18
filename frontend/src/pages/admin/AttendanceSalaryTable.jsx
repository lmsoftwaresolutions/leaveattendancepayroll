export default function AttendanceSalaryTable({
  data,
  shiftStart,
  shiftEnd,
  shiftHours,
  monthlySalary,
  otMultiplier = 1.5,
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-sm text-gray-500">No attendance records</p>;
  }

  /* ================= HELPERS ================= */

  const resolveInOutDateTime = (row) => {
    // NEW MODE
    if (row.in_datetime && row.out_datetime) {
      return {
        inDt: new Date(row.in_datetime),
        outDt: new Date(row.out_datetime),
      };
    }

    // OLD MODE
    if (row.first_in) {
      const inDt = new Date(`${row.date}T${row.first_in}`);
      let outDt = null;

      if (row.last_out) {
        outDt = new Date(`${row.date}T${row.last_out}`);
        if (outDt < inDt) outDt.setDate(outDt.getDate() + 1);
      } else if (shiftEnd) {
        outDt = new Date(inDt);
        outDt.setDate(outDt.getDate() + 1);
        const [hh, mm] = shiftEnd.split(":");
        outDt.setHours(hh, mm, 0, 0);
      }

      return { inDt, outDt };
    }

    return { inDt: null, outDt: null };
  };

  const getDaysInMonth = (dateStr) => {
    const [year, month] = dateStr.split("-");
    return new Date(year, month, 0).getDate();
  };

  /* ================= SALARY BASE ================= */

  const totalDaysInMonth = getDaysInMonth(data[0].date);
  const perDaySalary = monthlySalary / totalDaysInMonth;
  const perHourSalary = perDaySalary / shiftHours;

  /* ================= TOTALS ================= */

  let totalWorkHours = 0;
  let totalOTHours = 0;
  let totalBaseSalary = 0;
  let totalOTAmount = 0;

  const shiftTime =
    shiftStart && shiftEnd ? `${shiftStart} - ${shiftEnd}` : "--";

  return (
    <div className="overflow-x-auto space-y-4">
      <table className="w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">In</th>
            <th className="border p-2">Out</th>
            <th className="border p-2 text-right">Work (hrs)</th>
            <th className="border p-2 text-right">OT (hrs)</th>
            <th className="border p-2 text-right">Day Salary</th>
            <th className="border p-2 text-right">OT Amount</th>
            <th className="border p-2 text-center">Shift</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => {
            const { inDt: inDateTime, outDt: outDateTime } =
              resolveInOutDateTime(row);

            let workHours = 0;
            if (inDateTime && outDateTime && outDateTime > inDateTime) {
              workHours =
                (outDateTime.getTime() - inDateTime.getTime()) / 3600000;
            }

            let status = "Absent";
            if (workHours > 0 && workHours < shiftHours) {
              status = "Present-Incomplete";
            } else if (workHours >= shiftHours) {
              status =
                workHours > shiftHours
                  ? "Present-Overtime"
                  : "Present-Complete";
            }

            let daySalary = 0;
            if (status === "Present-Complete" || status === "Present-Overtime") {
              daySalary = perDaySalary;
            } else if (status === "Present-Incomplete") {
              daySalary = (workHours / shiftHours) * perDaySalary;
            }

            const otHours = Math.max(0, workHours - shiftHours);
            const otAmount = otHours * perHourSalary * otMultiplier;

            totalWorkHours += workHours;
            totalOTHours += otHours;
            totalBaseSalary += daySalary;
            totalOTAmount += otAmount;

            return (
              <tr key={row._id}>
                <td className="border p-2">{row.date}</td>
                <td className="border p-2 font-medium">{status}</td>
                <td className="border p-2">
                  {inDateTime ? inDateTime.toLocaleString() : "--"}
                </td>
                <td className="border p-2">
                  {outDateTime ? outDateTime.toLocaleString() : "--"}
                </td>
                <td className="border p-2 text-right">
                  {workHours.toFixed(2)}
                </td>
                <td className="border p-2 text-right text-green-700 font-semibold">
                  {otHours.toFixed(2)}
                </td>
                <td className="border p-2 text-right font-medium">
                  ₹ {daySalary.toFixed(2)}
                </td>
                <td className="border p-2 text-right text-green-700">
                  ₹ {otAmount.toFixed(2)}
                </td>
                <td className="border p-2 text-center">{shiftTime}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="bg-gray-100 border rounded p-4 text-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-medium">
          <div>Total Work Hours: {totalWorkHours.toFixed(2)}</div>
          <div>Total OT Hours: {totalOTHours.toFixed(2)}</div>
          <div>Base Salary: ₹ {totalBaseSalary.toFixed(2)}</div>
          <div className="text-green-800 font-bold">
            Net Salary: ₹ {(totalBaseSalary + totalOTAmount).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
