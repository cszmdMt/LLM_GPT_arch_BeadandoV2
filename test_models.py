import os
from google import genai
from dotenv import load_dotenv

# Load .env from the backend directory
dotenv_path = os.path.join('backend', '.env')
load_dotenv(dotenv_path=dotenv_path)

api_key = os.environ.get("GEMINI_API_KEY")
print(f"Using API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

client = genai.Client(api_key=api_key)

try:
    print("Available models:")
    for m in client.models.list():
        print(f"- {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")
