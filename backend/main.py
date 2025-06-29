from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi_csrf_protect import CsrfProtect

from app.utils.seucrity import get_current_user, RemoveServerHeaderMiddleware, SecureHeadersMiddleware
from app.routers import telegram, auth

app = FastAPI(title="Telegram CRM API")

app.add_middleware(SecureHeadersMiddleware)
app.add_middleware(RemoveServerHeaderMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    telegram.router,
    prefix="/telegram",
    tags=["telegram"],
    dependencies=[Depends(get_current_user)],
)

app.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"]
)
