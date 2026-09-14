import pytest
import os
from app import app as flask_app
from database.db import init_db, get_db
import database.db

@pytest.fixture(scope="function", autouse=True)
def setup_test_db():
    """Overrides the database path for each test to ensure a fresh start."""
    import database.db
    original_db_path = database.db.DATABASE
    database.db.DATABASE = "test_spendly.db"

    # Ensure the database is initialized for every test
    init_db()

    yield

    if os.path.exists("test_spendly.db"):
        os.remove("test_spendly.db")
    database.db.DATABASE = original_db_path

@pytest.fixture
def app():
    """Configures the Flask app for testing."""
    flask_app.config['TESTING'] = True
    flask_app.config['SECRET_KEY'] = 'test-secret'
    return flask_app

@pytest.fixture
def client(app):
    """Provides a test client for making requests to the app."""
    return app.test_client()

@pytest.fixture
def user(app):
    """Creates a test user in the database for authenticated requests."""
    with get_db() as db:
        cursor = db.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            ("Test User", "test@example.com", "hashed_password")
        )
        db.commit()
        return {"id": cursor.lastrowid, "name": "Test User", "email": "test@example.com"}
