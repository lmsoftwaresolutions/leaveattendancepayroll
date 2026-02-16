import json
import io
import requests
from bson import ObjectId
from datetime import datetime, timedelta
from calendar import monthrange
from fastapi import HTTPException, UploadFile

from app.core.config import settings
from app.database.mongo import db
from app.core.dates import get_all_dates_of_month, is_weekly_off

employees = db["employees"]
attendance_daily = db["attendance_daily"]

# ---------------- HELPERS ----------------

def parse_time(t: str):
    return datetime.strptime(t, "%H:%M").time()


def minutes_between(start: datetime, end: datetime):
    return max(0, int((end - start).total_seconds() / 60))


# ---------------- BIOMETRIC UPLOAD ----------------
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

    # -------- PARSE BIOMETRIC DATA --------
    for row in punch_data:
        emp_code = str(row.get("Empcode", "")).strip()
        date_str = row.get("DateString")
        in_time = row.get("INTime")
        out_time = row.get("OUTTime")

        if not emp_code or in_time == "--:--" or out_time == "--:--":
            continue

        punch_date = datetime.strptime(date_str, "%d/%m/%Y").date()

        punches[(emp_code, punch_date)] = (
            datetime.combine(punch_date, parse_time(in_time)),
            datetime.combine(punch_date, parse_time(out_time)),
        )

    # -------- PROCESS EMPLOYEES --------
    for emp in employees.find({"is_active": True}):
        emp_code = str(emp.get("emp_code", "")).strip()
        if not emp_code:
            continue

        shift_start = parse_time(str(emp["shift_start_time"]))
        shift_end = parse_time(str(emp["shift_end_time"]))
        shift_minutes = int(emp["total_duty_hours_per_day"] * 60)

        monthly_salary = float(emp.get("salary", 0))
        daily_rate = calculate_daily_rate(monthly_salary)

        last_biometric_day = None

        for d in all_dates:
            date_str = d.isoformat()
            is_sunday = d.weekday() == 6
            logs = punches.get((emp_code, d))

            existing = attendance_daily.find_one({
                "emp_code": emp_code,
                "date": date_str,
            })

            # 🚫 DO NOT OVERRIDE MANUAL
            if existing and existing.get("source") == "MANUAL":
                continue

            # -------- SUNDAY WITHOUT PUNCH --------
            if is_sunday and not logs:
                attendance_daily.update_one(
                    {"emp_code": emp_code, "date": date_str},
                    {"$set": {
                        "employee_id": emp["_id"],
                        "emp_code": emp_code,
                        "date": date_str,
                        "status": "WEEKLY_OFF",
                        "first_in": "",
                        "last_out": "",
                        "work_minutes": 0,
                        "overtime_minutes": 0,
                        "late_minutes": 0,
                        "early_out_minutes": 0,
                        "salary_day_count": 1,
                        "day_salary": daily_rate,
                        "worked_on_weekly_off": False,
                        "source": "BIOMETRIC",
                    }},
                    upsert=True,
                )
                continue

            first_in = None
            last_out = None

            # -------- BIOMETRIC PRESENT --------
            if logs:
                first_in, last_out = logs
                last_biometric_day = d

            # -------- CONTINUATION DAY --------
            elif last_biometric_day and (d - last_biometric_day).days == 1:
                first_in = datetime.combine(d, shift_start)
                last_out = datetime.combine(d, shift_end)

            # -------- ABSENT --------
            else:
                attendance_daily.update_one(
                    {"emp_code": emp_code, "date": date_str},
                    {"$set": {
                        "employee_id": emp["_id"],
                        "emp_code": emp_code,
                        "date": date_str,
                        "status": "ABSENT",
                        "first_in": "",
                        "last_out": "",
                        "work_minutes": 0,
                        "overtime_minutes": 0,
                        "salary_day_count": 0,
                        "day_salary": 0,
                        "source": "BIOMETRIC",
                    }},
                    upsert=True,
                )
                continue

            work_minutes = minutes_between(first_in, last_out)
            overtime_minutes = calculate_overtime(work_minutes, shift_minutes)

            start_dt = datetime.combine(d, shift_start)
            end_dt = datetime.combine(
                d if shift_end > shift_start else d + timedelta(days=1),
                shift_end,
            )

            attendance_daily.update_one(
                {"emp_code": emp_code, "date": date_str},
                {"$set": {
                    "employee_id": emp["_id"],
                    "emp_code": emp_code,
                    "date": date_str,
                    "first_in": first_in.strftime("%H:%M"),
                    "last_out": last_out.strftime("%H:%M"),
                    "work_minutes": work_minutes,
                    "overtime_minutes": overtime_minutes,
                    "late_minutes": max(0, minutes_between(start_dt, first_in)),
                    "early_out_minutes": max(0, minutes_between(last_out, end_dt)),
                    "status": "PRESENT",
                    "salary_day_count": 1,
                    "day_salary": daily_rate,
                    "worked_on_weekly_off": is_sunday,
                    "source": "BIOMETRIC",
                }},
                upsert=True,
            )

    return {"message": "Biometric attendance processed successfully"}


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


