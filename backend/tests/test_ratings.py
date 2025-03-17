# tests/test_ratings.py

# UT22 – Rate Recipe
def test_submit_rating(client):
    client.post("/register", data={"email": "rate@example.com", "name": "Rate User", "password": "123456"})
    login_res = client.post("/login", data={"email": "rate@example.com", "password": "123456"})
    token = login_res.json.get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/rate", headers=headers, json={"recipe_id": 123, "rating": 4})
    assert response.status_code == 200
