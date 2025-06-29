from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from jwt import InvalidTokenError
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserOut, UserWithToken, UserLogin
from app.database.models.user import User as UserModel
from app.database.db import get_db
from app.utils.seucrity import jwt_decode, hash_password, verify_password, get_current_user, create_access_token, create_refresh_token
from fastapi.responses import JSONResponse
from datetime import timedelta
from app.schemas.token import Token
from app.config import settings

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserOut)
async def register(body: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(UserModel).filter(UserModel.username == body.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Користувач уже існує")

    user = UserModel(
        username=body.username,
        email=body.email,
        hashed_password=hash_password(body.hashed_password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=UserWithToken)
async def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Невірне ім’я користувача або пароль")

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    refresh_token = create_refresh_token(
        data={"sub": user.username},
        expires_delta=timedelta(days=7),
    )

    response = JSONResponse(
        content={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "telegram_accounts": [],
            "access_token": access_token,
            "token_type": "bearer",
        }
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="strict",
        max_age=15 * 60,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="strict",
        max_age=7 * 24 * 60 * 60,
    )

    return response

@router.post("/refresh", response_model=Token)
async def refresh_access_token(request: Request, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is missing")

    try:
        payload = jwt_decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    except InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    user = db.query(UserModel).filter(UserModel.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="strict",
        max_age=15 * 60,
    )

    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: UserModel = Depends(get_current_user)):
    return current_user

@router.post("/logout")
async def logout():
    response = JSONResponse(content={"message": "Успішний вихід"})
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return response