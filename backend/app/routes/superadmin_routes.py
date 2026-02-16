from fastapi import APIRouter, Depends
from app.middleware.role_guard import allow_roles
from app.core.constants import ROLE_SUPER_ADMIN
from app.schemas.user_schema import AdminCreateSchema
from app.services.user_service import create_admin_user

router = APIRouter(
    prefix="/superadmin",
    tags=["SuperAdmin"]
)

@router.post("/create-admin")
def create_admin(
    data: AdminCreateSchema,
    user=Depends(allow_roles(ROLE_SUPER_ADMIN))
):
    return create_admin_user(
        email=data.email,
        password=data.password
    )
