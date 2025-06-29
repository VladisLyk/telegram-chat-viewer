from pydantic import BaseModel

class TelegramAdd(BaseModel):
    telegramID: str

from pydantic import constr
from typing import Annotated

class PhoneSchema(BaseModel):
    phone: Annotated[str, constr(pattern=r"^\+\d{10,15}$")]
    phone_code_hash: str | None = None
    code: str | None = None


class PasswordSchema(BaseModel):
    phone: str
    password: str