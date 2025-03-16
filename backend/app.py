from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
import database
# import dotenv
import gemini
import asyncio
import os

app = Flask(__name__)
cors = CORS(app)

# app.config['JWT_SECRET_KEY'] = dotenv.get_key(".env", "JWT_SECRET_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default")
if JWT_SECRET_KEY is None:
    print("WARNING: JWT_SECRET_KEY environment variable is not set, using default (not secure)") 

app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
app.config['CORS_HEADERS'] = 'Content-Type'


jwt = JWTManager(app)

@app.route("/")
def hello():
    return jsonify({"message": "Hello, World!"})


# User: (2, 'testuser@test.com', 'testuser', '$2b$12$CJTLZGs1IcDLJueOCNA6tuPjW8wgDa1ThNNQ/0hqAzMbUk2ne8Zy6', 
# datetime.datetime(2025, 2, 24, 5, 35, 58))
@app.route("/login", methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']
    user = database.login(email, password)
    if user:
        token = create_access_token(identity=user[1])
        user_json = {
            "id": user[0],
            "email": user[1],
            "name": user[2],
            "token": token,
            "created_at": user[4]
        }
        response = jsonify(user_json)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200
    
    response = jsonify({"message": "Invalid email or password"})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response, 401

@app.route("/register", methods=['POST'])
def register():
    email = request.form['email']
    name = request.form['name']
    password = request.form['password']


    if database.register(email, name, password):
        response = jsonify({"message": "You are registered"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200
    
    response = jsonify({"message": "Email already in use"})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response, 400


"""
Request format:
{
    "ingredients": "ingredient1, ingredient2, ingredient3, ..."
}

Response format:
{
    "recipe": [
        {
            "title": "Recipe Title",
            "instructions": ["Instruction 1", "Instruction 2", ...],
            "ingredients": ["ingredient1", "ingredient2", "ingredient3", ...],
            "source": "Recipe Source"
        },
        ...
    ]
}
"""
@app.route("/generate", methods=['POST', 'OPTIONS'])
@cross_origin()
@jwt_required()
def generate():
    print(request.headers)

    ingredients = request.form.get('ingredients').strip().split(",")

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    recipe = loop.run_until_complete(gemini.generate(ingredients))
    response = jsonify({"recipe": recipe})

    return response, 200

@app.route("/add_recipe", methods=['POST'])
@cross_origin()
@jwt_required()
def add_recipe():
    email = get_jwt_identity()
    user_id = database.get_user_id(email)
    name = request.form['name']
    ingredients = request.form['ingredients']
    instructions = request.form['instructions']
    database.add_recipe(user_id, name, ingredients, instructions)
    response = jsonify({"message": "Recipe added successfully"})
    return response, 200

@app.route("/profile", methods=['PUT'])
@cross_origin()
@jwt_required()
def update_profile():
    email = get_jwt_identity()
    user_id = database.get_user_id(email)
    data = request.get_json()
    
    name = data.get('name')
    email = data.get('email')
    dietary_preferences = data.get('dietaryPreferences')
    password = data.get('password')

    updated_user = database.update_user(user_id, name, email, dietary_preferences, password)

    if updated_user:
        token = create_access_token(identity=updated_user[1])
        user_json = {
            "id": updated_user[0],
            "email": updated_user[1],
            "name": updated_user[2],
            "token": token,
            "created_at": updated_user[4]
        }
        response = jsonify(user_json)
        return response, 200
    
    response = jsonify({"message": "Failed to update profile"})
    return response, 400

if __name__ == "__main__":
    app.run(port=5000, debug=True, host='0.0.0.0')
