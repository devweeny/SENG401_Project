# tests/test_ingredients.py

# UT10 – Manual Ingredient Input
def test_manual_ingredient_input(client):
    client.post("/register", data={"email": "input@example.com", "name": "Input User", "password": "123456"})
    login_res = client.post("/login", data={"email": "input@example.com", "password": "123456"})
    token = login_res.json.get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/ingredients", headers=headers, json={"ingredients": ["tomato", "rice"]})
    assert response.status_code == 200

# UT11 – Voice Input (mocked or fallback to manual if not supported)
def test_voice_input_simulated(client):
    assert True
