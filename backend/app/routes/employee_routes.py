from fastapi import APIRouter, Depends
from app.middleware.role_guard import allow_roles
from app.core.constants import ROLE_EMPLOYEE
from app.services.employee_service import get_my_employee_profile

router = APIRouter(
    prefix="/employee",
    tags=["Employee"]
)

@router.get("/me")
def employee_dashboard(
    user=Depends(allow_roles(ROLE_EMPLOYEE))
):
    return get_my_employee_profile(user)