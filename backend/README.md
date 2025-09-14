# Backend - Quiz Game API

A FastAPI-based backend service that powers a real-time multiplayer quiz game with AI-generated questions using Mistral AI and Firebase Firestore for data persistence.

## 🚀 Features

- **AI-Powered Question Generation**: Uses Mistral AI to generate themed quiz questions with structured output
- **Real-time Multiplayer Support**: Multiple players can join game sessions simultaneously
- **Firebase Integration**: Persistent storage of game sessions and questions using Firestore
- **RESTful API**: Clean, documented endpoints for frontend integration
- **Docker Support**: Containerized deployment with Docker and docker-compose
- **CORS Enabled**: Ready for web frontend integration
- **Environment Flexibility**: Supports both local development and cloud deployment

## 📁 Project Structure

```
backend/
├── game_api.py          # Main FastAPI application with all endpoints
├── game_client_demo.py  # Demo client for testing API functionality
├── pyproject.toml       # Project dependencies and metadata
├── Dockerfile           # Container configuration
├── docker-compose.yml   # Multi-service deployment setup
├── cred.json           # Firebase credentials (local development)
└── README.md           # This file
```

## 🛠 Installation & Setup

### Prerequisites

- Python 3.11+
- UV package manager (recommended) or pip
- Firebase project with Firestore enabled
- Mistral AI API key

### Environment Variables

Create a `.env` file in the backend directory:

```env
MISTRAL_API_KEY=your_mistral_api_key_here
FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_service_account_json
GCP_DEPLOYMENT=false  # Set to true for Google Cloud Platform deployment
```

### Option 1: Using UV (Recommended)

```bash
# Install dependencies
uv sync

# Run the development server
uv run python game_api.py
```

### Option 2: Using Docker

```bash
# Build and run with docker-compose
docker-compose up --build

# Or run with Docker directly
docker build -t quiz-game-api .
docker run -p 8000:8000 quiz-game-api
```

### Option 3: Manual Setup

```bash
# Install dependencies with pip
pip install fastapi uvicorn mistralai firebase-admin python-dotenv

# Run the server
python game_api.py
```

## 🔥 Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Create a service account and download the JSON key
4. For local development: Save as `cred.json` in the backend directory
5. For production: Set the `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable

## 🔧 API Endpoints

### Health Check
- **GET** `/` - API health check

### Session Management
- **POST** `/create-session` - Create a new game session
  ```json
  {
    "theme": "general knowledge"  // Optional, defaults to "general knowledge"
  }
  ```

- **POST** `/add-user-to-session` - Add a player to existing session
  ```json
  {
    "name": "PlayerName",
    "session_id": "abc123"
  }
  ```

### Game Flow
- **GET** `/next-question/{session_id}` - Get the current question
- **POST** `/answer` - Submit an answer
  ```json
  {
    "session_id": "abc123",
    "user_id": "user456",
    "answer": 2  // 0-based index of selected option
  }
  ```

### Scoring & Management
- **GET** `/scores/{session_id}` - Get live leaderboard
- **POST** `/advance-question/{session_id}` - Advance to next question (host only)

## 🤖 AI Integration

The backend integrates with Mistral AI to generate contextual quiz questions:

```python
# Example of AI-generated questions
{
  "questions": [
    {
      "id": 1,
      "question": "What is the capital of France?",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "correct": 2
    }
  ]
}
```

### Supported Themes
- General Knowledge
- Science & Technology
- History
- Geography
- Sports
- Entertainment
- Custom themes (AI adapts to any topic)

## 💾 Data Storage

### In-Memory Sessions
Current game state is stored in memory for fast access:
```python
sessions = {
  "session_id": {
    "users": {},
    "scores": {},
    "current_question": 0,
    "questions": [],
    "theme": "general knowledge"
  }
}
```

### Firestore Persistence
Questions and session metadata are persisted in Firestore:
```
Collection: quiz_sessions
Document ID: session_id
Fields:
  - session_id: string
  - theme: string
  - questions: array
  - created_at: timestamp
  - total_questions: number
```

## 🧪 Testing

Test the API using the included demo client:

```bash
# Run the demo client
python game_client_demo.py
```

Or test manually using curl:

```bash
# Create a session
curl -X POST http://localhost:8000/create-session \
  -H "Content-Type: application/json" \
  -d '{"theme": "science"}'

# Add a user
curl -X POST http://localhost:8000/add-user-to-session \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "session_id": "your_session_id"}'
```

## 🚀 Deployment

### Local Development
```bash
uvicorn game_api:app --reload --host 0.0.0.0 --port 8000
```

### Production with Docker
```bash
docker-compose up -d
```

### Environment-Specific Configuration
- **Local**: Uses `cred.json` file for Firebase credentials
- **GitHub Actions**: Uses `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable
- **Google Cloud**: Uses default application credentials

## 🔒 Security Considerations

- CORS is currently set to allow all origins (`"*"`) for development
- In production, restrict CORS origins to your frontend domain
- Store sensitive credentials in environment variables, not in code
- Implement rate limiting for production use
- Add authentication/authorization as needed

## 📝 Error Handling

The API includes comprehensive error handling:
- 404 for non-existent sessions/users
- 400 for invalid requests
- Graceful fallback to default questions if AI generation fails
- Detailed error messages for debugging

## 🤝 Contributing

1. Ensure all endpoints work with the demo client
2. Test AI question generation with various themes
3. Verify Firebase integration works in both local and cloud environments
4. Update this README for any new features or endpoints

## 📊 Performance Notes

- AI question generation takes 2-5 seconds depending on theme complexity
- In-memory session storage provides sub-millisecond response times
- Firestore operations are async and non-blocking
- Consider implementing Redis for session storage in high-traffic scenarios