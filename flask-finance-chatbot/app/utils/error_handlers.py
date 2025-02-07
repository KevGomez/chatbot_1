"""Error handling utilities for the application."""
from flask import jsonify, current_app
from app.utils.constants import ERROR_MESSAGES

class ChatbotError(Exception):
    """Base exception class for chatbot errors."""
    def __init__(self, message, status_code=500):
        super().__init__(message)
        self.status_code = status_code

class ValidationError(Exception):
    """Raised when input validation fails."""
    pass

class OpenAIError(ChatbotError):
    """Raised when there's an error with OpenAI API."""
    def __init__(self, message):
        super().__init__(message, status_code=503)

class APIError(Exception):
    """Raised when there's an error with external API calls."""
    pass

class DatabaseError(Exception):
    """Raised when there's an error with database operations."""
    pass

class AuthenticationError(Exception):
    """Raised when there's an authentication error."""
    pass

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
    from app.utils.logger import app_logger

    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        app_logger.error(f"Validation error: {str(error)}")
        return jsonify({"error": str(error), "status": "fail"}), 400

    @app.errorhandler(APIError)
    def handle_api_error(error):
        app_logger.error(f"API error: {str(error)}")
        return jsonify({"error": str(error), "status": "fail"}), 503

    @app.errorhandler(DatabaseError)
    def handle_database_error(error):
        app_logger.error(f"Database error: {str(error)}")
        return jsonify({"error": "A database error occurred", "status": "fail"}), 503

    @app.errorhandler(AuthenticationError)
    def handle_auth_error(error):
        app_logger.error(f"Authentication error: {str(error)}")
        return jsonify({"error": str(error), "status": "fail"}), 401

    @app.errorhandler(404)
    def handle_not_found(error):
        app_logger.error(f"Not found error: {str(error)}")
        return jsonify({"error": "Resource not found", "status": "fail"}), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(error):
        app_logger.error(f"Method not allowed error: {str(error)}")
        return jsonify({"error": "Method not allowed", "status": "fail"}), 405

    @app.errorhandler(500)
    def handle_internal_server_error(error):
        app_logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            "error": "An internal server error occurred",
            "status": "fail"
        }), 500

    app.register_error_handler(ChatbotError, handle_chatbot_error)
    app.register_error_handler(ValidationError, handle_validation_error)
    app.register_error_handler(Exception, handle_general_error) 