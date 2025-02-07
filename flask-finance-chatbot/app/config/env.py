import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Flask Configuration
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# OpenAI Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
MAX_TOKENS = int(os.getenv('MAX_TOKENS', '150'))

# API Configuration
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

# Error Messages
ERROR_MESSAGES = {
    "invalid_json": "Invalid JSON payload",
    "empty_message": "Message cannot be empty",
    "api_error": "Error communicating with OpenAI API",
    "invalid_api_key": "Invalid OpenAI API key"
} 