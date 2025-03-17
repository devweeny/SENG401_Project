# tests/test_favourites.py

# UT18 – Remove Favourite (assumes /favorites/remove)
def test_remove_favorite(client):
    client.post("/register", data={"email": "fav@example.com", "name": "Fav User", "password": "123456"})
    login_res = client.post("/login", data={"email": "fav@example.com", "password": "123456"})
    token = login_res.json.get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # Simulate saving a favorite
    client.post("/favorites/add", headers=headers, json={"recipe_id": 123})

    # Remove it
    response = client.post("/favorites/remove", headers=headers, json={"recipe_id": 123})
    assert response.status_code == 200
