from pydantic import BaseModel

class DepartmentCreateSchema(BaseModel):
    name: str
    code: str
