from flask import Flask
from flask import request
import database

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello, World!"

@app.route("/login", methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']

    if database.login(email, password):
        return "You are logged in", 200
    return "Invalid email or password", 401

@app.route("/register", methods=['POST'])
def register():
    email = request.form['email']
    name = request.form['name']
    password = request.form['password']

    if database.register(email, name, password):
        return "You are registered", 200
    return "Email already in use", 400
