from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # MongoDB Configuration
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "hushh_connect"
    
    # Application Settings
    APP_NAME: str = "Hush Connect API"
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()