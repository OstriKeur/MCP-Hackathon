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
        title="Add User to Session",
        description="Add a user to a session with their pseudo and score in the database",
    )
    async def add_user(
        session_id: str = Field(description="The ID of the session to add the user to"),
        user_pseudo: str = Field(description="The pseudo/username of the user to add")
    ) -> str:
        """Add a user to a session in the database"""
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
                'users': []
            }
            
            if session_doc.exists:
                session_data = session_doc.to_dict()
            
            # Add the new user to the users list
            new_user = {
                'pseudo': user_pseudo,
                'score': 0  # Initialize score to 0
            }
            
            # Check if user already exists in this session
            users = session_data.get('users', [])
            existing_user = next((user for user in users if user.get('pseudo') == user_pseudo), None)
            
            if existing_user:
                result = {
                    "user_pseudo": user_pseudo,
                    "session_id": session_id,
                    "score": existing_user.get('score', 0),
                    "message": f"User '{user_pseudo}' already exists in session '{session_id}'",
                    "already_exists": True
                }
                return json.dumps(result, indent=2)
            
            # Generate user_id for the new user
            user_id = str(uuid.uuid4())[:8]
            new_user['user_id'] = user_id
            
            # Add the new user
            users.append(new_user)
            session_data['users'] = users
            
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
                "user_id": user_id,
                "user_pseudo": user_pseudo,
                "session_id": session_id,
                "score": 0,
                "message": f"Successfully added user '{user_pseudo}' to session '{session_id}'",
                "already_exists": False
            }
            
            return json.dumps(result, indent=2)
            
        except Exception as e:
            return f"Error adding user to session: {str(e)}"

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
        title="Validate Answer",
        description="Check if a submitted answer is correct without updating scores",
    )
    async def validate_answer(
        session_id: str = Field(description="The ID of the quiz session"),
        question_id: int = Field(description="The ID of the question being answered"),
        answer_index: int = Field(description="The selected answer index (0-3)")
    ) -> str:
        """Validate if the submitted answer is correct"""
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
            
            # Check if question exists
            if current_question_index >= len(questions):
                return "Quiz finished - no active question to validate"
            
            current_question = questions[current_question_index]
            
            # Validate question_id matches current question
            if current_question.get('id') != question_id:
                return f"Question ID mismatch. Expected {current_question.get('id')}, got {question_id}"
            
            correct_answer = current_question.get('correct')
            is_correct = answer_index == correct_answer
            
            result = {
                "correct": is_correct,
                "correct_answer_index": correct_answer,
                "submitted_answer_index": answer_index,
                "question_id": question_id
            }
            
            return json.dumps(result, indent=2)
            
        except Exception as e:
            return f"Error validating answer: {str(e)}"

    @mcp.tool(
        title="Update User Score",
        description="Update a user's score in the database",
    )
    async def update_score(
        session_id: str = Field(description="The ID of the quiz session"),
        user_pseudo: str = Field(description="The pseudo/username of the user"),
        correct: bool = Field(description="Whether the answer was correct")
    ) -> str:
        """Update user score in the database"""
        try:
            # Get database client lazily
            db = db_getter()
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            users = session_data.get('users', [])
            
            # Find user and update score
            user_found = False
            for user in users:
                if user.get('pseudo') == user_pseudo:
                    if correct:
                        user['score'] = user.get('score', 0) + 1
                    user_found = True
                    break
            
            if not user_found:
                return f"User '{user_pseudo}' not found in session '{session_id}'"
            
            # Update session document
            session_data['users'] = users
            session_ref.set(session_data, merge=True)
            
            # Get updated score
            updated_user = next(user for user in users if user.get('pseudo') == user_pseudo)
            new_score = updated_user.get('score', 0)
            
            result = {
                "user_pseudo": user_pseudo,
                "new_score": new_score,
                "score_increased": correct
            }
            
            return json.dumps(result, indent=2)
            
        except Exception as e:
            return f"Error updating score: {str(e)}"

    @mcp.tool(
        title="Submit Answer",
        description="Submit answer, validate it, and update score in one operation",
    )
    async def submit_answer(
        session_id: str = Field(description="The ID of the quiz session"),
        user_pseudo: str = Field(description="The pseudo/username of the user"),
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
            users = session_data.get('users', [])
            
            # Check if question exists
            if current_question_index >= len(questions):
                return "Quiz finished - no active question"
            
            current_question = questions[current_question_index]
            correct_answer = current_question.get('correct')
            is_correct = answer_index == correct_answer
            
            # Find and update user score
            user_found = False
            new_score = 0
            for user in users:
                if user.get('pseudo') == user_pseudo:
                    if is_correct:
                        user['score'] = user.get('score', 0) + 1
                    new_score = user.get('score', 0)
                    user_found = True
                    break
            
            if not user_found:
                return f"User '{user_pseudo}' not found in session '{session_id}'"
            
            # Update session document
            session_data['users'] = users
            session_ref.set(session_data, merge=True)
            
            result = {
                "correct": is_correct,
                "correct_answer_index": correct_answer,
                "submitted_answer_index": answer_index,
                "user_pseudo": user_pseudo,
                "new_score": new_score,
                "question_id": current_question.get('id')
            }
            
            return json.dumps(result, indent=2)
            
        except Exception as e:
            return f"Error submitting answer: {str(e)}"

    @mcp.tool(
        title="Advance Question",
        description="Move to the next question in the quiz session",
    )
    async def advance_question(
        session_id: str = Field(description="The ID of the quiz session")
    ) -> str:
        """Advance to the next question in the session"""
        try:
            # Get database client lazily
            db = db_getter()
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            current_question_index = session_data.get('current_question', 0)
            total_questions = len(session_data.get('questions', []))
            
            # Advance question index
            new_question_index = current_question_index + 1
            session_data['current_question'] = new_question_index
            
            # Update session document
            session_ref.set(session_data, merge=True)
            
            result = {
                "previous_question": current_question_index + 1,
                "current_question": new_question_index + 1,
                "total_questions": total_questions,
                "quiz_finished": new_question_index >= total_questions
            }
            
            return json.dumps(result, indent=2)
            
        except Exception as e:
            return f"Error advancing question: {str(e)}"

    @mcp.tool(
        title="Get Live Scores",
        description="Get the current scoreboard for a quiz session",
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
            users = session_data.get('users', [])
            current_question = session_data.get('current_question', 0)
            total_questions = len(session_data.get('questions', []))
            
            # Build and sort scoreboard
            scores = []
            for user in users:
                scores.append({
                    "pseudo": user.get('pseudo'),
                    "score": user.get('score', 0)
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

    @mcp.tool(
        title="Get Final Score",
        description="Get final results when quiz is completed",
    )
    async def get_final_score(
        session_id: str = Field(description="The ID of the quiz session")
    ) -> str:
        """Get final quiz results"""
        try:
            # Get database client lazily
            db = db_getter()
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            users = session_data.get('users', [])
            current_question = session_data.get('current_question', 0)
            total_questions = len(session_data.get('questions', []))
            
            # Check if quiz is finished
            quiz_finished = current_question >= total_questions
            
            # Build final scoreboard
            scores = []
            for user in users:
                score = user.get('score', 0)
                scores.append({
                    "pseudo": user.get('pseudo'),
                    "score": score,
                    "percentage": round((score / total_questions) * 100, 1) if total_questions > 0 else 0
                })
            
            # Sort by score (highest first)
            scores.sort(key=lambda x: x["score"], reverse=True)
            
            # Add rankings
            for i, score_entry in enumerate(scores):
                score_entry["rank"] = i + 1
            
            result = {
                "final_scores": scores,
                "total_questions": total_questions,
                "quiz_finished": quiz_finished,
                "session_id": session_id,
                "theme": session_data.get('theme', 'Unknown')
            }
            
            return json.dumps(result, indent=2)
            
        except Exception as e:
            return f"Error getting final scores: {str(e)}"