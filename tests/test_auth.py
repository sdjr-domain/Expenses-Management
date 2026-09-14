import pytest
from database.db import get_db

def test_register_success(client):
    """Test that a new user can register successfully."""
    response = client.post("/register", data={
        "name": "New User",
        "email": "new@example.com",
        "password": "password123",
        "confirm_password": "password123"
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b"Account created successfully! Please sign in." in response.data

def test_register_duplicate_email(client):
    """Test that registering with an existing email fails."""
    # First user
    client.post("/register", data={
        "name": "User 1",
        "email": "dup@example.com",
        "password": "password123",
        "confirm_password": "password123"
    })

    # Duplicate user
    response = client.post("/register", data={
        "name": "User 2",
        "email": "dup@example.com",
        "password": "password456",
        "confirm_password": "password456"
    }, follow_redirects=True)

    assert b"This email is already registered." in response.data

def test_register_password_mismatch(client):
    """Test that registration fails if passwords do not match."""
    response = client.post("/register", data={
        "name": "User",
        "email": "test@example.com",
        "password": "password123",
        "confirm_password": "mismatch"
    }, follow_redirects=True)

    assert b"Passwords do not match." in response.data

def test_login_success(client, user):
    """Test that a user can login successfully."""
    # We need to set the password hash for the test user
    from werkzeug.security import generate_password_hash
    with get_db() as db:
        db.execute("UPDATE users SET password_hash = ? WHERE id = ?",
                   (generate_password_hash("password123"), user["id"]))
        db.commit()

    response = client.post("/login", data={
        "email": user["email"],
        "password": "password123"
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b"Welcome back!" in response.data

def test_login_invalid_credentials(client, user):
    """Test that login fails with wrong password."""
    from werkzeug.security import generate_password_hash
    with get_db() as db:
        db.execute("UPDATE users SET password_hash = ? WHERE id = ?",
                   (generate_password_hash("password123"), user["id"]))
        db.commit()

    response = client.post("/login", data={
        "email": user["email"],
        "password": "wrongpassword"
    }, follow_redirects=True)

    assert b"Invalid email or password." in response.data

def test_logout(client, user):
    """Test that a user can logout successfully."""
    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    response = client.get("/logout", follow_redirects=True)
    assert b"You have been signed out." in response.data

    # Verify session is cleared
    with client.session_transaction() as sess:
        assert "user_id" not in sess
