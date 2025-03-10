import dotenv
from google import genai

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
