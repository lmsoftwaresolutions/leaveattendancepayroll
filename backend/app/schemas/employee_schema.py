from pydantic import BaseModel, EmailStr
from datetime import date, time
from typing import Optional

class EmployeeWithUserCreateSchema(BaseModel):
    email: EmailStr
    password: str

    full_name: str
    designation: str
    department: str
    employment_type: str

    emp_code: Optional[str] = None

    shift: str
    shift_start_time: time
    shift_end_time: time
    total_duty_hours_per_day: float

    salary: float
    date_of_joining: date
