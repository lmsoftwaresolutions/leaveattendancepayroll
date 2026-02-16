from pymongo import MongoClient
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

ROLE_SUPER_ADMIN = "SUPER_ADMIN"

client = MongoClient("mongodb://localhost:27017")
db = client["payroll_db"]
users_collection = db["users"]

users_collection.insert_one({
    "email": "superadmin@test.com",
    "password": hash_password("admin@123"),
    "role": ROLE_SUPER_ADMIN,
    "is_active": True
})

print("Super Admin inserted successfully")
