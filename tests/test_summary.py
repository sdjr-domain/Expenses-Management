import pytest
from database.db import get_db

def test_financial_summary_calculation(client, user):
    """Test that the total income, total expenses, and balance are calculated correctly."""
    with get_db() as db:
        # Add Income
        db.execute("INSERT INTO income (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)",
                   (user["id"], 5000.0, "Salary", "2026-09-01", "Month 1"))
        # Add Expenses
        db.executemany("INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)", [
            (user["id"], 1000.0, "Rent", "2026-09-02", "Rent"),
            (user["id"], 500.0, "Food", "2026-09-03", "Groceries")
        ])
        db.commit()

    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    response = client.get("/dashboard", follow_redirects=True)
    assert response.status_code == 200

    # The financial summary is injected via context processor and usually rendered in the template
    # We can check if the calculated values are in the response data
    # Total Income: 5000, Total Expenses: 1500, Balance: 3500
    assert b"5000" in response.data
    assert b"1500" in response.data
    assert b"3500" in response.data
