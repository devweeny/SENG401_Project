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
        return jsonify({"message": "You are logged in"}), 200
    return jsonify({"message": "Invalid email or password"}), 401

@app.route("/register", methods=['POST'])
def register():
    email = request.form['email']
    name = request.form['name']
    password = request.form['password']

    if database.register(email, name, password):
        return jsonify({"message": "You are registered"}), 200
    return jsonify({"message": "Email already in use"}), 400
