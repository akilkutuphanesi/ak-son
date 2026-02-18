import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

# BURASI ÖNEMLİ: URL'nin sonundaki ?ssl-mode kısmını sildik!
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Aiven bağlantısı için en garantili SSL ayarı budur:
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={
        "ssl": {
            "ca": None # Eğer sertifika dosyan yoksa None kalsın, Aiven genelde böyle kabul eder.
        }
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()