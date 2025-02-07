"""
Main configuration file for the application.
This file sets up different configuration classes for different environments.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration class."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = False
    TESTING = False
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
    MAX_TOKENS = int(os.getenv('MAX_TOKENS', '150'))

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    HOST = 'localhost'
    PORT = 5000

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    HOST = '0.0.0.0'
    PORT = int(os.getenv('PORT', 5000))

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

# Get current configuration
def get_config():
    """Get the current configuration based on FLASK_ENV."""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
