from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# API Keys
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Flask Configuration
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# API Configuration
MAX_TOKENS = int(os.getenv('MAX_TOKENS', '100'))
TEMPERATURE = float(os.getenv('TEMPERATURE', '0.7'))
MODEL_NAME = os.getenv('MODEL_NAME', 'gpt-3.5-turbo') 