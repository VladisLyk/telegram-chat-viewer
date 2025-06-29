from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.types import User, Chat, Channel
from fastapi import HTTPException
from app.config import settings
import io
from fastapi.responses import StreamingResponse
from app.database.models import TelegramAccount

async def create_telegram_client(session_string=None):
    return TelegramClient(
        StringSession(session_string) if session_string else StringSession(),
        settings.TG_API_ID,
        settings.TG_API_HASH,
    )

async def send_code(client, phone):
    await client.connect()
    try:
        sent = await client.send_code_request(phone)
        session = client.session.save()
        return sent.phone_code_hash, session
    except Exception as e:
        print(f"[ERROR] Помилка надсилання коду: {e}")
        raise HTTPException(status_code=500, detail="Не вдалося надіслати код. Спробуйте ще раз.")
    finally:
        await client.disconnect()

async def sign_in_with_code(client, phone, phone_code_hash, code):
    await client.connect()
    try:
        await client.sign_in(phone=phone, code=code, phone_code_hash=phone_code_hash)
        session = client.session.save()
        return session
    except Exception as e:
        if "two-steps verification" in str(e).lower():
            print("[INFO] Потрібен пароль для двоетапної перевірки.")
            raise HTTPException(status_code=400, detail="Потрібен пароль для двоетапної перевірки.")
        else:
            print(f"[ERROR] Помилка підтвердження коду: {e}")
            raise HTTPException(status_code=500, detail="Не вдалося підтвердити код. Перевірте правильність введених даних.")
    finally:
        await client.disconnect()

async def sign_in_with_password(client, password):
    await client.connect()
    try:
        await client.sign_in(password=password)
        session = client.session.save()
        return session
    except Exception as e:
        print(f"[ERROR] Помилка підтвердження пароля: {e}")
        raise HTTPException(status_code=500, detail="Не вдалося підтвердити пароль. Перевірте правильність введених даних.")
    finally:
        await client.disconnect()

async def get_chats(client):
    await client.connect()
    try:
        dialogs = []
        async for dialog in client.iter_dialogs():
            entity = dialog.entity
            if isinstance(entity, (User, Chat, Channel)):
                dialogs.append({
                    "id": entity.id,
                    "name": getattr(entity, "title", getattr(entity, "first_name", "")),
                    "type": type(entity).__name__,
                })
        return dialogs
    except Exception as e:
        print(f"[ERROR] Помилка під час отримання чатів: {e}")
        raise HTTPException(status_code=500, detail="Не вдалося отримати список чатів. Спробуйте пізніше.")
    finally:
        await client.disconnect()

async def get_messages(client, chat_id, limit=50, offset_id=None):
    await client.connect()
    try:
        await client.get_dialogs()
        entity = await client.get_entity(chat_id)

        total = await client.get_messages(entity, limit=0)
        total_count = total.total if hasattr(total, 'total') else 0

        messages = []

        kwargs = {"limit": limit}
        if offset_id is not None:
            kwargs["offset_id"] = offset_id

        async for msg in client.iter_messages(entity, **kwargs):
            sender_info = None
            if msg.sender_id:
                try:
                    sender_entity = await client.get_entity(msg.sender_id)
                    sender_info = {
                        "id": sender_entity.id,
                        "username": getattr(sender_entity, "username", None),
                        "first_name": getattr(sender_entity, "first_name", None),
                        "last_name": getattr(sender_entity, "last_name", None),
                    }
                except Exception:
                    sender_info = {"error": "Інформація про відправника недоступна."}

            media_info = None
            if msg.media:
                media_info = {
                    "type": type(msg.media).__name__,
                    "caption": msg.text,
                }

            messages.append({
                "id": msg.id,
                "date": msg.date.isoformat() if msg.date else None,
                "text": msg.message,
                "sender": sender_info,
                "media": media_info,
            })

        return messages, total_count
    except Exception as e:
        print(f"[ERROR] Помилка під час отримання повідомлень: {e}")
        raise HTTPException(status_code=500, detail="Не вдалося отримати повідомлення. Спробуйте пізніше.")
    finally:
        await client.disconnect()


async def download_media(client, chat_id, message_id):
    await client.connect()
    try:
        entity = await client.get_entity(chat_id)
        msg = await client.get_messages(entity, ids=message_id)
        if not msg or not msg.media:
            raise HTTPException(status_code=404, detail="Медіа не знайдено в повідомленні.")

        file_bytes = await msg.download_media(file=bytes)
        if not file_bytes:
            raise HTTPException(status_code=404, detail="Не вдалося завантажити медіа.")

        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename=media_{message_id}.bin"}
        )
    except Exception as e:
        print(f"[ERROR] Помилка під час завантаження медіа: {e}")
        raise HTTPException(status_code=500, detail="Не вдалося завантажити медіа. Спробуйте пізніше.")
    finally:
        await client.disconnect()

async def delete_account(db, account, current_user):
    try:
        client = TelegramClient(
            StringSession(account.session_file),
            settings.TG_API_ID,
            settings.TG_API_HASH,
        )
        await client.connect()

        try:
            await client.log_out()
        except Exception as e:
            print(f"[WARN] Не вдалося вийти з Telegram: {e}")

        await client.disconnect()

        db.delete(account)
        db.commit()

    except Exception as e:
        print(f"[ERROR] Помилка під час видалення акаунта: {e}")
        raise HTTPException(status_code=500, detail="Не вдалося видалити акаунт. Спробуйте пізніше.")

async def get_user_accounts(db, current_user):
    try:
        accounts = db.query(TelegramAccount).filter_by(user_id=current_user.id, is_active=True).all()
        result = []

        for acc in accounts:
            client = TelegramClient(
                StringSession(acc.session_file),
                settings.TG_API_ID,
                settings.TG_API_HASH,
            )
            await client.connect()
            try:
                me = await client.get_me()
                photo = await client.download_profile_photo("me", file=bytes)

                avatar_url = None
                if photo:
                    import base64
                    avatar_url = f"data:image/jpeg;base64,{base64.b64encode(photo).decode()}"

                result.append({
                    "id": acc.id,
                    "phone_number": acc.phone_number,
                    "created_at": acc.created_at.isoformat() if hasattr(acc, "created_at") else None,
                    "name": me.first_name,
                    "username": me.username,
                    "avatar": avatar_url,
                })

            except Exception as e:
                print(f"[WARN] Не вдалося отримати дані акаунта: {e}")
                result.append({
                    "id": acc.id,
                    "phone_number": acc.phone_number,
                    "created_at": acc.created_at.isoformat() if hasattr(acc, "created_at") else None,
                    "name": None,
                    "username": None,
                    "avatar": None,
                    "error": "Не вдалося отримати дані акаунта."
                })
            finally:
                await client.disconnect()

        return result

    except Exception as e:
        print(f"[ERROR] Помилка під час отримання акаунтів: {e}")
        raise HTTPException(status_code=500, detail="Не вдалося отримати список акаунтів. Спробуйте пізніше.")
