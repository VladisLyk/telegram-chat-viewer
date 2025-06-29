from pydantic import BaseModel, EmailStr
from app.schemas.token import Token

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    hashed_password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    # telegram_accounts: list[str] | None = None

    class Config:
        from_attributes = True

class UserWithToken(UserOut, Token):
    pass