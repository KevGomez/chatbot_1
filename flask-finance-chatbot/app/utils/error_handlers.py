"""Error handling utilities for the application."""
from flask import jsonify, current_app
from app.utils.constants import ERROR_MESSAGES

class ChatbotError(Exception):
    """Base exception class for chatbot errors."""
    def __init__(self, message, status_code=500):
        super().__init__(message)
        self.status_code = status_code

class ValidationError(ChatbotError):
    """Raised when input validation fails."""
    def __init__(self, message):
        super().__init__(message, status_code=400)

class OpenAIError(ChatbotError):
    """Raised when there's an error with OpenAI API."""
    def __init__(self, message):
        super().__init__(message, status_code=503)

def create_error_response(error_msg, status_code, details=None):
    """Create a standardized error response."""
    response = jsonify({
        "error": str(error_msg),
        "status": "error",
        "details": details if details else str(error_msg)
    })
    response.status_code = status_code
    return response

def handle_chatbot_error(error):
    """Handle custom chatbot errors."""
    return create_error_response(str(error), error.status_code)

def handle_validation_error(error):
    """Handle validation errors."""
    return create_error_response(str(error), 400)

def handle_general_error(error):
    """Handle any unhandled exceptions."""
    return create_error_response(
        ERROR_MESSAGES["general_error"],
        500,
        str(error)
    )

def register_error_handlers(app):
    """Register error handlers with the Flask app."""
    app.register_error_handler(ChatbotError, handle_chatbot_error)
    app.register_error_handler(ValidationError, handle_validation_error)
    app.register_error_handler(Exception, handle_general_error) 