# ---------------- EDIT ATTENDANCE ----------------
def edit_attendance(attendance_id: str, data: dict):
    record = attendance_daily.find_one({"_id": ObjectId(attendance_id)})
    if not record:
        raise HTTPException(status_code=404, detail="Attendance not found")

    status = data.get("status", "PRESENT")

    emp = employees.find_one({"_id": record["employee_id"]})
    monthly_salary = float(emp.get("salary", 0)) if emp else 0
    daily_rate = calculate_daily_rate(monthly_salary)

    # -------- ABSENT / WEEKLY OFF --------
    if status in ["ABSENT", "WEEKLY_OFF"]:
        salary_day_count = 1 if status == "WEEKLY_OFF" else 0

        attendance_daily.update_one(
            {"_id": ObjectId(attendance_id)},
            {"$set": {
                "status": status,
                "first_in": "",
                "last_out": "",
                "work_minutes": 0,
                "overtime_minutes": 0,
                "late_minutes": 0,
                "early_out_minutes": 0,
                "salary_day_count": salary_day_count,
                "day_salary": daily_rate if salary_day_count == 1 else 0,
                "worked_on_weekly_off": False,
                "source": "MANUAL",
            }},
        )
        return {"message": "Attendance updated successfully"}

    # -------- PRESENT --------
    if not data.get("first_in") or not data.get("last_out"):
        raise HTTPException(
            status_code=400,
            detail="first_in and last_out are required for PRESENT status",
        )

    try:
        first_in = datetime.strptime(data["first_in"], "%H:%M")
        last_out = datetime.strptime(data["last_out"], "%H:%M")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid time format. Use HH:MM",
        )

    shift_minutes = int(record.get("total_duty_hours_per_day", 8) * 60)

    work_minutes = minutes_between(first_in, last_out)
    overtime_minutes = calculate_overtime(work_minutes, shift_minutes)

    attendance_daily.update_one(
        {"_id": ObjectId(attendance_id)},
        {"$set": {
            "first_in": data["first_in"],
            "last_out": data["last_out"],
            "work_minutes": work_minutes,
            "overtime_minutes": overtime_minutes,
            "late_minutes": data.get("late_minutes", 0),
            "early_out_minutes": data.get("early_out_minutes", 0),
            "status": "PRESENT",
            "salary_day_count": 1,
            "day_salary": daily_rate,
            "worked_on_weekly_off": record.get("worked_on_weekly_off", False),
            "source": "MANUAL",
        }},
    )

    return {"message": "Attendance recalculated and updated"}

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

def calculate_daily_rate(monthly_salary: float):
    STANDARD_WORKING_DAYS = 26
    if monthly_salary <= 0:
        return 0
    return round(monthly_salary / STANDARD_WORKING_DAYS, 2)
