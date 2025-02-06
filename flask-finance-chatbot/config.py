from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from environment variable
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')

class Config:
    """Flask configuration settings"""
    DEEPSEEK_API_KEY = "your_deepseek_api_key"
    OPENAI_API_KEY = "your_openai_api_key"
    DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
