from pydantic import BaseModel

class AttendanceFetchSchema(BaseModel):
    month: str
