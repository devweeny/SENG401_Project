from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import dotenv


client = genai.Client(api_key=dotenv.get_key(".env","GEMINI_KEY"))

response = client.models.generate_images(
    model='imagen-3.0-generate-002',
    prompt='Fuzzy bunnies in my kitchen',
    config=types.GenerateImagesConfig(
        number_of_images= 4,
    )
)
for generated_image in response.generated_images:
  image = Image.open(BytesIO(generated_image.image.image_bytes))
  image.show()