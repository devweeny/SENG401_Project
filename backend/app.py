from flask import Flask
import psycopg2

conn = psycopg2.connect(database="postgres", user="postgres", password="password", host="db", port="5432")

cursor = conn.cursor()
cursor.execute("SELECT * FROM users")
rows = cursor.fetchall()
print(rows)

app = Flask(__name__)

@app.route("/login")
def login():
    return "<p>Login</p>"