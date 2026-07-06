from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME: str = "Breakprout Server"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520  # 8 days

    DATABASE_URL: str

    FOURTYTWO_CLIENT_ID: str = ""
    FOURTYTWO_CLIENT_SECRET: str = ""
    FOURTYTWO_REDIRECT_URI: str = "https://localhost/api/v1/auth/42/callback"


settings = Settings()

