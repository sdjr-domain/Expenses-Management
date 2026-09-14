import pytest
from database.db import get_db

def test_add_asset_success(client, user):
    """Test that a user can add a financial asset."""
    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    response = client.post("/assets/add", data={
        "type": "Savings",
        "amount": "5000",
        "date": "2026-09-15",
        "description": "Emergency Fund",
        "interest_rate": "2.5",
        "maturity_amount": "5125"
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b"Asset added successfully!" in response.data

def test_add_asset_invalid_numeric(client, user):
    """Test that adding asset with invalid numeric values returns an error."""
    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    response = client.post("/assets/add", data={
        "type": "Savings",
        "amount": "abc",
        "date": "2026-09-15",
        "description": "Invalid"
    }, follow_redirects=True)

    assert b"Invalid numeric value." in response.data

def test_delete_asset_success(client, user):
    """Test that a user can delete their asset."""
    with get_db() as db:
        cursor = db.execute(
            "INSERT INTO assets (user_id, type, amount, date, description) VALUES (?, ?, ?, ?, ?)",
            (user["id"], "Savings", 1000.0, "2026-09-10", "To be deleted")
        )
        db.commit()
        asset_id = cursor.lastrowid

    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    response = client.post(f"/assets/{asset_id}/delete", follow_redirects=True)
    assert b"Asset deleted successfully." in response.data

    with get_db() as db:
        row = db.execute("SELECT * FROM assets WHERE id = ?", (asset_id,)).fetchone()
        assert row is None
