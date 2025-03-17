import os
import sys
import pytest

# Set environment variables for DB and Gemini
os.environ["DB_HOST"] = "127.0.0.1"
os.environ["DB_USER"] = "mealmatcher"
os.environ["DB_PASSWORD"] = "password"
os.environ["DB_DATABASE"] = "mealmatcher"
os.environ["DB_PORT"] = "3306"
os.environ["GEMINI_KEY"] = "dummy-key"
os.environ["JWT_SECRET_KEY"] = "test-secret"

# Add backend source directory to import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app as flask_app
import database

@pytest.fixture
def client():
    flask_app.config["TESTING"] = True
    with flask_app.test_client() as client:
        yield client

@pytest.fixture(autouse=True)
def reset_database():
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users")
    conn.commit()
    cursor.close()