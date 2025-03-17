# tests/test_profile.py

# UT07 – Update Profile Info
def test_update_profile(client):
    client.post("/register", data={"email": "profile@example.com", "name": "Profile User", "password": "123456"})
    login_res = client.post("/login", data={"email": "profile@example.com", "password": "123456"})
    token = login_res.json.get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/update_profile", headers=headers, data={"name": "Updated User", "email": "updated@example.com"})
    assert res.status_code == 200

# UT08 – Set Dietary Preferences
def test_update_dietary_preferences(client):
    client.post("/register", data={"email": "diet@example.com", "name": "Diet User", "password": "123456"})
    login_res = client.post("/login", data={"email": "diet@example.com", "password": "123456"})
    token = login_res.json.get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/update_profile", headers=headers, data={"dietary_preferences": "Vegan"})
    assert res.status_code == 200

# UT09 – Upload Profile Picture (mocked if not implemented)
def test_upload_profile_picture_placeholder(client):
    # Assuming profile pictures are not implemented yet, placeholder test
    assert True
