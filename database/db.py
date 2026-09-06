import sqlite3
from werkzeug.security import generate_password_hash

DATABASE = "spendly.db"

def get_db():
    """Returns a SQLite connection with row_factory and foreign keys enabled."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def get_user_by_email(email):
    """Returns a user record if the email exists, otherwise None."""
    with get_db() as db:
        return db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

def init_db():
    """Creates all tables using CREATE TABLE IF NOT EXISTS."""
    with get_db() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL,
                description TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        db.commit()

def seed_db():
    """Inserts sample data for development if the database is empty."""
    with get_db() as db:
        # Check if users table is empty to ensure idempotency
        user = db.execute("SELECT id FROM users LIMIT 1").fetchone()
        if user:
            return

        # Create demo user
        password_hash = generate_password_hash("demo123")
        cursor = db.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            ("Demo User", "demo@spendly.com", password_hash)
        )
        user_id = cursor.lastrowid

        # Define sample expenses covering all required categories
        expenses = [
            (user_id, 12.50, "Food", "2026-09-01", "Lunch at Cafe"),
            (user_id, 25.00, "Transport", "2026-09-02", "Ride share to office"),
            (user_id, 85.00, "Bills", "2026-09-03", "Internet Bill"),
            (user_id, 40.00, "Health", "2026-09-04", "Pharmacy"),
            (user_id, 15.00, "Entertainment", "2026-09-05", "Movie Ticket"),
            (user_id, 60.00, "Shopping", "2026-09-06", "New T-shirt"),
            (user_id, 10.00, "Other", "2026-09-07", "Miscellaneous"),
            (user_id, 22.00, "Food", "2026-09-08", "Dinner"),
        ]

        db.executemany(
            "INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)",
            expenses
        )
        db.commit()
