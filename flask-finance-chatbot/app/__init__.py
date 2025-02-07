from flask import Flask
from flask_cors import CORS
from app.api.routes import api
from app.config.env import FLASK_ENV, DEBUG
from app.utils.error_handlers import register_error_handlers

def create_app():
    """Application factory function"""
    app = Flask(__name__)
    
    # Configure app
    app.config['ENV'] = FLASK_ENV
    app.config['DEBUG'] = DEBUG
    
    # Initialize CORS with development configuration
    CORS(app, 
         supports_credentials=True,
         resources={r"/api/*": {
             "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
             "methods": ["GET", "HEAD", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
             "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials", "Accept"],
             "expose_headers": ["Content-Range", "X-Content-Range"],
             "max_age": 120,
             "send_wildcard": False,
             "allow_credentials": True
         }}
    )
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register blueprints
    app.register_blueprint(api, url_prefix='/api')
    
    return app 