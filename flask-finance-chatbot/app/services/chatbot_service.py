from app.services.openai_service import OpenAIService
from app.utils.constants import (
    FINANCE_TOPICS, 
    IDENTITY_KEYWORDS, 
    IDENTITY_RESPONSE, 
    NON_FINANCE_RESPONSE
)
from app.utils.error_handlers import ValidationError, OpenAIError

class ChatbotService:
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

    def generate_response(self, prompt: str) -> str:
        """Generate a response for the user's prompt."""
        if not prompt:
            raise ValidationError("Prompt cannot be empty")

        if not self.is_finance_question(prompt):
            return NON_FINANCE_RESPONSE

        if self.is_identity_question(prompt):
            return IDENTITY_RESPONSE

        system_prompt = "You are a knowledgeable financial advisor providing clear, practical, and ethical financial advice."
        user_prompt = f"Provide clear and practical advice for the following question:\n\nQuestion: {prompt}\n\nAnswer:"

        try:
            response = self.openai_service.generate_completion(system_prompt, user_prompt)
            if not response:
                raise OpenAIError("Failed to generate a response")
            return response
        except Exception as e:
            raise OpenAIError(f"Error generating response: {str(e)}") 