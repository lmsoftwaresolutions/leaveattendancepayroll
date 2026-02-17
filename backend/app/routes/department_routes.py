from fastapi import APIRouter, Depends
from app.middleware.role_guard import allow_roles
from app.core.constants import ROLE_ADMIN
from app.schemas.department_schema import DepartmentCreateSchema
from app.services.department_service import create_department, list_departments
from app.services.department_service import update_department
router = APIRouter(
    prefix="/admin/departments",
    tags=["Departments"]
)


@router.post("/")
def create(
    data: DepartmentCreateSchema,
    user=Depends(allow_roles(ROLE_ADMIN))
):
    return create_department(data)


@router.get("/")
def list_all(
    user=Depends(allow_roles(ROLE_ADMIN))
):
    return list_departments()

@router.put("/{dept_id}")
def update(
    dept_id: str,
    data: dict,
    user=Depends(allow_roles(ROLE_ADMIN))
):
    return update_department(dept_id, data)
