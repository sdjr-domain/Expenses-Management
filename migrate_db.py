import sqlite3
from database.db import DATABASE

def migrate():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    print("Checking for 'is_essential' column...")
    cursor.execute("PRAGMA table_info(categories)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'is_essential' not in columns:
        print("Adding 'is_essential' column to categories table...")
        cursor.execute("ALTER TABLE categories ADD COLUMN is_essential INTEGER DEFAULT 0")
        conn.commit()
        print("✅ Column added.")
    else:
        print("✅ Column already exists.")
    
    # Update default essential categories
    print("Updating default category flags...")
    essential_cats = ["Food", "Transport", "Bills", "Health"]
    for cat in essential_cats:
        cursor.execute("UPDATE categories SET is_essential = 1 WHERE name = ?", (cat,))
    
    conn.commit()
    conn.close()
    print("✅ Migration complete.")

if __name__ == "__main__":
    migrate()
