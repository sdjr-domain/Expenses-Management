import sqlite3
from database.db import DATABASE

def seed_limits():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Get a user_id
    user = cursor.execute("SELECT id FROM users LIMIT 1").fetchone()
    if not user:
        print("No user found.")
        return
    user_id = user[0]
    
    # Define realistic dummy limits for a mid-range budget
    # (Category, Limit Type, Value)
    limits = [
        ("Food", "fixed", 8000.0),
        ("Transport", "fixed", 3000.0),
        ("Bills", "fixed", 15000.0),
        ("Health", "fixed", 4000.0),
        ("Entertainment", "percentage", 10.0), # 10% of income
        ("Shopping", "percentage", 15.0),      # 15% of income
        ("Other", "fixed", 2000.0),
    ]
    
    for cat, l_type, l_val in limits:
        cursor.execute("""
            INSERT INTO category_limits (user_id, category_name, limit_type, limit_value, updated_at)
            VALUES (?, ?, ?, ?, datetime('now'))
            ON CONFLICT(user_id, category_name) DO UPDATE SET
            limit_type=excluded.limit_type, limit_value=excluded.limit_value, updated_at=excluded.updated_at
        """, (user_id, cat, l_type, l_val))
    
    conn.commit()
    conn.close()
    print("✅ Dummy limits seeded successfully.")

if __name__ == "__main__":
    seed_limits()
