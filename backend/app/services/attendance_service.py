import json
import io
import requests
from bson import ObjectId
# from datetime import datetime, timedelta
from datetime import datetime, timedelta, date, time
from typing import Optional, Tuple

from calendar import monthrange
from fastapi import HTTPException, UploadFile

from app.core.config import settings
from app.database.mongo import db
from app.core.dates import get_all_dates_of_month, is_weekly_off

employees = db["employees"]
attendance_daily = db["attendance_daily"]

# ---------------- HELPERS ----------------

def count_work_days(in_dt: datetime, out_dt: datetime) -> int:
    """
    Counts how many calendar days are involved in the work period.
    """
    return max(1, (out_dt.date() - in_dt.date()).days + 1)


def parse_time(t: str):
    return datetime.strptime(t, "%H:%M").time()


def minutes_between(start: datetime, end: datetime):
    return max(0, int((end - start).total_seconds() / 60))



# ---------------- FETCH (EMPLOYEE + MONTH) ----------------

def get_attendance_by_employee(employee_id: str, month: str):
    year, mon = map(int, month.split("-"))

    start = datetime(year, mon, 1).date().isoformat()
    end = (
        datetime(year + 1, 1, 1).date().isoformat()
        if mon == 12
        else datetime(year, mon + 1, 1).date().isoformat()
    )

    records = attendance_daily.find({
        "employee_id": ObjectId(employee_id),
        "date": {"$gte": start, "$lt": end},
    }).sort("date", 1)

    result = []
    for r in records:
        r["_id"] = str(r["_id"])
        r["employee_id"] = str(r["employee_id"])
        result.append(r)

    return result


# ---------------- FETCH FROM BIOMETRIC API ----------------

def fetch_and_process_biometric(month: str):
    year, mon = month.split("-")
    last_day = monthrange(int(year), int(mon))[1]

    from_date = f"01/{mon}/{year}"
    to_date = f"{last_day}/{mon}/{year}"

    url = (
        f"{settings.BIOMETRIC_API_URL}"
        f"?Empcode=ALL&FromDate={from_date}&ToDate={to_date}"
    )

    headers = {
        "Authorization": f"Basic {settings.BIOMETRIC_API_TOKEN}",
        "Content-Type": "application/json",
    }

    response = requests.get(url, headers=headers, timeout=30)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Biometric API failed")

    data = response.json()

    fake_file = UploadFile(
        filename="biometric.json",
        file=io.BytesIO(json.dumps(data).encode()),
    )

    return process_biometric_upload(fake_file, month)


# ---------------- DELETE ATTENDANCE ----------------

