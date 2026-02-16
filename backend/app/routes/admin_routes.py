from fastapi import APIRouter, Depends
from app.middleware.role_guard import allow_roles
from app.core.constants import ROLE_ADMIN
from app.database.mongo import db
from app.schemas.employee_schema import EmployeeWithUserCreateSchema
from app.services.employee_service import create_employee_with_user
from app.services.employee_service import (
    list_all_employees,
    update_employee,
    delete_employee
)
from app.services.employee_service import get_employee_count

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

@router.get("/dashboard")
def admin_dashboard(
    user=Depends(allow_roles(ROLE_ADMIN))
):
    return {
        "message": "Admin access granted",
        "user": user["email"]
    }

users_collection = db["users"]

# 

@router.get("/employees")
def get_employees(user=Depends(allow_roles(ROLE_ADMIN))):
    return list_all_employees()


@router.put("/employees/{emp_id}")
def edit_employee(
    emp_id: str,
    data: dict,
    user=Depends(allow_roles(ROLE_ADMIN))
):
    return update_employee(emp_id, data)


@router.delete("/employees/{emp_id}")
def remove_employee(
    emp_id: str,
    user=Depends(allow_roles(ROLE_ADMIN))
):
    return delete_employee(emp_id)


@router.post("/create-employee")
def create_employee(
    data: EmployeeWithUserCreateSchema,
    user=Depends(allow_roles(ROLE_ADMIN))
):
    return create_employee_with_user(data)

@router.get("/stats")
def admin_stats(user=Depends(allow_roles(ROLE_ADMIN))):
    return {
        "total_employees": get_employee_count(),
        "admin_name": user["email"]
    }