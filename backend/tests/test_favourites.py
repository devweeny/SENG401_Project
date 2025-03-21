import pytest
from unittest.mock import patch
from flask_jwt_extended import create_access_token

from app import app

@pytest.fixture
def client():
    app.testing = True
    return app.test_client()

@pytest.fixture
def access_token():
    with app.app_context():
        return create_access_token(identity="testuser@test.com")

# UT14 – Add Recipe to Favorites (FR12)
@patch('database.get_user_id')
@patch('database.add_recipe')
def test_add_recipe(mock_add_recipe, mock_get_user_id, client, access_token):
    mock_get_user_id.return_value = 187  # Mock user ID
    mock_add_recipe.return_value = None  # Simulate successful database insertion

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    data = {
        "title": "Test Recipe",  # Ensure 'title' is populated
        "source": "Test Source",
        "ingredients": ["ingredient1", "ingredient2"],  # Properly formatted list
        "instructions": ["Step 1", "Step 2"]  # Properly formatted list
    }

    response = client.post('/add_recipe', json=data, headers=headers)
    assert response.status_code == 200
    assert response.json == {"message": "Recipe added successfully"}
    mock_add_recipe.assert_called_once_with(
        187, "Test Recipe", ["ingredient1", "ingredient2"], ["Step 1", "Step 2"], "Test Source"
    )

# UT15 – Remove Recipe from Favorites (FR15)
@patch('database.get_user_id')
@patch('database.get_connection')
def test_remove_favorite(mock_get_connection, mock_get_user_id, client, access_token):
    mock_get_user_id.return_value = 187  # Mock user ID
    mock_conn = mock_get_connection.return_value
    mock_cursor = mock_conn.cursor.return_value

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    data = {"recipe_id": 1}  # Ensure 'recipe_id' is provided

    response = client.post('/remove_recipe', json=data, headers=headers)
    assert response.status_code == 200
    assert response.json == {"msg": "Recipe removed from favorites"}
    mock_cursor.execute.assert_called_once_with(
        "DELETE FROM favorites WHERE user_id = %s AND recipe_id = %s", (187, 1)
    )
    mock_conn.commit.assert_called_once()
    mock_cursor.close.assert_called_once()
