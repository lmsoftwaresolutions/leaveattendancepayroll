from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # --- DATABASE ---
    MONGO_URL: str = "mongodb://mongo:27017"
    DB_NAME: str = "payroll_db"

    # --- AUTH ---
    JWT_SECRET: str = "super-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # --- BIOMETRIC API ---
    BIOMETRIC_API_URL: str
    BIOMETRIC_API_TOKEN: str

    class Config:
        env_file = ".env"


settings = Settings()
