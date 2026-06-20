from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://inventory:inventory@db:5432/inventory_db"
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost"
    jwt_secret: str = "change-this-secret-in-production-inventory-pro-2026"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7
    admin_email: str = "admin@inventory.pro"
    admin_password: str = "admin123"

    model_config = {"env_file": ".env", "extra": "ignore"}

settings = Settings()
