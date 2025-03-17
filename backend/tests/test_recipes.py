# tests/test_recipes.py

# UT12 – Search Recipes by Ingredient
def test_search_recipes(client):
    response = client.get("/search?query=chicken")
    assert response.status_code == 200

# UT13 – Apply Restrictions to Search
def test_search_with_restrictions(client):
    response = client.get("/search?query=tofu&filter=vegan")
    assert response.status_code == 200  # Adjust depending on actual endpoint logic

# UT14 – Recipe Recommendation from Ingredients
def test_recipe_recommendations(client):
    client.post("/register", data={"email": "reco@example.com", "name": "Reco User", "password": "123456"})
    login_res = client.post("/login", data={"email": "reco@example.com", "password": "123456"})
    token = login_res.json.get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/recommend", headers=headers, json={"ingredients": ["tomato", "rice"]})
    assert response.status_code == 200
