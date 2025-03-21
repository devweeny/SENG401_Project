# tests/test_profile.py

# UT06 – Update Profile Info (FR4)
def test_update_profile(client):
    client.post("/register", data={"email": "profile@example.com", "name": "Profile User", "password": "123456"})
    login_res = client.post("/login", data={"email": "profile@example.com", "password": "123456"})
    token = login_res.json.get("token")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.put("/profile", headers=headers, json={"name": "Updated User", "email": "updated@example.com"})
    assert res.status_code == 200

# UT07 – Set Dietary Preferences (FR5)
def test_update_dietary_preferences(client):
    client.post("/register", data={"email": "diet@example.com", "name": "Diet User", "password": "123456"})
    login_res = client.post("/login", data={"email": "diet@example.com", "password": "123456"})
    token = login_res.json.get("token")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.put("/profile", headers=headers, json={"dietaryPreferences": "Vegan"})
    assert res.status_code == 200
