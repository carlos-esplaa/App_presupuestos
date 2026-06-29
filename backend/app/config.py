from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GOCARDLESS_SECRET_ID: str = ""
    GOCARDLESS_SECRET_KEY: str = ""
    GOCARDLESS_BASE_URL: str = "https://bankaccountdata.gocardless.com/api/v2"

    TELEGRAM_BOT_TOKEN: str = ""

    DATABASE_URL: str = "sqlite:///./data/finance.db"
    SYNC_INTERVAL_HOURS: int = 12
    EXPENSE_ALERT_THRESHOLD: float = 100.0
    SALARY_MIN_AMOUNT: float = 1500.0
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:4173"

    # URL pública del backend (para el redirect_url de GoCardless)
    PUBLIC_URL: str = "http://localhost:8000"

    # Autenticación JWT
    SECRET_KEY: str = "CAMBIA-ESTO-POR-UN-STRING-ALEATORIO-LARGO"
    APP_USERNAME: str = "admin"
    # Genera el hash con: python -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('tu_password'))"
    APP_PASSWORD_HASH: str = "$2b$12$placeholder_hash_change_me"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
