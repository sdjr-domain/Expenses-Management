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

def get_expense_by_id(db, expense_id):
    """Returns an expense record if the ID exists, otherwise None."""
    return db.execute("SELECT * FROM expenses WHERE id = ?", (expense_id,)).fetchone()

def add_income(db, user_id, amount, category, date, description):
    """Adds a new income record for a user."""
    db.execute(
        "INSERT INTO income (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)",
        (user_id, amount, category, date, description)
    )
    db.commit()

def get_total_income(user_id):
    """Returns the total income for a user."""
    with get_db() as db:
        row = db.execute("SELECT SUM(amount) as total FROM income WHERE user_id = ?", (user_id,)).fetchone()
        return row["total"] if row["total"] else 0

def get_total_expenses(user_id):
    """Returns the total expenses for a user."""
    with get_db() as db:
        row = db.execute("SELECT SUM(amount) as total FROM expenses WHERE user_id = ?", (user_id,)).fetchone()
        return row["total"] if row["total"] else 0

def get_financial_summary(user_id):
    """Returns total income, total expenses, and the net balance for a user."""
    income = get_total_income(user_id)
    expenses = get_total_expenses(user_id)
    return {
        "total_income": income,
        "total_expenses": expenses,
        "balance": income - expenses
    }

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

def get_total_transaction_count(user_id):
    """Returns the total count of all transactions (income and expenses) for a user."""
    with get_db() as db:
        income_count = db.execute("SELECT COUNT(*) as count FROM income WHERE user_id = ?", (user_id,)).fetchone()["count"]
        expense_count = db.execute("SELECT COUNT(*) as count FROM expenses WHERE user_id = ?", (user_id,)).fetchone()["count"]
        return income_count + expense_count

def get_filtered_expenses_count(user_id, category=None, start_date=None, end_date=None):
    """Returns the total count of expenses for a user matching the filters."""
    with get_db() as db:
        query = "SELECT COUNT(*) as count FROM expenses WHERE user_id = ?"
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

        row = db.execute(query, params).fetchone()
        return row["count"] if row else 0

def get_filtered_expenses(user_id, category=None, start_date=None, end_date=None, sort=None, limit=None, offset=None):
    """Returns a list of expenses for a user with optional filters, sorting, and pagination."""
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

        if sort == "amount_asc":
            query += " ORDER BY amount ASC"
        elif sort == "amount_desc":
            query += " ORDER BY amount DESC"
        elif sort == "date_asc":
            query += " ORDER BY date ASC"
        elif sort == "date_desc":
            query += " ORDER BY date DESC"
        else:
            query += " ORDER BY date DESC"

        if limit is not None:
            query += " LIMIT ?"
            params.append(limit)
        if offset is not None:
            query += " OFFSET ?"
            params.append(offset)

        return db.execute(query, params).fetchall()

def get_analytics_summary(user_id, start_date, end_date):
    """Returns a summary of financial KPIs for a user within a date range."""
    with get_db() as db:
        # Total Expenses
        exp_row = db.execute(
            "SELECT SUM(amount) as total, MAX(amount) as max_val FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?",
            (user_id, start_date, end_date)
        ).fetchone()
        total_expenses = exp_row["total"] if exp_row["total"] else 0
        largest_transaction = exp_row["max_val"] if exp_row["max_val"] else 0

        # Total Income
        inc_row = db.execute(
            "SELECT SUM(amount) as total FROM income WHERE user_id = ? AND date >= ? AND date <= ?",
            (user_id, start_date, end_date)
        ).fetchone()
        total_income = inc_row["total"] if inc_row["total"] else 0

        # Net Savings & Rate
        net_savings = total_income - total_expenses
        savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0

        # Avg Daily Spend
        days_diff = (datetime.strptime(end_date, "%Y-%m-%d") - datetime.strptime(start_date, "%Y-%m-%d")).days + 1
        avg_daily_spend = total_expenses / days_diff if days_diff > 0 else 0

        # Busiest Day
        busiest = db.execute(
            "SELECT date FROM expenses WHERE user_id = ? AND date >= ? AND date <= ? GROUP BY date ORDER BY SUM(amount) DESC LIMIT 1",
            (user_id, start_date, end_date)
        ).fetchone()
        busiest_day = busiest["date"] if busiest else None

        return {
            "total_expenses": total_expenses,
            "total_income": total_income,
            "net_savings": net_savings,
            "savings_rate": round(savings_rate, 2),
            "avg_daily_spend": round(avg_daily_spend, 2),
            "busiest_day": busiest_day,
            "largest_transaction": largest_transaction
        }

