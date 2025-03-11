import dotenv
from google import genai
import json
import re
import asyncio

if __name__ == "__main__":
    ingredients = ["chicken", "eggs", "milk", "cream", "butter", "flour", "sugar", "salt", 
                "pepper", "onions", "garlic", "tomatoes", "potatoes", "carrots", "celery", 
                "broccoli", "spinach", "lettuce", "cabbage", "peas", "beans", "rice", "pasta", 
                "bread", "cheese", "bacon", "ham", "beef", "pork", "lamb", "fish", "shrimp", "crab", 
                "lobster", "clams", "mussels", "oysters", "squid", "octopus", "scallops", "mushrooms", 
                "bell peppers", "chili peppers", "jalapenos", "avocado", "lemons", "limes", "oranges"]


    client = genai.Client(api_key=dotenv.get_key(".env","GEMINI_KEY"))
    response = client.models.generate_content(
        model='gemini-2.0-flash', contents="Give me 3 recipes using some of the following ingredients: " + ", ".join(ingredients) + ". Provide a source for the recipe."
    )
    print(response.text)

async def generate(ingredients: list):
    client = genai.Client(api_key=dotenv.get_key(".env","GEMINI_KEY"))
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, lambda: client.models.generate_content(
        model='gemini-2.0-flash', contents="Give me 3 recipes using some of the following ingredients: " + ", ".join(ingredients) + ". Provide a source for the recipe. Return the result in a pure json format without any extra formatting. " + 
        "Keep title, instructions, ingredients, and source as the different inputs. Do not escape any displays, do not format the output for readability. An example output would look as follows: {\"title\": \"Recipe Title\", \"instructions\": \"Recipe Instructions\", \"ingredients\": [\"ingredient1\", \"ingredient2\", \"ingredient3\"], \"source\": \"Recipe Source\"}"
    ))
    # print(clean_json(response.text))
    return clean_json(response.text)

def clean_json(text):
    # Remove unnecessary characters and trim spaces
    cleaned_text = re.sub(r'\s+', ' ', text.strip())
    # Extract content within the JSON-like structure
    match = re.search(r'\[\s*{.*?}\s*]', cleaned_text)
    if match:
        cleaned_text = match.group(0)
    # Attempt to parse JSON
    try:
        loaded = json.loads(cleaned_text)
        for recipe in loaded:
            recipe["instructions"] = recipe["instructions"].split("\n")
        return loaded
    except json.JSONDecodeError:
        return {"error": "Failed to parse response as JSON", "raw_response": cleaned_text}