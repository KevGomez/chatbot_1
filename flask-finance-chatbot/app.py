from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from config import HUGGINGFACE_API_KEY

app = Flask(__name__)
CORS(app)

# Allowed finance-related topics
FINANCE_TOPICS = [
    "savings", "saving", "budget", "budgeting", "invest", "investing", "investments", 
    "stocks", "mutual funds", "retirement", "financial planning", "credit score", 
    "cryptocurrency", "insurance", "real estate", "taxes", "income", "expenses", 
    "debt", "interest rates", "mortgage", "financial goals",
    "who are you", "what are you", "your name", "who you are", "tell me about yourself"
]

def is_finance_question(prompt: str) -> bool:
    """Check if the user question is related to personal finance."""
    prompt_lower = prompt.lower()
    print(f"Checking prompt: {prompt_lower}")  # Debug log
    for topic in FINANCE_TOPICS:
        if topic in prompt_lower:
            print(f"Found topic: {topic}")  # Debug log
            return True
    print("No finance topic found")  # Debug log
    return False

def generate_response(prompt):
    """Uses Hugging Face Inference API to get responses from BLOOM."""
    if not is_finance_question(prompt):
        return "I can only provide advice related to personal finance. Please ask about savings, investments, budgeting, or similar topics."

    # Check for identity-related questions
    identity_keywords = ["who are you", "what are you", "your name", "who you are", "tell me about yourself"]
    if any(keyword in prompt.lower() for keyword in identity_keywords):
        return "I am your AI Financial Advisor, designed to provide helpful guidance on personal finance topics including savings, investments, budgeting, and more. How can I assist you with your financial questions today?"

    # Construct a more specific financial prompt
    financial_prompt = (
        "You are a helpful financial advisor. Provide clear and practical advice for the following question:\n\n"
        f"Question: {prompt}\n\n"
        "Answer:"
    )
    
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    data = {
        "inputs": financial_prompt,
        "parameters": {
            "max_length": 2000,
            "temperature": 0.7,
            "return_full_text": True,
            "do_sample": True,
            "top_p": 0.95,
            "stop": ["\n\n", "Question:"],
            "num_return_sequences": 1
        }
    }

    print(f"Sending request to API with prompt: {financial_prompt}")  # Debug log
    
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            response = requests.post(
                "https://api-inference.huggingface.co/models/bigscience/bloom",
                headers=headers,
                json=data,
                timeout=30
            )
            
            print(f"API Response Status: {response.status_code}")  # Debug log
            print(f"Raw API Response: {response.text}")  # Debug log
            
            # Check if model is loading
            if response.status_code == 503 or "loading" in response.text.lower():
                print("Model is loading, waiting to retry...")  # Debug log
                retry_count += 1
                if retry_count < max_retries:
                    import time
                    time.sleep(20)  # Wait 20 seconds before retrying
                    continue
                else:
                    return "The model is still loading. Please try again in a minute."
            
            if response.status_code == 200:
                response_data = response.json()
                print(f"Parsed Response Data: {response_data}")  # Debug log
                
                if isinstance(response_data, list) and len(response_data) > 0:
                    generated_text = response_data[0].get('generated_text', '')
                    if 'Answer:' in generated_text:
                        answer = generated_text.split('Answer:')[-1].strip()
                    else:
                        answer = generated_text.strip()
                    
                    if not answer:
                        return "I apologize, but I couldn't generate a proper response. Please try asking your question again."
                        
                    return answer
                else:
                    return "Unexpected API response format. Please try again."
            else:
                error_msg = f"Error {response.status_code}: {response.text}"
                print(f"Error Response: {error_msg}")  # Debug log
                return f"Sorry, there was an error processing your request: {error_msg}"
                
        except Exception as e:
            print(f"Exception occurred: {str(e)}")  # Debug log
            retry_count += 1
            if retry_count < max_retries:
                time.sleep(20)  # Wait 20 seconds before retrying
                continue
            return f"An error occurred while processing your request: {str(e)}"
    
    return "Failed to get a response after multiple attempts. Please try again later."

@app.route('/chat', methods=['POST'])
def chat():
    """Receives user input and returns financial advice or blocks unrelated questions."""
    if not request.json:
        return jsonify({"error": "Invalid JSON"}), 400
        
    data = request.json
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    response_text = generate_response(user_message)
    return jsonify({"response": response_text})

if __name__ == '__main__':
    app.run(debug=True)
