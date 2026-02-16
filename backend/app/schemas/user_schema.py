from pydantic import BaseModel, EmailStr

class AdminCreateSchema(BaseModel):
    email: EmailStr
    password: str
