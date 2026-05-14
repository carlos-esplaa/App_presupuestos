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

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
