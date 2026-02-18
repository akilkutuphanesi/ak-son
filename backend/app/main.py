from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth_router, question_router, answer_router, notification_router
from app.core.database import engine, Base
from sqlalchemy import text

# Tabloları oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Akıl Kütüphanesi")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(question_router.router)
app.include_router(answer_router.router)
app.include_router(notification_router.router)

@app.get("/")
def home():
    return {"status": "Backend Çalışıyor (Kamerasız Sürüm)"}

# Veritabanını temizlemek için (Eski resim sütunlarını silmek için gerekli)
@app.get("/reset-db")
def reset_db():
    with engine.connect() as connection:
        connection.execute(text("DROP TABLE IF EXISTS notifications"))
        connection.execute(text("DROP TABLE IF EXISTS answers"))
        connection.execute(text("DROP TABLE IF EXISTS questions"))
        connection.execute(text("DROP TABLE IF EXISTS users"))
        connection.commit()
    Base.metadata.create_all(bind=engine)
    return {"message": "Veritabanı sıfırlandı ve temizlendi."}