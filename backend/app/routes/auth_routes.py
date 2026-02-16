from fastapi import APIRouter
from app.schemas.auth_schema import LoginSchema
from app.services.auth_service import authenticate_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
def login(data: LoginSchema):
    return authenticate_user(data.email, data.password)
