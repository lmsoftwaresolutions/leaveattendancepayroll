from fastapi import HTTPException, status
from app.database.mongo import users_collection
from app.core.security import hash_password
from app.core.constants import ROLE_ADMIN

def create_admin_user(email: str, password: str):
    if users_collection.find_one({"email": email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )

    users_collection.insert_one({
        "email": email,
        "password": hash_password(password),
        "role": ROLE_ADMIN,
        "is_active": True
    })

    return {
        "message": "Admin created successfully",
        "email": email,
        "role": ROLE_ADMIN
    }
