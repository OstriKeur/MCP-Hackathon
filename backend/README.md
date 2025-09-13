# Game Session API

A simple trivia game API built with FastAPI that supports multiple players and real-time scoring.

## Features

- Create game sessions with unique IDs
- Add multiple players to sessions
- Random trivia questions (3 per game)
- Real-time scoring and leaderboards
- CORS enabled for web frontend integration

## Files

- `game_api.py` - Main FastAPI application
- `game_client_demo.py` - Demo client to test the API
- `Dockerfile` - Container configuration
- `docker-compose.yml` - Easy deployment setup

## Quick Start

### Using Docker (Recommended)

```bash
# Build and run with docker-compose
docker-compose up --build

# Or run with Docker directly
docker build -t game-api .
docker run -p 8000:8000 game-api
```

### Manual Setup

```bash
# Install dependencies
uv sync

# Run the server
python game_api.py

# Test with demo client (in another terminal)
python game_client_demo.py
```

## API Endpoints

- `GET /` - Health check
- `POST /create-session` - Create new game session
- `POST /add-user-to-session` - Add player to session
- `GET /next-question/{session_id}` - Get current question
- `POST /answer` - Submit answer
- `GET /scores/{session_id}` - Get live scoreboard
- `POST /advance-question/{session_id}` - Move to next question

The API will be available at `http://localhost:8000`