def delete_attendance(attendance_id: str):
    result = attendance_daily.delete_one({"_id": ObjectId(attendance_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Attendance not found")

    return {"message": "Attendance deleted successfully"}


def calculate_overtime(work_minutes: int, shift_minutes: int):
    return max(0, work_minutes - shift_minutes)


def calculate_day_salary(monthly_salary: float, total_salary_days: int, salary_day_count: int):
    if total_salary_days == 0:
        return 0
    per_day = monthly_salary / total_salary_days
    return round(per_day * salary_day_count, 2)


def calculate_daily_rate(monthly_salary: float, year: int, month: int):
    if monthly_salary <= 0:
        return 0

    total_days = monthrange(year, month)[1]
    return round(monthly_salary / total_days, 2)

def get_monthly_payroll_summary(month: str):
    year, mon = map(int, month.split("-"))

    start = datetime(year, mon, 1).date().isoformat()
    end = (
        datetime(year + 1, 1, 1).date().isoformat()
        if mon == 12
        else datetime(year, mon + 1, 1).date().isoformat()
    )

    pipeline = [
        {
            "$match": {
                "date": {"$gte": start, "$lt": end}
            }
        },
        {
            "$group": {
                "_id": "$employee_id",
                "present": {
                    "$sum": {
                        "$cond": [
                            {"$regexMatch": {"input": "$status", "regex": "^PRESENT"}},
                            1,
                            0,
                        ]
                    }
                },
                "absent": {
                    "$sum": {
                        "$cond": [{"$eq": ["$status", "ABSENT"]}, 1, 0]
                    }
                },
                "working_days": {"$sum": "$salary_day_count"},
                "ot_minutes": {"$sum": "$overtime_minutes"},
                "total_salary": {"$sum": "$day_salary"},
            }
        },
    ]

    summary = list(attendance_daily.aggregate(pipeline))

    result = []
    for row in summary:
        emp = employees.find_one({"_id": row["_id"]})
        if not emp:
            continue

        result.append({
            "employee_id": str(emp["_id"]),
            "name": emp.get("full_name"),
            "present": row["present"],
            "absent": row["absent"],
            "working_days": row["working_days"],
            "ot_hours": round(row["ot_minutes"] / 60, 2),
            "total_salary": round(row["total_salary"], 2),
        })

    return result

def minutes_to_hours(m: int):
    return round(m / 60, 2)


def calculate_prorated_salary(work_minutes: int, shift_minutes: int, daily_rate: float):
    if shift_minutes <= 0:
        return 0
    ratio = min(work_minutes / shift_minutes, 1)
    return round(daily_rate * ratio, 2)


def calculate_ot_amount(ot_minutes: int, hourly_rate: float, multiplier: float = 1.5):
    return round((ot_minutes / 60) * hourly_rate * multiplier, 2)


def resolve_in_out_datetime(
    record_date: date,
    record: dict,
    shift_start: Optional[datetime.time] = None,
    shift_end: Optional[datetime.time] = None,
) -> Tuple[Optional[datetime], Optional[datetime]]:
    """
    Hybrid IN/OUT resolver.
    Supports BOTH:
    - old fields: first_in / last_out
    - new fields: in_datetime / out_datetime
    """

    # ---------- NEW DATETIME MODE ----------
    if record.get("in_datetime") and record.get("out_datetime"):
        try:
            return (
                datetime.fromisoformat(record["in_datetime"]),
                datetime.fromisoformat(record["out_datetime"]),
            )
        except Exception:
            pass  # fallback to old logic

    # ---------- OLD TIME-ONLY MODE ----------
    if record.get("first_in"):
        try:
            in_time = datetime.strptime(record["first_in"], "%H:%M").time()
            in_dt = datetime.combine(record_date, in_time)

            if record.get("last_out"):
                out_time = datetime.strptime(record["last_out"], "%H:%M").time()
                out_dt = datetime.combine(record_date, out_time)
                if out_dt < in_dt:
                    out_dt += timedelta(days=1)
            elif shift_end:
                out_dt = datetime.combine(record_date, shift_end)
                if shift_start and shift_end <= shift_start:
                    out_dt += timedelta(days=1)
            else:
                out_dt = in_dt

            return in_dt, out_dt
        except Exception:
            return None, None

    return None, None

def process_biometric_upload(file: UploadFile, month: str):
    try:
        raw = json.loads(file.file.read())
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON file")

    punch_data = raw.get("InOutPunchData")
    if not punch_data:
        raise HTTPException(status_code=400, detail="Invalid biometric JSON")

    year, mon = map(int, month.split("-"))
    all_dates = get_all_dates_of_month(year, mon)

    punches = {}

    # ---------- PARSE BIOMETRIC ----------
    for row in punch_data:
        emp_code = str(row.get("Empcode", "")).strip()
        if not emp_code:
            continue

        date_str = row.get("DateString")
        in_time = row.get("INTime")
        out_time = row.get("OUTTime")

        # No date → ignore
        if not date_str:
            continue

        # Partial or missing punch → IGNORE COMPLETELY
        if in_time == "--:--" or out_time == "--:--":
            continue

        punch_date = datetime.strptime(date_str, "%d/%m/%Y").date()
        in_dt = datetime.combine(punch_date, parse_time(in_time))
        out_dt = datetime.combine(punch_date, parse_time(out_time))

        # Overnight handling
        if out_dt < in_dt:
            out_dt += timedelta(days=1)

        punches[(emp_code, punch_date)] = (in_dt, out_dt)

    # ---------- PROCESS EMPLOYEES ----------
    for emp in employees.find({"is_active": True}):
        emp_code = str(emp.get("emp_code", "")).strip()
        if not emp_code:
            continue

        shift_start = parse_time(str(emp["shift_start_time"]))
        shift_end = parse_time(str(emp["shift_end_time"]))
        shift_minutes = int(emp["total_duty_hours_per_day"] * 60)

        monthly_salary = float(emp.get("salary", 0))
        daily_rate = calculate_daily_rate(monthly_salary, year, mon)

        for d in all_dates:
            date_str = d.isoformat()
            logs = punches.get((emp_code, d))

            existing = attendance_daily.find_one({
                "emp_code": emp_code,
                "date": date_str,
            })

            # Manual entry always wins
            if existing and existing.get("source") == "MANUAL":
                continue

            # ---------- WEEKLY OFF ----------
            if d.weekday() == 6 and not logs:
                attendance_daily.update_one(
                    {"employee_id": emp["_id"], "date": date_str},
                    {"$set": {
                        "employee_id": emp["_id"],
                        "emp_code": emp_code,
                        "date": date_str,
                        "status": "WEEKLY_OFF",
                        "work_minutes": 0,
                        "overtime_minutes": 0,
                        "salary_day_count": 1,
                        "day_salary": daily_rate,
                        "source": "BIOMETRIC",
                    }},
                    upsert=True,
                )
                continue

            # ---------- NO BIOMETRIC DATA ----------
            if not logs:
                attendance_daily.update_one(
                    {"employee_id": emp["_id"], "date": date_str},
                    {"$set": {
                        "employee_id": emp["_id"],
                        "emp_code": emp_code,
                        "date": date_str,
                        "status": "ABSENT",
                        "work_minutes": 0,
                        "overtime_minutes": 0,
                        "salary_day_count": 0,
                        "day_salary": 0,
                        "source": "BIOMETRIC",
                    }},
                    upsert=True,
                )
                continue

            # ---------- VALID BIOMETRIC (IN + OUT) ----------
            in_dt, out_dt = logs

            work_minutes = minutes_between(in_dt, out_dt)
            overtime_minutes = calculate_overtime(work_minutes, shift_minutes)
            expected_minutes = shift_minutes

            if work_minutes > expected_minutes:
                status = "PRESENT_OVERTIME"
            elif work_minutes == expected_minutes:
                status = "PRESENT_COMPLETE"
            else:
                status = "PRESENT_INCOMPLETE"

            attendance_daily.update_one(
                {"employee_id": emp["_id"], "date": date_str},
                {"$set": {
                    "employee_id": emp["_id"],
                    "emp_code": emp_code,
                    "date": date_str,
                    "first_in": in_dt.strftime("%H:%M"),
                    "last_out": out_dt.strftime("%H:%M"),
                    "in_datetime": in_dt.isoformat(),
                    "out_datetime": out_dt.isoformat(),
                    "work_minutes": work_minutes,
                    "overtime_minutes": overtime_minutes,
                    "status": status,
                    "salary_day_count": 1,
                    "day_salary": daily_rate,
                    "source": "BIOMETRIC",
                }},
                upsert=True,
            )

    return {"message": "Biometric attendance processed successfully"}


def edit_attendance_manual(
    attendance_id: str,
    in_datetime: str,
    out_datetime: str,
):
    record = attendance_daily.find_one({"_id": ObjectId(attendance_id)})
    if not record:
        raise HTTPException(status_code=404, detail="Attendance not found")

    # ---- Parse datetime ----
    try:
        in_dt = datetime.fromisoformat(in_datetime)
        out_dt = datetime.fromisoformat(out_datetime)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid datetime format")

    # ---- Overnight handling ----
    if out_dt <= in_dt:
        out_dt += timedelta(days=1)

    emp = employees.find_one({"_id": record["employee_id"]})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    shift_minutes = int(emp["total_duty_hours_per_day"] * 60)
    monthly_salary = float(emp.get("salary", 0))

    # ---- Work minutes ----
    work_minutes = int((out_dt - in_dt).total_seconds() / 60)

    # ---- Salary rate ----
    daily_rate = calculate_daily_rate(
        monthly_salary,
        in_dt.year,
        in_dt.month
    )

    # ---- OT ----
    overtime_minutes = max(0, work_minutes - shift_minutes)

    # ---- Status ----
    if work_minutes <= 0:
        status = "PRESENT_INCOMPLETE"
    elif work_minutes > shift_minutes:
        status = "PRESENT_OVERTIME"
    elif work_minutes == shift_minutes:
        status = "PRESENT_COMPLETE"
    else:
        status = "PRESENT_INCOMPLETE"

    # ---- Day salary (THIS FIXES YOUR ISSUE) ----
    if work_minutes <= 0:
        day_salary = 0
    elif work_minutes < shift_minutes:
        day_salary = calculate_prorated_salary(
            work_minutes,
            shift_minutes,
            daily_rate
        )
    else:
        day_salary = daily_rate

    attendance_daily.update_one(
        {"_id": ObjectId(attendance_id)},
        {"$set": {
            "first_in": in_dt.strftime("%H:%M"),
            "last_out": out_dt.strftime("%H:%M"),
            "in_datetime": in_dt.isoformat(),
            "out_datetime": out_dt.isoformat(),
            "work_minutes": work_minutes,
            "overtime_minutes": overtime_minutes,
            "day_salary": round(day_salary, 2),
            "status": status,
            "source": "MANUAL",
            "updated_at": datetime.utcnow(),
        }},
    )

    return {"message": "Attendance updated manually"}
