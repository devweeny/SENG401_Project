# tests/test_app.py
import pytest
from unittest.mock import patch
import sys
import os
from flask_jwt_extended import create_access_token

# Add the parent directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

@pytest.fixture
def client():
    app.testing = True
    return app.test_client()

@pytest.fixture
def access_token():
    # Generate a valid JWT token for testing within the application context
    with app.app_context():
        return create_access_token(identity="testuser@test.com")

@patch('database.login')
def test_login_success(mock_login, client):
    mock_login.return_value = (1, 'testuser@test.com', 'Test User', 'hashed_password', '2025-02-24')
    data = {'email': 'testuser@test.com', 'password': 'password123'}
    response = client.post('/login', data=data)
    assert response.status_code == 200
    assert 'token' in response.json

@patch('database.login')
def test_login_failure(mock_login, client):
    mock_login.return_value = None
    data = {'email': 'wronguser@test.com', 'password': 'wrongpassword'}
    response = client.post('/login', data=data)
    assert response.status_code == 401
    assert response.json == {"message": "Invalid email or password"}

@patch('database.register')
def test_register_success(mock_register, client):
    mock_register.return_value = True
    data = {'email': 'newuser@test.com', 'name': 'New User', 'password': 'password123'}
    response = client.post('/register', data=data)
    assert response.status_code == 200
    assert response.json == {"message": "You are registered"}

@patch('database.register')
def test_register_failure(mock_register, client):
    mock_register.return_value = False
    data = {'email': 'existinguser@test.com', 'name': 'Existing User', 'password': 'password123'}
    response = client.post('/register', data=data)
    assert response.status_code == 400
    assert response.json == {"message": "Email already in use"}

# UT11 – Generate Recipe Recommendations (FR11)
@patch('database.get_user_id')
@patch('gemini.generate')
def test_generate_recipe(mock_generate, mock_get_user_id, client, access_token):
    mock_get_user_id.return_value = 1
    mock_generate.return_value = [
        {
            "title": "Generated Recipe",
            "instructions": ["Step 1", "Step 2"],
            "ingredients": ["ingredient1", "ingredient2"],
            "source": "Generated Source"
        }
    ]
    headers = {"Authorization": f"Bearer {access_token}"}
    data = {"ingredients": "ingredient1, ingredient2"}  # Form data
    response = client.post('/generate', data=data, headers=headers)  # Send as form data
    print("Response JSON:", response.json)  # Debugging output
    assert response.status_code == 200
    assert "recipe" in response.json

# UT12 – Add Recipe to Favorites (FR12)
@patch('database.get_user_id')
@patch('database.add_recipe')
def test_add_recipe(mock_add_recipe, mock_get_user_id, client, access_token):
    mock_get_user_id.return_value = 1
    mock_add_recipe.return_value = None
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    data = {
        "title": "Test Recipe",
        "source": "Test Source",
        "ingredients": ["ingredient1", "ingredient2"],
        "instructions": ["Step 1", "Step 2"]
    }
    response = client.post('/add_recipe', json=data, headers=headers)
    assert response.status_code == 200
    assert response.json == {"message": "Recipe added successfully"}

# UT13 – View Saved Recipes in Favorites (FR14)
@patch('database.get_user_id')
@patch('database.get_recipes')
def test_get_recipes(mock_get_recipes, mock_get_user_id, client, access_token):
    mock_get_user_id.return_value = 1
    mock_get_recipes.return_value = [
        {"id": 1, "title": "Recipe 1", "ingredients": ["ingredient1"], "instructions": ["Step 1"], "source": "Source 1"}
    ]
    headers = {"Authorization": f"Bearer {access_token}"}
    response = client.get('/get_recipes', headers=headers)
    assert response.status_code == 200
    assert response.json == {"recipes": mock_get_recipes.return_value}
