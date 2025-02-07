from openai import OpenAI
from app.config.env import OPENAI_API_KEY, MAX_TOKENS, OPENAI_MODEL

class OpenAIService:
    """Service for interacting with OpenAI API"""
    
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.model = OPENAI_MODEL
        self.max_tokens = MAX_TOKENS
        self.temperature = 0.7  # Default temperature

    def generate_completion(self, prompt):
        """Generate completion using OpenAI API"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            raise e 