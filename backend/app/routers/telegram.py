from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils import telegram as tg_service
from app.database.models.user import User as UserModel
from app.utils.seucrity import get_current_user
from app.database.models.telegram_account import TelegramAccount
from app.database.db import get_db
from app.schemas.telegram import PhoneSchema, PasswordSchema

router = APIRouter()

@router.post("/connect/send-code")
async def send_telegram_code(body: PhoneSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    account = db.query(TelegramAccount).filter_by(phone_number=body.phone, user_id=current_user.id).first()
    if account and account.is_active:
        raise HTTPException(status_code=400, detail="Акаунт вже доданий до вашого профілю")

    if not account:
        account = TelegramAccount(phone_number=body.phone, user_id=current_user.id)
        db.add(account)
        db.commit()
        db.refresh(account)

    client = await tg_service.create_telegram_client()
    phone_code_hash, session = await tg_service.send_code(client, body.phone)

    account.session_file = session
    account.phone_code_hash = phone_code_hash
    db.commit()
    return {"message": "Код відправлено", "phone_code_hash": phone_code_hash}

@router.post("/connect/verify-code")
async def verify_telegram_code(body: PhoneSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    if not body.phone_code_hash:
        raise HTTPException(status_code=400, detail="phone_code_hash не може бути порожнім")
    account = db.query(TelegramAccount).filter_by(phone_number=body.phone, user_id=current_user.id).first()
    if not account or not account.session_file or not account.phone_code_hash:
        raise HTTPException(status_code=400, detail="Не знайдено сесію для цього номеру")

    client = await tg_service.create_telegram_client(account.session_file)
    session = await tg_service.sign_in_with_code(client, body.phone, account.phone_code_hash, body.code)

    account.session_file = session
    account.is_active = True
    db.commit()
    return {"message": "Акаунт підключено!", "account_id": account.id}


@router.post("/connect/verify-password")
async def verify_telegram_password(body: PasswordSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    account = db.query(TelegramAccount).filter_by(phone_number=body.phone, user_id=current_user.id).first()
    if not account or not account.session_file:
        raise HTTPException(status_code=400, detail="Не знайдено сесію для цього номеру")

    client = await tg_service.create_telegram_client(account.session_file)
    session = await tg_service.sign_in_with_password(client, body.password)

    account.session_file = session
    account.is_active = True
    db.commit()
    return {"message": "Акаунт підключено після введення пароля!", "account_id": account.id}


@router.get("/accounts")
async def list_telegram_accounts(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    return {"accounts": await tg_service.get_user_accounts(db, current_user)}

@router.get("/accounts/{account_id}/chats")
async def get_telegram_chats(account_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    account = db.query(TelegramAccount).filter_by(id=account_id, user_id=current_user.id).first()
    if not account or not account.session_file:
        raise HTTPException(status_code=400, detail="Не знайдено активної сесії для цього акаунта")
    client = await tg_service.create_telegram_client(account.session_file)
    return {"chats": await tg_service.get_chats(client)}

@router.get("/accounts/{account_id}/chats/{chat_id}/messages")
async def get_chat_messages(
    account_id: int,
    chat_id: int,
    limit: int = 50,
    offset_id: int = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    account = db.query(TelegramAccount).filter_by(id=account_id, user_id=current_user.id).first()
    if not account or not account.session_file:
        raise HTTPException(status_code=400, detail="Не знайдено активної сесії для цього акаунта")
    client = await tg_service.create_telegram_client(account.session_file)
    messages, total_count = await tg_service.get_messages(client, chat_id, limit=limit, offset_id=offset_id)
    return {"messages": messages, "total_count": total_count}


@router.get("/accounts/{account_id}/chats/{chat_id}/messages/{message_id}/media")
async def download_message_media(account_id: int, chat_id: int, message_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    account = db.query(TelegramAccount).filter_by(id=account_id, user_id=current_user.id).first()
    if not account or not account.session_file:
        raise HTTPException(status_code=400, detail="Не знайдено активної сесії для цього акаунта")
    client = await tg_service.create_telegram_client(account.session_file)
    return await tg_service.download_media(client, chat_id, message_id)

@router.delete("/accounts/{account_id}")
async def delete_telegram_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    account = db.query(TelegramAccount).filter_by(
        id=account_id,
        user_id=current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Акаунт не знайдено або не належить вам")

    await tg_service.delete_account(db, account, current_user)
    return {"message": f"Акаунт {account.phone_number} успішно видалено"}
