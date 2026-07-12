from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "TransitOps"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str | None = None
    POSTGRES_USER: str = "admin"
    POSTGRES_PASSWORD: str = "adminpassword"
    POSTGRES_SERVER: str = "127.0.0.1"
    POSTGRES_PORT: str = "5433"
    POSTGRES_DB: str = "transitops"

    SECRET_KEY: str = "super_secret_key_for_development_change_in_prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[2] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            # Ensure we use psycopg2 driver (replace any plain postgresql:// prefix)
            url = self.DATABASE_URL
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return url
        import urllib.parse
        encoded_password = urllib.parse.quote_plus(self.POSTGRES_PASSWORD)
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{encoded_password}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
