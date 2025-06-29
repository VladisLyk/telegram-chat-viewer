from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: float = 15
    TG_API_ID: int = 20830913
    TG_API_HASH: str = "ef60979ea294decc6ed9d16f79b4be43" 
    CSRF_SECRET: str = "super-secret-key"

    class Config:
        env_file = ".env" 

settings = Settings()