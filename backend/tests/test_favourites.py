# tests/test_favourites.py

def test_add_recipe(client):
    # Register a new user
    register_res = client.post("/register", data={"email": "recipe@example.com", "name": "Recipe User", "password": "123456"})
    assert register_res.status_code == 200

    # Log in the user
    login_res = client.post("/login", data={"email": "recipe@example.com", "password": "123456"})
    assert login_res.status_code == 200
    token = login_res.json.get("token")
    headers = {"Authorization": f"Bearer {token}"}

    # Add a recipe
    add_recipe_res = client.post("/add_recipe", headers=headers, json={"name": "Test Recipe", "ingredients": "ingredient1, ingredient2", "instructions": "Step 1, Step 2"})
    assert add_recipe_res.status_code == 200
    recipe_id = add_recipe_res.json.get("recipe_id")

    # Verify the recipe ID is returned
    assert recipe_id is not None

def test_remove_favorite(client):
    # Register a new user
    register_res = client.post("/register", data={"email": "fav@example.com", "name": "Fav User", "password": "123456"})

    # Log in the user
    login_res = client.post("/login", data={"email": "fav@example.com", "password": "123456"})
    token = login_res.json.get("token")
    headers = {"Authorization": f"Bearer {token}"}

    # Simulate saving a favorite
    add_recipe_res = client.post("/add_recipe", headers=headers, json={"name": "Test Recipe", "ingredients": "ingredient1, ingredient2", "instructions": "Step 1, Step 2"})
    recipe_id = add_recipe_res.json.get("recipe_id")

    # Verify the recipe ID is returned
    assert recipe_id is not None

    # Add to favorites
    client.post("/add_favorite", headers=headers, json={"recipe_id": recipe_id})

    # Remove it
    response = client.post("/remove_recipe", headers=headers, json={"recipe_id": recipe_id})
    assert response.status_code == 200
