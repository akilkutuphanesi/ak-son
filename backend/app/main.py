from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import auth_router, question_router, answer_router, notification_router
from app.core.database import engine, Base
from fastapi.staticfiles import StaticFiles
import os

# Veritabanı tablolarını oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Akıl Kütüphanesi")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.get("/")
def home():
    return {"status": "Backend Çalışıyor"}
