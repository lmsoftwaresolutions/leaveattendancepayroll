from pydantic import BaseModel

class DesignationCreateSchema(BaseModel):
    name: str
    department_code: str
