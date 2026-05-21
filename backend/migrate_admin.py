import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "akil_kutuphanesi.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE users ADD COLUMN manual_reputation INTEGER NULL")
except Exception as e:
    print(f"manual_reputation column might already exist: {e}")

try:
    cursor.execute("ALTER TABLE users ADD COLUMN manual_badge VARCHAR(50) NULL")
except Exception as e:
    print(f"manual_badge column might already exist: {e}")

try:
    cursor.execute("ALTER TABLE answers ADD COLUMN is_hidden BOOLEAN DEFAULT 0")
except Exception as e:
    print(f"is_hidden column might already exist: {e}")

conn.commit()
conn.close()
print("Migration completed successfully.")
