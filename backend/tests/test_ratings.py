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

# UT16 – Submit Rating Successfully (FR19)
@patch('database.get_user_id')
@patch('database.submit_rating')
def test_submit_rating_success(mock_submit_rating, mock_get_user_id, client, access_token):
    mock_get_user_id.return_value = 187  # Mock user ID
    mock_submit_rating.return_value = True  # Simulate successful rating submission

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    data = {"recipe_id": 1, "rating": 5}  # Valid recipe_id and rating

    response = client.post('/rating', json=data, headers=headers)
    assert response.status_code == 200
    assert response.json == {"message": "Rating submitted successfully"}
    mock_submit_rating.assert_called_once_with(187, 1, 5)

# UT17 – Submit Rating with Missing Fields (FR19)
@patch('database.get_user_id')
@patch('database.submit_rating')
def test_submit_rating_missing_fields(mock_submit_rating, mock_get_user_id, client, access_token):
    mock_get_user_id.return_value = 187  # Mock user ID

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    data = {"rating": 5}  # Missing recipe_id

    response = client.post('/rating', json=data, headers=headers)
    assert response.status_code == 400
    assert response.json == {"message": "Missing recipe_id or rating"}
    mock_submit_rating.assert_not_called()

# UT18 – Submit Rating with Invalid Value (FR19)
@patch('database.get_user_id')
@patch('database.submit_rating')
def test_submit_rating_invalid_value(mock_submit_rating, mock_get_user_id, client, access_token):
    mock_get_user_id.return_value = 187  # Mock user ID

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    data = {"recipe_id": 1, "rating": 6}  # Invalid rating (out of range)

    response = client.post('/rating', json=data, headers=headers)
    assert response.status_code == 400
    assert response.json == {"message": "Rating must be between 1 and 5"}
    mock_submit_rating.assert_not_called()

# UT19 – Submit Rating Failure (FR19)
@patch('database.get_user_id')
@patch('database.submit_rating')
def test_submit_rating_failure(mock_submit_rating, mock_get_user_id, client, access_token):
    mock_get_user_id.return_value = 187  # Mock user ID
    mock_submit_rating.return_value = False  # Simulate failure in rating submission

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    data = {"recipe_id": 1, "rating": 4}  # Valid recipe_id and rating

    response = client.post('/rating', json=data, headers=headers)
    assert response.status_code == 500
    assert response.json == {"message": "Failed to submit rating"}
    mock_submit_rating.assert_called_once_with(187, 1, 4)
