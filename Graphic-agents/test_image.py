import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

print("Testing gpt-image-2 image generation...")

result = client.images.generate(
    model="gpt-image-2",
    prompt="A futuristic AI engineer working on holographic screens",
    size="1024x1024"
)

image_url = result.data[0].url
print(f"SUCCESS! Image URL: {image_url}")
