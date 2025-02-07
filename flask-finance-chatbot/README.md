# Financial Advisor Chatbot

A Flask-based chatbot that provides financial advice using OpenAI's GPT-3.5 model.

## Features

- Financial topic validation
- OpenAI GPT-3.5 integration
- RESTful API endpoints
- CORS support
- Environment-based configuration

## Project Structure

```
📦 flask-finance-chatbot
 ┣ 📂 app
 ┃ ┣ 📂 api
 ┃ ┃ ┗ 📜 routes.py
 ┃ ┣ 📂 services
 ┃ ┃ ┣ 📜 chatbot_service.py
 ┃ ┃ ┗ 📜 openai_service.py
 ┃ ┣ 📂 utils
 ┃ ┃ ┗ 📜 constants.py
 ┃ ┣ 📂 config
 ┃ ┃ ┗ 📜 env.py
 ┃ ┣ 📜 __init__.py
 ┗ 📜 run.py
```

## Setup

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   FLASK_ENV=development
   DEBUG=True
   ```

## Running the Application

```bash
python run.py
```

The server will start at `http://localhost:5000`

## API Endpoints

### POST /api/chat

Send a message to the chatbot:

```json
{
  "message": "How should I start investing?"
}
```

Response:

```json
{
  "response": "To start investing, consider these steps..."
}
```

## Error Handling

The API returns appropriate error messages for:

- Invalid JSON requests
- Empty messages
- Non-financial topics
- Server errors

## Development

To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
