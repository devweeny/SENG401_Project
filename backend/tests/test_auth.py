# tests/test_auth.py

# UT01 – Register with valid email and password (FR1)
def test_register_valid(client):
    response = client.post("/register", data={
        "email": "test_valid@example.com",
        "name": "Test User",
        "password": "123456"
    })
    assert response.status_code == 200
    assert b"You are registered" in response.data

# UT02 – Register with invalid email (FR1)
def test_register_invalid_email(client):
    response = client.post("/register", data={
        "email": "invalid_email",
        "name": "Test User",
        "password": "123456"
    })
    assert response.status_code in [400, 422]

# UT03 – Register with short password (Boundary Value) (FR1)
def test_register_short_password(client):
    response = client.post("/register", data={
        "email": "shortpass@example.com",
        "name": "Short Pass",
        "password": "123"
    })
    assert response.status_code in [400, 422]

# UT04 – Login with valid credentials (FR2)
def test_login_valid(client):
    client.post("/register", data={
        "email": "loginuser@example.com",
        "name": "Login User",
        "password": "123456"
    })
    response = client.post("/login", data={
        "email": "loginuser@example.com",
        "password": "123456"
    })
    assert response.status_code == 200
    assert b"token" in response.data or b"access_token" in response.data

# UT05 – Login with invalid password (FR2)
def test_login_invalid_password(client):
    client.post("/register", data={
        "email": "wrongpass@example.com",
        "name": "Wrong Pass",
        "password": "123456"
    })
    response = client.post("/login", data={
        "email": "wrongpass@example.com",
        "password": "wrong"
    })
    assert response.status_code == 401
    assert b"Invalid email or password" in response.data
