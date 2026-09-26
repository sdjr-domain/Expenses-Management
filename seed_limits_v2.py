import sqlite3
from database.db import DATABASE

def seed_limits():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    user = cursor.execute("SELECT id FROM users LIMIT 1").fetchone()
    if not user:
        print("No user found.")
        return
    user_id = user[0]
    
    # Setting some limits specifically designed to show "Over Budget" and "Remaining"
    # Some low to trigger "Over Budget", some high to show "Remaining"
    limits = [
        ("Food", "fixed", 5000.0),        # Likely over budget
        ("Transport", "fixed", 20000.0), # Likely remaining
        ("Bills", "fixed", 10000.0),     # Likely over budget
        ("Health", "fixed", 20000.0),    # Likely remaining
        ("Entertainment", "fixed", 1000.0), # Likely over budget
        ("Shopping", "fixed", 100000.0),  # Likely remaining
        ("Other", "fixed", 5000.0),       # Mix
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
    print("✅ Diverse dummy limits seeded successfully.")

if __name__ == "__main__":
    seed_limits()
