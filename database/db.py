import sqlite3
import random
from datetime import datetime, timedelta
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

def get_user_by_id(user_id):
    """Returns a user record if the ID exists, otherwise None."""
    with get_db() as db:
        return db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

def get_spending_summary(user_id):
    """Returns total spending and the top spending category for a user."""
    with get_db() as db:
        total = db.execute("SELECT SUM(amount) as total FROM expenses WHERE user_id = ?", (user_id,)).fetchone()
        top_cat = db.execute(
            "SELECT category FROM expenses WHERE user_id = ? GROUP BY category ORDER BY SUM(amount) DESC LIMIT 1",
            (user_id,)
        ).fetchone()
        return {
            "total_spend": total["total"] if total["total"] else 0,
            "top_category": top_cat["category"] if top_cat else "None"
        }

def get_category_totals(user_id):
    """Returns a list of categories and their total spend for a user."""
    with get_db() as db:
        return db.execute(
            "SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? GROUP BY category ORDER BY total DESC",
            (user_id,)
        ).fetchall()

def get_filtered_expenses(user_id, category=None, start_date=None, end_date=None):
    """Returns a list of expenses for a user with optional filters."""
    with get_db() as db:
        query = "SELECT * FROM expenses WHERE user_id = ?"
        params = [user_id]
        if category and category != "All":
            query += " AND category = ?"
            params.append(category)
        if start_date:
            query += " AND date >= ?"
            params.append(start_date)
        if end_date:
            query += " AND date <= ?"
            params.append(end_date)
        query += " ORDER BY date DESC"
        return db.execute(query, params).fetchall()

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
        user = db.execute("SELECT id FROM users LIMIT 1").fetchone()
        if user:
            return

        password_hash = generate_password_hash("demo123")
        cursor = db.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            ("Demo User", "demo@spendly.com", password_hash)
        )
        user_id = cursor.lastrowid

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

def seed_yearly_data(user_id=None):
    """Inserts a year's worth of realistic dummy expenses for a specific user."""
    with get_db() as db:
        if user_id is None:
            user = db.execute("SELECT id FROM users LIMIT 1").fetchone()
            if not user:
                return
            user_id = user["id"]

        categories = {
            "Food": (100, 1500, "Dinner at Restaurant", "Grocery Store", "Coffee Shop", "Street Food"),
            "Transport": (50, 800, "Uber Ride", "Petrol Fill-up", "Bus Fare", "Train Ticket"),
            "Bills": (1000, 5000, "Electricity Bill", "Water Bill", "Internet Subscription", "Rent"),
            "Health": (200, 5000, "Pharmacy", "Doctor Consultation", "Gym Membership", "Health Checkup"),
            "Entertainment": (200, 4000, "Movie Ticket", "Gaming Subscription", "Concert", "Book Store"),
            "Shopping": (500, 15000, "Clothing Store", "Electronics", "Home Decor", "Amazon Order"),
            "Other": (100, 3000, "Gift", "Miscellaneous", "Donation", "Repair Work"),
        }

        expenses = []
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)

        current_date = start_date
        while current_date <= end_date:
            # Random number of expenses per day (0 to 3)
            for _ in range(random.randint(0, 3)):
                cat_name = random.choice(list(categories.keys()))
                min_amt, max_amt, *descriptions = categories[cat_name]

                amount = round(random.uniform(min_amt, max_amt), 2)
                description = random.choice(descriptions)
                date_str = current_date.strftime("%Y-%m-%d")

                expenses.append((user_id, amount, cat_name, date_str, description))

            current_date += timedelta(days=1)

        db.executemany(
            "INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)",
            expenses
        )
        db.commit()
