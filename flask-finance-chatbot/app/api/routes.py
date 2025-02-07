# pylint: skip-file

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin  # Import CORS for specific routes
from app.services.chatbot_service import ChatbotService
from app.utils.constants import ERROR_MESSAGES
from app.utils.logger import app_logger
from app.utils.error_handlers import ValidationError
import openai  # Corrected import

# Create blueprint
api = Blueprint('api', __name__)
chatbot_service = ChatbotService()

@api.route('/test', methods=['GET'])
@cross_origin(supports_credentials=True)  # Allow CORS for this route with credentials
def test():
    """Test endpoint to verify CORS is working"""
    app_logger.info("Test endpoint called")
    return jsonify({"status": "success", "message": "CORS is working!"})

@api.route('/chat', methods=['POST', 'OPTIONS'])
@cross_origin(
    origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "Accept"],
    methods=["POST", "OPTIONS"]
)
def chat():
    """
    Chat endpoint to handle user messages and return responses
    """
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        app_logger.debug("Handling OPTIONS request")
        return jsonify({"status": "success"})

    try:
        app_logger.info("Processing chat request")
        
        if not request.is_json:
            app_logger.error("Invalid request format: Not JSON")
            raise ValidationError(ERROR_MESSAGES["invalid_json"])
            
        request_data = request.get_json()
        if not request_data:
            raise ValidationError(ERROR_MESSAGES["invalid_json"])
            
        user_message = request_data.get("message")
        if not user_message:
            app_logger.error("Invalid request: Empty message")
            raise ValidationError(ERROR_MESSAGES["empty_message"])

        app_logger.info(f"Processing message: {user_message[:50]}...")
        response_text = chatbot_service.generate_response(user_message)
        app_logger.info("Successfully generated response")
        
        return jsonify({
            "response": response_text,
            "status": "success"
        })
    
    except ValidationError as e:
        app_logger.error(f"Validation error: {str(e)}")
        return jsonify({"error": str(e), "status": "fail"}), 400
    
    except openai.AuthenticationError as e:
        app_logger.error(f"OpenAI authentication error: {str(e)}")
        return jsonify({"error": ERROR_MESSAGES["invalid_api_key"], "status": "fail"}), 401

    except openai.RateLimitError as e:
        app_logger.error(f"OpenAI rate limit exceeded: {str(e)}")
        return jsonify({"error": "Rate limit exceeded. Please try again later.", "status": "fail"}), 429

    except openai.APIError as e:
        app_logger.error(f"OpenAI API error: {str(e)}")
        return jsonify({"error": ERROR_MESSAGES["api_error"], "status": "fail"}), 503
    
    except Exception as e:
        app_logger.exception(f"Unexpected error in chat endpoint: {str(e)}")
        return jsonify({
            "error": "An internal server error occurred",
            "status": "fail"
        }), 500
