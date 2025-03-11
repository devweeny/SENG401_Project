from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
import database
# import dotenv
import gemini
import asyncio
import os

app = Flask(__name__)
# app.config['JWT_SECRET_KEY'] = dotenv.get_key(".env", "JWT_SECRET_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default")
if JWT_SECRET_KEY is None:
    print("WARNING: JWT_SECRET_KEY environment variable is not set, using default (not secure)") 

app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY

jwt = JWTManager(app)

@app.route("/")
def hello():
    return jsonify({"message": "Hello, World!"})

@app.route("/login", methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']

    if database.login(email, password):
        response = jsonify({"token": create_access_token(identity=email)})
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
@app.route("/generate", methods=['POST'])
@jwt_required()
def generate():
    current_user = get_jwt_identity()
    ingredients = request.form.get('ingredients').strip().split(",")

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    recipe = loop.run_until_complete(gemini.generate(ingredients))
    response = jsonify({"recipe": recipe})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response, 200

if __name__ == "__main__":
    app.run(port=5000, debug=True, host='0.0.0.0')