from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    google_api_key: str = ""
    azure_api_key: str = ""
    azure_region: str = ""
    class Config:
        env_file = ".env"
settings = Settings()