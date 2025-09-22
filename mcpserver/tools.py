"""
MCP Tools for Session Management and Quiz
"""

import json
import uuid
import random
from mcp.server.fastmcp import FastMCP
from pydantic import Field
from typing import Dict, List, Optional


def register_tools(mcp: FastMCP, db_getter):
    """Register all MCP tools with lazy database loading"""
    
    @mcp.tool(
        title="Add Player to Session",
        description="Add a player to a session with their pseudo and score in the database",
    )
    async def add_player(
        session_id: str = Field(description="The ID of the session to add the player to"),
        player_pseudo: str = Field(description="The pseudo/username of the player to add")
    ) -> str:
        """Add a player to a session in the database"""
        try:
            # Get database client lazily
            db = db_getter()
            # Create a reference to the session document
            session_ref = db.collection('quiz_sessions').document(session_id)
            
            # Get the current session data
            session_doc = session_ref.get()
            print(session_doc)
            
            # Initialize session_data with default values
            session_data = {
                'players': []
            }
            
            if session_doc.exists:
                session_data = session_doc.to_dict()
            
            # Add the new player to the players list  
            new_player = {
                'pseudo': player_pseudo,
                'score': 0  # Initialize score to 0
            }
            
            # Check if player already exists in this session
            players = session_data.get('players', [])
            existing_player = next((player for player in players if player.get('pseudo') == player_pseudo), None)
            
            if existing_player:
                result = {
                    "player_pseudo": player_pseudo,
                    "session_id": session_id,
                    "score": existing_player.get('score', 0),
                    "message": f"Player '{player_pseudo}' already exists in session '{session_id}'",
                    "already_exists": True
                }
                return json.dumps(result, indent=2)
            
            # Generate player_id for the new player
            player_id = str(uuid.uuid4())[:8]
            new_player['player_id'] = player_id
            
            # Add the new player
            players.append(new_player)
            session_data['players'] = players
            
            # Update the session document
            if not session_doc.exists:
                # For new sessions, use update with timestamp
                from firebase_admin import firestore
                session_ref.set(session_data)
                session_ref.update({'created_at': firestore.SERVER_TIMESTAMP})
            else:
                # For existing sessions, just merge
                session_ref.set(session_data, merge=True)
            
            result = {
                "player_id": player_id,
                "player_pseudo": player_pseudo,
                "session_id": session_id,
                "score": 0,
                "message": f"Successfully added player '{player_pseudo}' to session '{session_id}'",
                "already_exists": False
            }
            
            return json.dumps(result, indent=2)
            
        except Exception as e:
            return f"Error adding player to session: {str(e)}"

    @mcp.tool(
        title="Get Next Question",
        description="Get the next question for a quiz session",
    )
    async def get_next_question(
        session_id: str = Field(description="The ID of the quiz session")
    ) -> str:
        """Get the next question from the quiz session"""
        try:
            # Get database client lazily
            db = db_getter()
            # Get the session from Firestore
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            questions = session_data.get('questions', [])
            current_question_index = session_data.get('current_question', 0)
            
            # Check if session has questions
            if not questions:
                return json.dumps({
                    "error": "No questions available",
                    "message": "This session has no questions configured. Please create the session via the backend API first."
                }, indent=2)
            
            # Check if there are more questions available
            if current_question_index >= len(questions):
                return json.dumps({
                    "finished": True,
                    "message": "Quiz finished - no more questions available",
                    "total_questions": len(questions),
                    "current_question": current_question_index + 1
                }, indent=2)
            
            # Get the current question
            current_question = questions[current_question_index]
            
            # Format the response (without the correct answer)
            question_data = {
                "question_id": current_question.get('id'),
                "question_text": current_question.get('question'),
                "options": current_question.get('options', []),
                "question_number": current_question_index + 1,
                "total_questions": len(questions)
            }
            
            return json.dumps(question_data, indent=2)
            
        except Exception as e:
            return f"Error getting next question: {str(e)}"

    @mcp.tool(
        title="Submit Answer",
        description="Submit answer, validate it, and update score in one operation for the current user",
    )
    async def submit_answer(
        session_id: str = Field(description="The ID of the quiz session"),
        player_pseudo: str = Field(description="The pseudo/playername of the player"),
        answer_index: int = Field(description="The selected answer index (0-3)")
    ) -> str:
        """Submit answer, validate, and update score atomically"""
        try:
            # Get database client lazily
            db = db_getter()
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            questions = session_data.get('questions', [])
            current_question_index = session_data.get('current_question', 0)
            players = session_data.get('players', [])
            
            # Check if question exists
            if current_question_index >= len(questions):
                return "Quiz finished - no active question"
            
            current_question = questions[current_question_index]
            correct_answer = current_question.get('correct')
            is_correct = answer_index == correct_answer
            
            # Find and update player score
            player_found = False
            new_score = 0
            for player in players:
                if player.get('pseudo') == player_pseudo:
                    if is_correct:
                        player['score'] = player.get('score', 0) + 1
                    new_score = player.get('score', 0)
                    player_found = True
                    break
            
            if not player_found:
                return f"User '{player_pseudo}' not found in session '{session_id}'"
            
            # Update session document
            session_data['players'] = players
            session_ref.set(session_data, merge=True)
            
            result = {
                "correct": is_correct,
                "correct_answer_index": correct_answer,
                "submitted_answer_index": answer_index,
                "player_pseudo": player_pseudo,
                "new_score": new_score,
                "question_id": current_question.get('id')
            }
            
            return json.dumps(result, indent=2)
            
        except Exception as e:
            return f"Error submitting answer: {str(e)}"

    @mcp.tool(
        title="Get Live Scores",
        description="Get the current scoreboard for a quiz session for all players",
    )
    async def get_scores(
        session_id: str = Field(description="The ID of the quiz session")
    ) -> str:
        """Get live scoreboard for the session"""
        try:
            # Get database client lazily
            db = db_getter()
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            players = session_data.get('players', [])
            current_question = session_data.get('current_question', 0)
            total_questions = len(session_data.get('questions', []))
            
            # Build and sort scoreboard
            scores = []
            for player in players:
                scores.append({
                    "pseudo": player.get('pseudo'),
                    "score": player.get('score', 0)
                })
            
            # Sort by score (highest first)
            scores.sort(key=lambda x: x["score"], reverse=True)
            
            result = {
                "scores": scores,
                "current_question": current_question + 1,
                "total_questions": total_questions,
                "session_id": session_id
            }
            
            return json.dumps(result, indent=2)
            
        except Exception as e:
            return f"Error getting scores: {str(e)}"