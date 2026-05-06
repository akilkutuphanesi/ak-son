import traceback
from sqlalchemy import text
from app.core.database import engine

def run_migration():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN display_name VARCHAR(100);"))
            print("display_name eklendi.")
        except Exception as e:
            print(f"display_name zaten var veya hata: {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255);"))
            print("avatar_url eklendi.")
        except Exception as e:
            print(f"avatar_url zaten var veya hata: {e}")
            
        conn.commit()

if __name__ == "__main__":
    run_migration()
    print("Migration denemesi bitti.")
