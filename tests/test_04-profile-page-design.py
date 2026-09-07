import pytest
from app import app as flask_app
from database.db import init_db, get_db
import sqlite3
import os

@pytest.fixture
def app():
    # Set up a test database
    # We override the DATABASE constant in database.db by patching it or
    # simply creating a separate test database file.
    # For simplicity in this environment, we'll use a temporary file.
    import database.db
    original_db_path = database.db.DATABASE
    database.db.DATABASE = "test_spendly.db"

    flask_app.config['TESTING'] = True
    flask_app.config['SECRET_KEY'] = 'test-secret'

    with flask_app.app_context():
        init_db()

    yield flask_app

    # Clean up
    if os.path.exists("test_spendly.db"):
        os.remove("test_spendly.db")
    database.db.DATABASE = original_db_path

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def user(app):
    """Creates a test user in the database."""
    with get_db() as db:
        cursor = db.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            ("Test User", "test@example.com", "hashed_password")
        )
        db.commit()
        return {"id": cursor.lastrowid, "name": "Test User", "email": "test@example.com"}

def test_profile_page_authenticated(client, user):
    """Test that an authenticated user can access their profile page and see their details."""
    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    response = client.get("/profile", follow_redirects=True)

    assert response.status_code == 200
    assert b"Test User" in response.data
    assert b"test@example.com" in response.data

def test_profile_page_unauthenticated(client):
    """Test that an unauthenticated user is redirected to login when accessing /profile."""
    response = client.get("/profile", follow_redirects=False)

    # Should redirect to login
    assert response.status_code == 302
    assert response.location.endswith("/login")

    # Check for flash message (requires following redirect or checking session/context)
    response = client.get("/profile", follow_redirects=True)
    assert b"Please sign in to access this page." in response.data

def test_profile_nav_link_authenticated(client, user):
    """Test that the profile link is visible in the navigation for authenticated users."""
    with client.session_transaction() as sess:
        sess["user_id"] = user["id"]

    # Access any page that uses base.html, e.g., the dashboard
    response = client.get("/dashboard", follow_redirects=True)

    assert response.status_code == 200
    # Check if there is a link to /profile
    assert b'href="/profile"' in response.data or b'href="/profile"' in response.data.lower()

def test_profile_nav_link_unauthenticated(client):
    """Test that the profile link is NOT visible in the navigation for unauthenticated users."""
    response = client.get("/", follow_redirects=True)

    assert response.status_code == 200
    # Check if there is NO link to /profile
    assert b'href="/profile"' not in response.data
