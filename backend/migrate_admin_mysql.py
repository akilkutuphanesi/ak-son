from sqlalchemy import text
from app.core.database import engine

def migrate():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN manual_reputation INT NULL;"))
            print("Added manual_reputation")
        except Exception as e:
            print("manual_reputation exists or error:", e)
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN manual_badge VARCHAR(50) NULL;"))
            print("Added manual_badge")
        except Exception as e:
            print("manual_badge exists or error:", e)

        try:
            conn.execute(text("ALTER TABLE answers ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE;"))
            print("Added is_hidden")
        except Exception as e:
            print("is_hidden exists or error:", e)

if __name__ == "__main__":
    migrate()
