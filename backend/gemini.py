from google import genai
from google.genai import types
import json
import re
import asyncio
import os

API_KEY = os.getenv("GEMINI_KEY", "asd")
# import dotenv
# API_KEY = dotenv.get_key(".env", "GEMINI_KEY")

if API_KEY is None:
    raise ValueError("GEMINI_KEY environment variable is not set")

async def generate(ingredients: list, dietary_preferences: list):
    client = genai.Client(api_key=API_KEY)
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, lambda: client.models.generate_content(
    model='gemini-2.0-flash',
    contents=(
        "Generate exactly 3 recipes using some of the following ingredients: " + ", ".join(ingredients) + ". "
        "Each recipe must include a source. Return the response as a JSON array containing three objects, "
        "each with the following fields: title, instructions, ingredients, source, prepTime, cookTime, and difficulty. "
        "prepTime and cookTime should be strings in the format \"X minutes\". "
        "The instructions field must be a list of strings (e.g., [\"Step 1: do this\", \"Step 2: do that\"]). "
        "The difficulty field must be one of the following: Easy, Medium, or Hard. "
        "The ingredients field must be a list strings (e.g., [\"1 cup flour\", \"1/2 cup sugar\"]). "
        "Ensure the recipes follow these dietary preferences: " + ", ".join(dietary_preferences) + ". "
        "Do not add extra formatting or explanations—only return valid JSON."
    ),
    config=types.GenerateContentConfig(
        max_output_tokens=2000,
    ),
))

    # {\"title\": \"Recipe Title\", \"instructions\": \"Recipe Instructions\", \"ingredients\": [\"ingredient1\", \"ingredient2\", \"ingredient3\"], \"source\": \"Recipe Source\"}"
    print(response.text)
    return clean_json(response.text)

def clean_json(text):
    # Try to find the full JSON structure
    match = re.search(r'\[.*\]', text, re.DOTALL)
    if match:
        cleaned_text = match.group(0)
    else:
        return {"error": "No valid JSON array found", "raw_response": text}

    # Attempt to parse JSON
    try:
        loaded = json.loads(cleaned_text)
        
        # Ensure we have a list
        if not isinstance(loaded, list):
            return {"error": "Extracted JSON is not a list", "raw_response": cleaned_text}
        
        # Convert instructions to a list
        for recipe in loaded:
            if "instructions" in recipe and isinstance(recipe["instructions"], str):
                recipe["instructions"] = recipe["instructions"].split("\n")
        
        return loaded
    except json.JSONDecodeError as e:
        return {"error": "Failed to parse response as JSON", "raw_response": cleaned_text, "message": str(e)}
    

if __name__ == "__main__":
    print(clean_json(
        "[ {\"title\": \"Creamy Tomato Soup (Vegetarian, Gluten-Free)\", "
        "\"instructions\": \"1. Heat olive oil in a large pot over medium heat. Add onion and garlic, cook until softened (about 5 minutes). 2. Add diced tomatoes, vegetable broth, dried basil, salt, and pepper. Bring to a boil, then reduce heat and simmer for 20 minutes. 3. Use an immersion blender to blend the soup until smooth. 4. Stir in coconut milk and heat through. Garnish with fresh basil if desired.\", "
        "\"ingredients\": ["
        "{\"name\": \"Olive Oil\", \"quantity\": \"2 tablespoons\"}, "
        "{\"name\": \"Onion, chopped\", \"quantity\": \"1 medium\"}, "
        "{\"name\": \"Garlic, minced\", \"quantity\": \"2 cloves\"}, "
        "{\"name\": \"Diced Tomatoes (canned)\", \"quantity\": \"28 ounces\"}, "
        "{\"name\": \"Vegetable Broth\", \"quantity\": \"4 cups\"}, "
        "{\"name\": \"Dried Basil\", \"quantity\": \"1 teaspoon\"}, "
        "{\"name\": \"Salt\", \"quantity\": \"1/2 teaspoon\"}, "
        "{\"name\": \"Black Pepper\", \"quantity\": \"1/4 teaspoon\"}, "
        "{\"name\": \"Coconut Milk (full-fat)\", \"quantity\": \"1/2 cup\"}, "
        "{\"name\": \"Fresh Basil (optional)\", \"quantity\": \"for garnish\"}]"
    ))