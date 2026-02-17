from datetime import datetime
from fastapi import HTTPException
from app.database.mongo import db
from bson import ObjectId
departments = db["departments"]


def create_department(data):
    if departments.find_one({"code": data.code, "is_active": True}):
        raise HTTPException(
            status_code=400,
            detail="Department code already exists"
        )

    departments.insert_one({
        "name": data.name,
        "code": data.code.upper(),
        "is_active": True,
        "created_at": datetime.utcnow()
    })

    return {"message": "Department created successfully"}


def list_departments():
    result = []
    for d in departments.find({"is_active": True}):
        d["_id"] = str(d["_id"])
        result.append(d)
    return result

def update_department(dept_id: str, data):
    data.pop("_id", None)

    result = departments.update_one(
        {"_id": ObjectId(dept_id), "is_active": True},
        {"$set": data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Department not found")

    return {"message": "Department updated successfully"}