def get_spending_trends(user_id, start_date, end_date, bucket='day', category=None):
    """Returns time-series data for income and expenses."""
    with get_db() as db:
        # Map bucket to SQLite date modifier
        # 'day' is just date, 'week' is strftime('%Y-%W'), 'month' is strftime('%Y-%m')
        fmt = {"day": "%Y-%m-%d", "week": "%Y-%W", "month": "%Y-%m"}.get(bucket, "%Y-%m-%d")

        exp_query = f"SELECT strftime('{fmt}', date) as period, SUM(amount) as total FROM expenses WHERE user_id = ?"
        exp_params = [user_id]
        if category and category != "All":
            exp_query += " AND category = ?"
            exp_params.append(category)
        exp_query += f" AND date >= ? AND date <= ? GROUP BY period ORDER BY period ASC"
        exp_params.extend([start_date, end_date])
        inc_query = f"SELECT strftime('{fmt}', date) as period, SUM(amount) as total FROM income WHERE user_id = ? AND date >= ? AND date <= ? GROUP BY period ORDER BY period ASC"

        expenses = {row["period"]: row["total"] for row in db.execute(exp_query, exp_params).fetchall()}
        income = {row["period"]: row["total"] for row in db.execute(inc_query, (user_id, start_date, end_date)).fetchall()}

        # Combine and sort by period
        all_periods = sorted(set(expenses.keys()) | set(income.keys()))
        return [{"period": p, "expense": expenses.get(p, 0), "income": income.get(p, 0)} for p in all_periods]

def get_category_distribution(user_id, start_date, end_date):
    """Returns expense distribution by category."""
    with get_db() as db:
        return db.execute(
            "SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses WHERE user_id = ? AND date >= ? AND date <= ? GROUP BY category ORDER BY total DESC",
            (user_id, start_date, end_date)
        ).fetchall()

def get_category_trends(user_id, start_date, end_date):
    """Returns spending per category per month."""
    with get_db() as db:
        return db.execute(
            "SELECT strftime('%Y-%m', date) as month, category, SUM(amount) as total FROM expenses WHERE user_id = ? AND date >= ? AND date <= ? GROUP BY month, category ORDER BY month ASC",
            (user_id, start_date, end_date)
        ).fetchall()

def get_spend_by_day_of_week(user_id, start_date, end_date):
    """Returns spending aggregated by day of the week (0=Sunday)."""
    with get_db() as db:
        # strftime('%w') returns 0-6
        return db.execute(
            "SELECT strftime('%w', date) as dow, SUM(amount) as total FROM expenses WHERE user_id = ? AND date >= ? AND date <= ? GROUP BY dow ORDER BY dow ASC",
            (user_id, start_date, end_date)
        ).fetchall()

def get_asset_metrics(user_id):
    """Returns total asset growth and allocation."""
    with get_db() as db:
        # Growth over time
        growth = db.execute(
            "SELECT date, SUM(amount) OVER (ORDER BY date) as total FROM assets WHERE user_id = ? ORDER BY date ASC",
            (user_id,)
        ).fetchall()

        # Allocation by type
        allocation = db.execute(
            "SELECT type, SUM(amount) as total FROM assets WHERE user_id = ? GROUP BY type ORDER BY total DESC",
            (user_id,)
        ).fetchall()

        return {
            "growth": [{"date": row["date"], "total": row["total"]} for row in growth],
            "allocation": [{"type": row["type"], "total": row["total"]} for row in allocation]
        }

def add_expense(db, user_id, amount, category, date, description):
    """Adds a new expense record for a user."""
    db.execute(
        "INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)",
        (user_id, amount, category, date, description)
    )
    db.commit()

def delete_expense(db, expense_id, user_id):
    """Deletes an expense record if it belongs to the specified user."""
    cursor = db.execute(
        "DELETE FROM expenses WHERE id = ? AND user_id = ?",
        (expense_id, user_id)
    )
    db.commit()
    return cursor.rowcount > 0

def update_expense(db, expense_id, user_id, amount, category, date, description):
    """Updates an expense record if it belongs to the specified user."""
    cursor = db.execute(
        "UPDATE expenses SET amount = ?, category = ?, date = ?, description = ? WHERE id = ? AND user_id = ?",
        (amount, category, date, description, expense_id, user_id)
    )
    db.commit()
    return cursor.rowcount > 0

