from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import cloudinary
from dotenv import load_dotenv

load_dotenv() # .env dosyasını okutur

limiter = Limiter(key_func=get_remote_address)

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)
# Tüm modelleri doğru sırayla import et (SQLAlchemy mapper init için kritik)
from app.models import user, question, answer, notification, favorite  # noqa: F401

from app.routers import auth_router, question_router, answer_router, notification_router, user_router, favorite_router, admin_router
from app.core.database import engine, Base
from sqlalchemy import text

# Veritabanı tablolarını oluştur
Base.metadata.create_all(bind=engine)

# Canlı veritabanı için manuel kolon eklemeleri (Eğer tablo varsa ve kolon yoksa)
try:
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE questions ADD COLUMN view_count INTEGER DEFAULT 0;"))
        except Exception:
            pass  # Kolon zaten varsa hata verir, geç.
        
        try:
            conn.execute(text("ALTER TABLE answers ADD COLUMN is_best_answer BOOLEAN DEFAULT FALSE;"))
        except Exception:
            pass
            
        try:
            conn.execute(text("ALTER TABLE questions ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE;"))
        except Exception:
            pass
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;"))
        except Exception:
            pass
except Exception as e:
    print(f"Migration error: {e}")

app = FastAPI(title="Akıl Kütüphanesi")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL, 
        "http://localhost:5173", 
        "https://akil-kutuphanesi.vercel.app",
        "https://www.akilkutuphanesi.com",  # Canlı domainin (www ile)
        "https://akilkutuphanesi.com"       # Canlı domainin (www olmadan)
    ],
    allow_credentials=True,
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
app.include_router(admin_router.router)

@app.get("/")
def home():
    return {"status": "Backend Çalışıyor"}