from app.core.database import engine
from sqlalchemy import text

def migrate():
    try:
        with engine.connect() as conn:
            # Add view_count to questions
            try:
                conn.execute(text("ALTER TABLE questions ADD COLUMN view_count INTEGER DEFAULT 0"))
                print("view_count column added to questions table.")
            except Exception as e:
                print(f"Error adding view_count (might already exist): {e}")
                
            # Add is_best_answer to answers
            try:
                conn.execute(text("ALTER TABLE answers ADD COLUMN is_best_answer BOOLEAN DEFAULT 0"))
                print("is_best_answer column added to answers table.")
            except Exception as e:
                print(f"Error adding is_best_answer (might already exist): {e}")
                
            conn.commit()
        print("Migration complete.")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == '__main__':
    migrate()
