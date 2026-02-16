from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth_routes import router as auth_router
from app.routes.admin_routes import router as admin_router
from app.routes.employee_routes import router as employee_router
from app.routes.superadmin_routes import router as superadmin_router
from app.routes.attendance_routes import router as attendance_router
app = FastAPI(title="Payroll Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite frontend
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(employee_router)
app.include_router(superadmin_router)
app.include_router(attendance_router)

@app.get("/")
def health_check():
    return {"status": "OK"}
