from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Tüm modelleri doğru sırayla import et (SQLAlchemy mapper init için kritik)
from app.models import user, question, answer, notification, favorite  # noqa: F401

from app.routers import auth_router, question_router, answer_router, notification_router, user_router, favorite_router
from app.core.database import engine, Base

# Veritabanı tablolarını oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Akıl Kütüphanesi")

# CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [url.strip() for url in frontend_url.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,  # <-- BURASI DÜZELTİLDİ
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- RESİM KLASÖRÜNÜ AÇMA (KRİTİK ADIM) ---
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
# ------------------------------------------

app.include_router(auth_router.router)
app.include_router(question_router.router)
app.include_router(answer_router.router)
app.include_router(notification_router.router)
app.include_router(user_router.router)
app.include_router(favorite_router.router)

@app.get("/")
def home():
    return {"status": "Backend Çalışıyor"}
