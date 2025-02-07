from openai import OpenAI
from app.config.env import OPENAI_API_KEY, MAX_TOKENS, TEMPERATURE, MODEL_NAME

class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.model = MODEL_NAME
        self.max_tokens = MAX_TOKENS
        self.temperature = TEMPERATURE

    def generate_completion(self, system_prompt: str, user_prompt: str) -> str:
        """
        Generate a completion using OpenAI's API
        
        Args:
            system_prompt (str): The system message to set the context
            user_prompt (str): The user's message/prompt
            
        Returns:
            str: The generated response
            
        Raises:
            Exception: If there's an error generating the completion
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
            )
            
            # Check if we have a valid response
            if not response.choices or not response.choices[0].message:
                raise ValueError("No valid response received from OpenAI")
                
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            # In a production environment, you would want to log this error
            print(f"Error generating completion: {str(e)}")
            raise 