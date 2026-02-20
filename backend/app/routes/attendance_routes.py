from fastapi import APIRouter, Depends, UploadFile, File
from app.middleware.role_guard import allow_roles
from app.core.constants import ROLE_ADMIN
from app.schemas.attendance_schema import AttendanceFetchSchema
from app.services.attendance_service import delete_attendance
from fastapi import APIRouter, Body
from typing import Dict
from app.services.attendance_service import (
    process_biometric_upload,
    get_attendance_by_employee,
    fetch_and_process_biometric,
    edit_attendance_manual,
)

router = APIRouter(prefix="/admin/attendance", tags=["Attendance"])


@router.post("/upload")
def upload(
    file: UploadFile = File(...),
    month: str = "",
    user=Depends(allow_roles(ROLE_ADMIN)),
):
    return process_biometric_upload(file, month)


# @router.get("/")
@router.get("")
def fetch(
    employee_id: str,
    month: str,
    user=Depends(allow_roles(ROLE_ADMIN)),
):
    return get_attendance_by_employee(employee_id, month)


@router.post("/fetch")
def fetch_from_biometric(
    data: AttendanceFetchSchema,
    user=Depends(allow_roles(ROLE_ADMIN)),
):
    print("FETCH BIOMETRIC MONTH:", data.month)
    return fetch_and_process_biometric(data.month)

@router.get("/monthly-summary")
def monthly_summary(
    month: str,
    user=Depends(allow_roles(ROLE_ADMIN)),
):
    from app.services.attendance_service import get_monthly_payroll_summary
    return get_monthly_payroll_summary(month)

@router.put("/{attendance_id}")
def update_attendance(
    attendance_id: str,
    payload: Dict = Body(...),
    user=Depends(allow_roles(ROLE_ADMIN)),
):
    from app.services.attendance_service import edit_attendance_manual

    return edit_attendance_manual(
        attendance_id=attendance_id,
        in_datetime=payload.get("in_datetime"),
        out_datetime=payload.get("out_datetime"),
    )
