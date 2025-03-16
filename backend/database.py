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
    conn.close()
    if user is None:
        return False
    if bcrypt.checkpw(password.encode("utf-8"), user[3].encode("utf-8")):
        return user

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

def update_user(user_id, name, email, dietary, password):
    print(f"Updating user id='{user_id}' name='{name}' email='{email}' dietary='{dietary}' password='{password}'")
    cursor = get_connection().cursor()

    if len(name) == 0:
        name = None
    if len(email) == 0:
        email = None
    if len(dietary) == 0:
        dietary = None
    if len(password) == 0:
        password = None
    if name is not None:
        cursor.execute("UPDATE users SET name = %s WHERE user_id = %s", (name, user_id))
    if email is not None:
        cursor.execute("UPDATE users SET email = %s WHERE user_id = %s", (email, user_id))
    # if dietary is not None:
    #     cursor.execute("UPDATE users SET dietary_preferences = %s WHERE user_id = %s", (dietary, user_id))
    if password is not None:
        hashedpw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        cursor.execute("UPDATE users SET password = %s WHERE user_id = %s", (hashedpw, user_id))
    conn.commit()
    cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user

def get_user_id(email):
    cursor = get_connection().cursor()
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    user_id = cursor.fetchone()[0]
    cursor.close()
    return user_id