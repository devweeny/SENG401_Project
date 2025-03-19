# tests/test_ratings.py

# UT22 – Rate Recipe
def test_submit_rating(client):
    client.post("/register", data={"email": "rate@example.com", "name": "Rate User", "password": "123456"})
    login_res = client.post("/login", data={"email": "rate@example.com", "password": "123456"})
    token = login_res.json.get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # Create a recipe first
    recipe_res = client.post("/add_recipe", headers=headers, json={
        "name": "Test Recipe",
        "ingredients": "ingredient1, ingredient2",
        "instructions": "Step 1, Step 2"
    })
    assert recipe_res.status_code == 200
    recipe_id = recipe_res.json.get("recipe_id")

    response = client.post("/rating", headers=headers, json={"recipe_id": recipe_id, "rating": 4})
    assert response.status_code == 200
