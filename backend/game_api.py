from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List
import uuid
import random

app = FastAPI(title="Game Session API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage: session_id → { users, scores, current_question }
sessions: Dict[str, dict] = {}

# Simple question bank
QUESTIONS = [
    {"id": 1, "question": "What is the capital of France?", "options": ["London", "Berlin", "Paris", "Madrid"], "correct": 2},
    {"id": 2, "question": "What is 2 + 2?", "options": ["3", "4", "5", "6"], "correct": 1},
    {"id": 3, "question": "Which planet is closest to the Sun?", "options": ["Venus", "Mercury", "Earth", "Mars"], "correct": 1},
    {"id": 4, "question": "What is the largest ocean?", "options": ["Atlantic", "Indian", "Arctic", "Pacific"], "correct": 3},
    {"id": 5, "question": "Who painted the Mona Lisa?", "options": ["Van Gogh", "Da Vinci", "Picasso", "Monet"], "correct": 1}
]

# Request models
class AddUserRequest(BaseModel):
    name: str
    session_id: str

class AnswerRequest(BaseModel):
    session_id: str
    user_id: str
    answer: int

# Endpoints
@app.get("/")
async def root():
    return {"message": "Game API is running!"}

@app.post("/create-session")
async def create_session():
    """Create a new game session"""
    session_id = str(uuid.uuid4())[:8]  # Short ID
    
    sessions[session_id] = {
        "users": {},  # user_id -> {"name": str, "score": int}
        "scores": {},  # user_id -> score
        "current_question": 0,
        "questions": random.sample(QUESTIONS, 3)  # 3 random questions
    }
    
    return {"session_id": session_id}

@app.post("/add-user-to-session")
async def add_user_to_session(request: AddUserRequest):
    """Add user to session"""
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[request.session_id]
    
    # Check if name exists
    for user_data in session["users"].values():
        if user_data["name"].lower() == request.name.lower():
            raise HTTPException(status_code=400, detail="Name already taken")
    
    user_id = str(uuid.uuid4())[:8]
    session["users"][user_id] = {"name": request.name, "score": 0}
    session["scores"][user_id] = 0
    
    return {"user_id": user_id, "message": f"User {request.name} added"}

@app.get("/next-question/{session_id}")
async def next_question(session_id: str):
    """Get next question"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    current_idx = session["current_question"]
    
    if current_idx >= len(session["questions"]):
        return {"finished": True, "message": "No more questions"}
    
    question = session["questions"][current_idx].copy()
    question.pop("correct")  # Don't send correct answer
    question["question_number"] = current_idx + 1
    question["total_questions"] = len(session["questions"])
    
    return question

@app.post("/answer")
async def submit_answer(request: AnswerRequest):
    """Submit answer and update score"""
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[request.session_id]
    
    if request.user_id not in session["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_idx = session["current_question"]
    if current_idx >= len(session["questions"]):
        raise HTTPException(status_code=400, detail="No active question")
    
    current_question = session["questions"][current_idx]
    correct_answer = current_question["correct"]
    is_correct = request.answer == correct_answer
    
    # Update score if correct
    if is_correct:
        session["users"][request.user_id]["score"] += 1
        session["scores"][request.user_id] += 1
    
    new_score = session["users"][request.user_id]["score"]
    
    return {
        "correct": is_correct,
        "correct_answer": correct_answer,
        "new_score": new_score
    }

@app.get("/scores/{session_id}")
async def get_scores(session_id: str):
    """Get live scoreboard"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    
    # Build scoreboard
    scores = []
    for user_id, user_data in session["users"].items():
        scores.append({
            "user_id": user_id,
            "name": user_data["name"],
            "score": user_data["score"]
        })
    
    # Sort by score (highest first)
    scores.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "scores": scores,
        "current_question": session["current_question"] + 1,
        "total_questions": len(session["questions"])
    }

# Helper endpoint to advance question (for game master)
@app.post("/advance-question/{session_id}")
async def advance_question(session_id: str):
    """Move to next question"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    sessions[session_id]["current_question"] += 1
    return {"message": "Advanced to next question"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("game_api:app", host="0.0.0.0", port=8000, reload=True)
