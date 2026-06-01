from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://postgres:postgres@db:5432/inventory_db"
    cors_origins: str = "http://localhost:3000,http://frontend:3000"


settings = Settings()
