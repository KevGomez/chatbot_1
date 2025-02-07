# Finance-related topics for validation
FINANCE_TOPICS = [
    "savings", "saving", "budget", "budgeting", "invest", "investing", "investments", 
    "stocks", "mutual funds", "retirement", "financial planning", "credit score", 
    "cryptocurrency", "insurance", "real estate", "taxes", "income", "expenses", 
    "debt", "interest rates", "mortgage", "financial goals",
    "who are you", "what are you", "your name", "who you are", "tell me about yourself"
]

# Identity-related keywords
IDENTITY_KEYWORDS = [
    "who are you", "what are you", "your name", 
    "who you are", "tell me about yourself"
]

# Response Messages
IDENTITY_RESPONSE = """I am your AI Financial Advisor, designed to provide helpful guidance on personal finance topics \
including savings, investments, budgeting, and more. How can I assist you with your financial questions today?"""

NON_FINANCE_RESPONSE = """I can only provide advice related to personal finance. Please ask about savings, investments, \
budgeting, or similar topics."""

ERROR_MESSAGES = {
    "empty_message": "Message cannot be empty",
    "invalid_json": "Invalid JSON",
    "general_error": "An error occurred while processing your request"
} 