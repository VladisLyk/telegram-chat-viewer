from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.db import Base
from sqlalchemy import Boolean

class TelegramAccount(Base):
    __tablename__ = "telegram_accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    phone_number = Column(String, unique=True)
    phone_code_hash = Column(String)
    session_file = Column(String)
    user = relationship("User", back_populates="telegram_accounts")
    is_active = Column(Boolean, default=False)
