import sqlite3
from database.db import DATABASE

def seed_limits():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    # Get all users to apply limits to everyone
    users = cursor.execute("SELECT id FROM users").fetchall()
    if not users:
        print("No users found.")
        return

    # Updated limits based on user request
    limits = [
        ("Bills", "fixed", 2000.0),
        ("Entertainment", "percentage", 30.0),
        ("Food", "fixed", 10000.0),
        ("Health", "fixed", 5000.0),
        ("Other", "fixed", 5000.0),
        ("Personal", "fixed", 15000.0),
        ("Shopping", "fixed", 20000.0),
        ("Transport", "fixed", 8000.0),
    ]

    for user_row in users:
        user_id = user_row[0]
        for cat, l_type, l_val in limits:
            cursor.execute("""
                INSERT INTO category_limits (user_id, category_name, limit_type, limit_value, updated_at)
                VALUES (?, ?, ?, ?, datetime('now'))
                ON CONFLICT(user_id, category_name) DO UPDATE SET
                limit_type=excluded.limit_type, limit_value=excluded.limit_value, updated_at=excluded.updated_at
            """, (user_id, cat, l_type, l_val))

    conn.commit()
    conn.close()
    print(f"✅ Spending limits updated successfully for {len(users)} users.")

if __name__ == "__main__":
    seed_limits()
