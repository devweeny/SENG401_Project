import bcrypt
import mysql.connector
import os

conn = None

host = os.getenv("DB_HOST", "127.0.0.1")
user = os.getenv("DB_USER", "mealmatcher")
database = os.getenv("DB_DATABASE", "mealmatcher")
password = os.getenv("DB_PASSWORD", "password")
port = os.getenv("DB_PORT", 3306)

def get_connection():
    global conn
    if conn is None or not conn.is_connected():
        conn = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database
        )
    return conn

def login(email, password):
    cursor = get_connection().cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    print(user)
    conn.close()
    if user is None:
        return False
    return bcrypt.checkpw(password.encode("utf-8"), user[3].encode("utf-8"))

def register(email, name, password):
    cursor = get_connection().cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    if cursor.fetchone() is not None:
        return False
    hashedpw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    cursor.execute("INSERT INTO users (email, name, password) VALUES (%s, %s, %s)", (email, name, hashedpw))
    conn.commit()
    conn.close()
    return True

def add_recipe(user_id, name, ingredients, instructions):
    cursor = get_connection().cursor()
    cursor.execute(
        "INSERT INTO recipes (user_id, name, ingredients, instructions) VALUES (%s, %s, %s, %s)",
        (user_id, name, ingredients, instructions),
    )
    conn.commit()
    cursor.close()

#This will retrieve all recipes for a specific user
def get_recipes(user_id):
    cursor = get_connection().cursor(dictionary=True)
    cursor.execute("SELECT * FROM recipes WHERE user_id = %s", (user_id,))
    recipes = cursor.fetchall()
    cursor.close()
    return recipes