def add_category(db, user_id, name, color=None):
    """Adds a new custom category for a user."""
    db.execute(
        "INSERT INTO categories (user_id, name, color) VALUES (?, ?, ?)",
        (user_id, name, color)
    )
    db.commit()

def get_user_categories(user_id):
    """Returns all categories for a user."""
    with get_db() as db:
        return db.execute(
            "SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC",
            (user_id,)
        ).fetchall()

def get_category_name(db, cat_id, user_id):
    """Returns the name of a category if it belongs to the specified user."""
    row = db.execute("SELECT name FROM categories WHERE id = ? AND user_id = ?", (cat_id, user_id)).fetchone()
    return row["name"] if row else None

def count_expenses_in_category(db, user_id, category_name):
    """Returns the number of expenses associated with a specific category name for a user."""
    row = db.execute("SELECT COUNT(*) as count FROM expenses WHERE user_id = ? AND category = ?", (user_id, category_name)).fetchone()
    return row["count"] if row else 0

def delete_category(db, cat_id, user_id):
    """Deletes a category record if it belongs to the specified user."""
    cursor = db.execute(
        "DELETE FROM categories WHERE id = ? AND user_id = ?",
        (cat_id, user_id)
    )
    db.commit()
    return cursor.rowcount > 0

def update_category(db, cat_id, user_id, new_name):
    """Updates a category name if it belongs to the specified user."""
    cursor = db.execute(
        "UPDATE categories SET name = ? WHERE id = ? AND user_id = ?",
        (new_name, cat_id, user_id)
    )
    db.commit()
    return cursor.rowcount > 0

def get_asset_by_id(db, asset_id):
    """Returns an asset record if the ID exists, otherwise None."""
    return db.execute("SELECT * FROM assets WHERE id = ?", (asset_id,)).fetchone()

def get_assets(user_id, asset_type=None):
    """Returns assets for a user, optionally filtered by type, ordered by date."""
    with get_db() as db:
        query = "SELECT * FROM assets WHERE user_id = ?"
        params = [user_id]
        if asset_type and asset_type != "All":
            query += " AND type = ?"
            params.append(asset_type)

        query += " ORDER BY date DESC"
        return db.execute(query, params).fetchall()

def add_asset(db, user_id, asset_type, amount, date, description, maturity_date=None, interest_rate=None, maturity_amount=None):
    """Adds a new asset record for a user."""
    db.execute(
        "INSERT INTO assets (user_id, type, amount, date, description, maturity_date, interest_rate, maturity_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (user_id, asset_type, amount, date, description, maturity_date, interest_rate, maturity_amount)
    )
    db.commit()

def update_asset(db, asset_id, user_id, asset_type, amount, date, description, maturity_date=None, interest_rate=None, maturity_amount=None):
    """Updates an asset record if it belongs to the specified user."""
    cursor = db.execute(
        "UPDATE assets SET type = ?, amount = ?, date = ?, description = ?, maturity_date = ?, interest_rate = ?, maturity_amount = ? WHERE id = ? AND user_id = ?",
        (asset_type, amount, date, description, maturity_date, interest_rate, maturity_amount, asset_id, user_id)
    )
    db.commit()
    return cursor.rowcount > 0

def delete_asset(db, asset_id, user_id):
    """Deletes an asset record if it belongs to the specified user."""
    cursor = db.execute(
        "DELETE FROM assets WHERE id = ? AND user_id = ?",
        (asset_id, user_id)
    )
    db.commit()
    return cursor.rowcount > 0

def get_total_assets(user_id):
    """Returns the total value of all assets for a user."""
    with get_db() as db:
        row = db.execute("SELECT SUM(amount) as total FROM assets WHERE user_id = ?", (user_id,)).fetchone()
        return row["total"] if row["total"] else 0

def ensure_default_categories(user_id):

    """Ensures a user has the basic set of default categories."""
    defaults = ["Food", "Transport", "Bills", "Health", "Entertainment", "Shopping", "Other"]
    with get_db() as db:
        existing = db.execute("SELECT name FROM categories WHERE user_id = ?", (user_id,)).fetchall()
        existing_names = {row["name"] for row in existing}

        for name in defaults:
            if name not in existing_names:
                db.execute("INSERT INTO categories (user_id, name) VALUES (?, ?)", (user_id, name))
        db.commit()

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
            CREATE TABLE IF NOT EXISTS income (
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
        db.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                color TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                date TEXT NOT NULL,
                maturity_date TEXT,
                interest_rate REAL,
                maturity_amount REAL,
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
