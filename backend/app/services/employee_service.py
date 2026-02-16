from datetime import datetime, time
from fastapi import HTTPException, status
from bson import ObjectId
from app.database.mongo import db
from app.core.security import hash_password
from app.core.constants import ROLE_EMPLOYEE

users_collection = db["users"]
employees_collection = db["employees"]


# ADMIN → CREATE EMPLOYEE
def create_employee_with_user(data):
    if users_collection.find_one({"email": data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Create USER
    user = {
        "email": data.email,
        "password": hash_password(data.password),
        "role": ROLE_EMPLOYEE,
        "is_active": True,
        "created_at": datetime.utcnow()
    }

    user_result = users_collection.insert_one(user)

    # Create EMPLOYEE
    employee = {
        "user_id": str(user_result.inserted_id),
        "full_name": data.full_name,
        "designation": data.designation,
        "department": data.department,
        "employment_type": data.employment_type,

        "emp_code": data.emp_code,

        "shift": data.shift,
        "shift_start_time": data.shift_start_time.strftime("%H:%M"),
        "shift_end_time": data.shift_end_time.strftime("%H:%M"),
        "total_duty_hours_per_day": data.total_duty_hours_per_day,

        "salary": data.salary,
        "date_of_joining": datetime.combine(data.date_of_joining, time.min),

        "is_active": True,
        "created_at": datetime.utcnow()
    }

    employees_collection.insert_one(employee)

    return {"message": "Employee created successfully"}

# def get_my_employee_profile(user):
#     employee = employees_collection.find_one(
#         {"user_id": str(user["_id"]), "is_active": True}
#     )

#     if not employee:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Employee profile not found"
#         )

#     return {
#         "full_name": employee["full_name"],
#         "designation": employee["designation"],
#         "department": employee["department"],
#         "employment_type": employee["employment_type"],
#         "shift": employee["shift"],
#         "shift_start_time": employee["shift_start_time"],
#         "shift_end_time": employee["shift_end_time"],
#         "total_duty_hours_per_day": employee["total_duty_hours_per_day"],
#         "salary": employee["salary"],
#         "date_of_joining": employee["date_of_joining"].isoformat()
#     }


def list_all_employees():
    pipeline = [
        {
            "$match": {"is_active": True}
        },
        {
            "$addFields": {
                "user_obj_id": {"$toObjectId": "$user_id"}
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "user_obj_id",
                "foreignField": "_id",
                "as": "user"
            }
        },
        {"$unwind": "$user"},
        {
            "$project": {
                "_id": {"$toString": "$_id"},
                "full_name": 1,
                "designation": 1,
                "department": 1,
                "employment_type": 1,
                "emp_code": 1,
                "salary": 1,
                "shift": 1,
                "shift_start_time": 1,
                "shift_end_time": 1,
                "total_duty_hours_per_day": 1,
                "email": "$user.email"
            }
        }
    ]

    return list(employees_collection.aggregate(pipeline))

def update_employee(emp_id: str, data: dict):
    data.pop("_id", None)        
    data.pop("email", None)     
    data.pop("user_id", None)    

    result = employees_collection.update_one(
        {"_id": ObjectId(emp_id), "is_active": True},
        {"$set": data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")

    return {"message": "Employee updated successfully"}


def delete_employee(emp_id: str):
    employees_collection.update_one(
        {"_id": ObjectId(emp_id)},
        {"$set": {"is_active": False}}
    )
    return {"message": "Employee deleted successfully"}

def get_employee_count():
    return employees_collection.count_documents({"is_active": True})

from fastapi import HTTPException, status
from app.database.mongo import db

employees_collection = db["employees"]


def get_my_employee_profile(user):
    employee = employees_collection.find_one(
        {"user_id": str(user["_id"]), "is_active": True}
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found"
        )

    return {
        "full_name": employee.get("full_name", ""),
        "designation": employee.get("designation", ""),
        "department": employee.get("department", ""),
        "employment_type": employee.get("employment_type", ""),
        "shift": employee.get("shift", ""),
        "shift_start_time": employee.get("shift_start_time", ""),
        "shift_end_time": employee.get("shift_end_time", ""),
        "total_duty_hours_per_day": employee.get("total_duty_hours_per_day", 0),
        "salary": employee.get("salary", 0),

        "date_of_joining": (
            employee["date_of_joining"].isoformat()
            if employee.get("date_of_joining")
            else None
        )
    }
