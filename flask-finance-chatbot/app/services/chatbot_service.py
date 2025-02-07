from app.services.openai_service import OpenAIService
from app.utils.constants import (
    FINANCE_TOPICS, 
    IDENTITY_KEYWORDS, 
    IDENTITY_RESPONSE, 
    NON_FINANCE_RESPONSE
)
from app.utils.error_handlers import ValidationError, OpenAIError

class ChatbotService:
    """Service for handling chat interactions"""
    
    def __init__(self):
        self.openai_service = OpenAIService()

    def is_finance_question(self, prompt: str) -> bool:
        """Check if the user question is related to personal finance."""
        prompt_lower = prompt.lower()
        return any(topic in prompt_lower for topic in FINANCE_TOPICS)

    def is_identity_question(self, prompt: str) -> bool:
        """Check if the question is about the chatbot's identity."""
        prompt_lower = prompt.lower()
        return any(keyword in prompt_lower for keyword in IDENTITY_KEYWORDS)

    def generate_response(self, user_message: str) -> str:
        """Generate a response to the user's message"""
        try:
            # Add any preprocessing of user message here if needed
            response = self.openai_service.generate_completion(user_message)
            return response
        except Exception as e:
            # Re-raise the exception to be handled by the route error handlers
            raise e 