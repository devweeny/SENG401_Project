from flask import Flask, jsonify
from flask import request
import database

app = Flask(__name__)

@app.route("/")
def hello():
    return jsonify({"message": "Hello, World!"})

@app.route("/login", methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']

    if database.login(email, password):
        response = jsonify({"message": "You are logged in"})
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
