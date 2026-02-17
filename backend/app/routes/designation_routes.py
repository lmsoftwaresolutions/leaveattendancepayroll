from fastapi import APIRouter, Depends, Query
from app.middleware.role_guard import allow_roles
from app.core.constants import ROLE_ADMIN
from app.schemas.designation_schema import DesignationCreateSchema
from app.services.designation_service import (
    create_designation,
    list_designations,
    update_designation
)

router = APIRouter(
    prefix="/admin/designations",
    tags=["Designations"]
)


@router.post("/")
def create(
    data: DesignationCreateSchema,
    user=Depends(allow_roles(ROLE_ADMIN))
):
    return create_designation(data)


@router.get("/")
def list_all(
    department_code: str = Query(None),
    user=Depends(allow_roles(ROLE_ADMIN))
):
    return list_designations(department_code)

@router.put("/{desig_id}")
def update(
    desig_id: str,
    data: dict,
    user=Depends(allow_roles(ROLE_ADMIN))
):
    return update_designation(desig_id, data)