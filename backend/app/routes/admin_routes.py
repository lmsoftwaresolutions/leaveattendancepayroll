from fastapi import APIRouter, Depends
from app.middleware.role_guard import allow_roles
from app.core.constants import ROLE_ADMIN
from app.database.mongo import db
from app.schemas.employee_schema import EmployeeWithUserCreateSchema
from app.services.employee_service import create_employee_with_user
from bson import ObjectId
from fastapi import HTTPException
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

departments = db["departments"]
designations = db["designations"]

@router.delete("/departments/{dept_id}")
def delete_department(
    dept_id: str,
    user=Depends(allow_roles(ROLE_ADMIN))
):
    # 1️⃣ Find department
    dept = departments.find_one({"_id": ObjectId(dept_id)})

    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    dept_code = dept.get("code")

    # 2️⃣ Soft delete department
    departments.update_one(
        {"_id": ObjectId(dept_id)},
        {"$set": {"is_active": False}}
    )

    # 3️⃣ Soft delete related designations
    if dept_code:
        designations.update_many(
            {"department_code": dept_code},
            {"$set": {"is_active": False}}
        )

    return {
        "message": "Department and related designations deleted successfully"
    }

from bson import ObjectId
from fastapi import HTTPException
from app.database.mongo import db

designations = db["designations"]

@router.delete("/designations/{desig_id}")
def delete_designation(
    desig_id: str,
    user=Depends(allow_roles(ROLE_ADMIN))
):
    try:
        result = designations.update_one(
            {"_id": ObjectId(desig_id)},
            {"$set": {"is_active": False}}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid designation ID")

    # ✅ Do NOT block if already deleted
    if result.matched_count == 0:
        return {"message": "Designation already deleted"}

    return {"message": "Designation deleted successfully"}

@router.get("/employees/{emp_id}")
def get_employee_by_id(
    emp_id: str,
    user=Depends(allow_roles(ROLE_ADMIN))
):
    emp = db["employees"].find_one({"_id": ObjectId(emp_id)})

    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    emp["_id"] = str(emp["_id"])
    return emp
