import pytest
from database.db import get_db

def test_add_expense_success(client, user):
    """Test that an authenticated user can successfully add an expense."""
    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    response = client.post("/transactions/add", data={
        "type": "expense",
        "amount": "50.00",
        "category": "Food",
        "date": "2026-09-15",
        "description": "Dinner"
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b"Expense added successfully!" in response.data

    # Verify in database
    with get_db() as db:
        row = db.execute("SELECT * FROM expenses WHERE user_id = ?", (user["id"],)).fetchone()
        assert row is not None
        assert row["amount"] == 50.0
        assert row["category"] == "Food"

def test_edit_expense_success(client, user):
    """Test that an authenticated user can edit their expense."""
    with get_db() as db:
        cursor = db.execute(
            "INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)",
            (user["id"], 10.0, "Food", "2026-09-10", "Snack")
        )
        db.commit()
        expense_id = cursor.lastrowid

    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    response = client.post(f"/expenses/{expense_id}/edit", data={
        "amount": "20.00",
        "category": "Food",
        "date": "2026-09-10",
        "description": "Better Snack"
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b"Expense updated successfully!" in response.data

    with get_db() as db:
        row = db.execute("SELECT * FROM expenses WHERE id = ?", (expense_id,)).fetchone()
        assert row["amount"] == 20.0
        assert row["description"] == "Better Snack"

def test_delete_expense_success(client, user):
    """Test that an authenticated user can delete their expense."""
    with get_db() as db:
        cursor = db.execute(
            "INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)",
            (user["id"], 10.0, "Food", "2026-09-10", "Snack")
        )
        db.commit()
        expense_id = cursor.lastrowid

    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    response = client.post(f"/expenses/{expense_id}/delete", follow_redirects=True)
    assert b"Expense deleted successfully." in response.data

    with get_db() as db:
        row = db.execute("SELECT * FROM expenses WHERE id = ?", (expense_id,)).fetchone()
        assert row is None

def test_expense_unauthorized_edit(client, user):
    """Test that a user cannot edit someone else's expense."""
    # Create another user
    with get_db() as db:
        cursor = db.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            ("Other User", "other@example.com", "hashed")
        )
        db.commit()
        other_user_id = cursor.lastrowid

        cursor = db.execute(
            "INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)",
            (other_user_id, 100.0, "Bills", "2026-09-10", "Other User's Bill")
        )
        db.commit()
        other_expense_id = cursor.lastrowid

    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    response = client.post(f"/expenses/{other_expense_id}/edit", data={
        "amount": "10.00",
        "category": "Bills",
        "date": "2026-09-10",
        "description": "Hacked!"
    }, follow_redirects=True)

    assert b"Expense not found or unauthorized." in response.data
