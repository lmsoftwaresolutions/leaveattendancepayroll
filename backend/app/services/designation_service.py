from datetime import datetime
from fastapi import HTTPException
from app.database.mongo import db
from bson import ObjectId

designations = db["designations"]
departments = db["departments"]


def create_designation(data):
    if not departments.find_one({"code": data.department_code, "is_active": True}):
        raise HTTPException(
            status_code=400,
            detail="Invalid department code"
        )

    if designations.find_one({
        "name": data.name,
        "department_code": data.department_code,
        "is_active": True
    }):
        raise HTTPException(
            status_code=400,
            detail="Designation already exists for this department"
        )

    designations.insert_one({
        "name": data.name,
        "department_code": data.department_code,
        "is_active": True,
        "created_at": datetime.utcnow()
    })

    return {"message": "Designation created successfully"}


def list_designations(department_code: str = None):
    query = {"is_active": True}
    if department_code:
        query["department_code"] = department_code

    result = []
    for d in designations.find(query):
        d["_id"] = str(d["_id"])
        result.append(d)
    return result

def update_designation(desig_id: str, data):
    data.pop("_id", None)

    result = designations.update_one(
        {"_id": ObjectId(desig_id), "is_active": True},
        {"$set": data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Designation not found")

    return {"message": "Designation updated successfully"}