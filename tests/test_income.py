import pytest
from database.db import get_db

def test_add_income_success(client, user):
    """Test that an authenticated user can successfully add income."""
    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    response = client.post("/transactions/add", data={
        "type": "income",
        "amount": "1000",
        "category": "Salary",
        "date": "2026-09-15",
        "description": "Monthly Salary"
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b"Income added successfully!" in response.data

    # Verify in database
    with get_db() as db:
        row = db.execute("SELECT * FROM income WHERE user_id = ?", (user["id"],)).fetchone()
        assert row is not None
        assert row["amount"] == 1000.0
        assert row["category"] == "Salary"

def test_add_income_invalid_amount(client, user):
    """Test that adding income with an invalid amount returns an error."""
    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    response = client.post("/transactions/add", data={
        "type": "income",
        "amount": "abc",
        "category": "Salary",
        "date": "2026-09-15",
        "description": "Monthly Salary"
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b"Invalid amount. Please enter a numeric value." in response.data

def test_add_income_missing_fields(client, user):
    """Test that adding income with missing fields returns an error."""
    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    response = client.post("/transactions/add", data={
        "type": "income",
        "amount": "1000",
        # missing category and date
        "description": "Monthly Salary"
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b"Amount, category, date, and type are required." in response.data
