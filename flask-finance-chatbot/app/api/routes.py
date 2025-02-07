from flask import Blueprint, request, jsonify
from flask_cors import cross_origin  # Import CORS for specific routes
from app.services.chatbot_service import ChatbotService
from app.utils.constants import ERROR_MESSAGES
from app.utils.error_handlers import ValidationError

# Create blueprint
api = Blueprint('api', __name__)
chatbot_service = ChatbotService()

@api.route('/test', methods=['GET'])
@cross_origin(supports_credentials=True)  # Allow CORS for this route with credentials
def test():
    """Test endpoint to verify CORS is working"""
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
        response = jsonify({"status": "success"})
        return response

    try:
        if not request.is_json or not request.json:
            raise ValidationError(ERROR_MESSAGES["invalid_json"])
            
        user_message = request.json.get("message") if request.json else ""
        if not user_message:
            raise ValidationError(ERROR_MESSAGES["empty_message"])

        response_text = chatbot_service.generate_response(user_message)
        return jsonify({
            "response": response_text,
            "status": "success"
        })
    
    except ValidationError as e:
        return jsonify({"error": str(e), "status": "fail"}), 400
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")  # Debugging
        return jsonify({"error": "An internal server error occurred", "status": "fail"}), 500
