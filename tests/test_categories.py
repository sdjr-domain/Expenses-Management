import pytest
from database.db import get_db

def test_add_category_success(client, user):
    """Test that a user can add a custom category."""
    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    response = client.post("/categories/add", data={
        "name": "Hobbies"
    }, follow_redirects=True)

    print(f"Response data: {response.data}")
    assert response.status_code == 200
    assert b"Category" in response.data
    assert b"Hobbies" in response.data
    assert b"added successfully!" in response.data

def test_add_category_duplicate(client, user):
    """Test that adding a duplicate category fails."""
    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    # First addition
    client.post("/categories/add", data={"name": "Hobbies"})

    # Duplicate
    response = client.post("/categories/add", data={"name": "Hobbies"}, follow_redirects=True)
    assert b"Category already exists." in response.data

def test_delete_category_with_expenses(client, user):
    """Test that categories with expenses cannot be deleted."""
    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    # Add a category and an expense in it
    with get_db() as db:
        cursor = db.execute("INSERT INTO categories (user_id, name) VALUES (?, ?)", (user["id"], "TestCat"))
        db.commit()
        cat_id = cursor.lastrowid
        db.execute("INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)",
                   (user["id"], 10.0, "TestCat", "2026-09-10", "Test Expense"))
        db.commit()

    response = client.post(f"/categories/delete/{cat_id}", follow_redirects=True)
    print(f"Response data: {response.data}")
    assert b"Cannot delete category" in response.data
    assert b"TestCat" in response.data
    assert b"associated expense(s)" in response.data
