"""
MCP Tools for Session Management and Quiz
=========================================

This module provides tools for managing quiz sessions, users, and answers.
All tools interact with Firebase Firestore database.
"""

import json
import re
from firebase_admin import firestore
from mcp.server.fastmcp import FastMCP
from pydantic import Field


def register_tools(mcp: FastMCP, db):
    """Register all MCP tools for quiz management"""
    
    # =============================================================================
    # USER MANAGEMENT TOOLS
    # =============================================================================
    
    @mcp.tool(
        title="Add User to Session",
        description="Add a user to a quiz session and automatically start the quiz",
    )
    async def add_user(
        session_id: str = Field(description="The ID of the session to add the user to"),
        user_pseudo: str = Field(description="The pseudo/username of the user to add")
    ) -> str:
        """
        Add a user to a quiz session and automatically display the first question.
        
        Args:
            session_id: The quiz session ID
            user_pseudo: The user's display name
            
        Returns:
            Success message with the first question, or error message
        """
        try:
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"❌ Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            users = session_data.get('users', [])
            
            # Check if user already exists
            existing_user = next((user for user in users if user.get('pseudo') == user_pseudo), None)
            if existing_user:
                return f"⚠️ User '{user_pseudo}' already exists in session '{session_id}' with score {existing_user.get('score', 0)}"
            
            # Add new user
            new_user = {'pseudo': user_pseudo, 'score': 0}
            users.append(new_user)
            session_data['users'] = users
            
            # Update database
            session_ref.set(session_data, merge=True)
            
            # Auto-start quiz with first question
            return _get_first_question(session_data, user_pseudo, session_id)
            
        except Exception as e:
            return f"❌ Error adding user: {str(e)}"

    @mcp.tool(
        title="Update User Score",
        description="Manually update a user's score in a session",
    )
    async def update_user_score(
        session_id: str = Field(description="The ID of the session"),
        user_pseudo: str = Field(description="The pseudo of the user"),
        new_score: int = Field(description="The new score for the user")
    ) -> str:
        """Manually update a user's score"""
        try:
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"❌ Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            users = session_data.get('users', [])
            
            # Find and update user
            for user in users:
                if user.get('pseudo') == user_pseudo:
                    user['score'] = new_score
                    session_data['users'] = users
                    session_ref.set(session_data, merge=True)
                    return f"✅ Updated user '{user_pseudo}' score to {new_score}"
            
            return f"❌ User '{user_pseudo}' not found in session"
            
        except Exception as e:
            return f"❌ Error updating score: {str(e)}"

    # =============================================================================
    # QUIZ QUESTION TOOLS
    # =============================================================================
    
    @mcp.tool(
        title="Get Quiz Question",
        description="Get the current question for a quiz session",
    )
    async def get_quiz_question(
        session_id: str = Field(description="The ID of the quiz session")
    ) -> str:
        """Get the current question from the quiz session"""
        try:
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"❌ Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            return _format_current_question(session_data)
            
        except Exception as e:
            return f"❌ Error getting question: {str(e)}"

    @mcp.tool(
        title="Answer Question",
        description="Submit an answer to the current quiz question and get feedback",
    )
    async def answer_question(
        session_id: str = Field(description="The ID of the quiz session"),
        user_pseudo: str = Field(description="The pseudo of the user answering"),
        answer: str = Field(description="The user's answer to the current question")
    ) -> str:
        """
        Submit an answer to the current question.
        Automatically updates score if correct and shows next question.
        """
        try:
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"❌ Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            questions = session_data.get('questions', [])
            current_question_index = session_data.get('current_question', 0)
            
            if current_question_index >= len(questions):
                return "🎉 Quiz finished! No more questions available."
            
            current_question = questions[current_question_index]
            is_correct = _check_answer(answer, current_question)
            
            # Update score if correct
            if is_correct:
                _update_user_score(session_data, user_pseudo, session_ref)
            
            # Move to next question
            session_data['current_question'] = current_question_index + 1
            session_ref.set(session_data, merge=True)
            
            # Return result with next question
            return _format_answer_result(is_correct, user_pseudo, current_question, session_data)
            
        except Exception as e:
            return f"❌ Error submitting answer: {str(e)}"

    @mcp.tool(
        title="Next Question",
        description="Move to the next question without submitting an answer",
    )
    async def next_question(
        session_id: str = Field(description="The ID of the quiz session")
    ) -> str:
        """Skip to the next question without answering"""
        try:
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"❌ Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            questions = session_data.get('questions', [])
            current_question_index = session_data.get('current_question', 0)
            
            next_question_index = current_question_index + 1
            if next_question_index >= len(questions):
                return "🎉 Quiz finished! No more questions available."
            
            # Update current question index
            session_data['current_question'] = next_question_index
            session_ref.set(session_data, merge=True)
            
            # Get next question
            next_question = questions[next_question_index]
            return _format_question_display(next_question, next_question_index + 1, len(questions))
            
        except Exception as e:
            return f"❌ Error moving to next question: {str(e)}"

    # =============================================================================
    # DEBUG AND UTILITY TOOLS
    # =============================================================================
    
    @mcp.tool(
        title="Check Session Data",
        description="Check the data in a specific session for debugging",
    )
    async def check_session_data(
        session_id: str = Field(description="The ID of the session to check")
    ) -> str:
        """Debug tool to check session data"""
        try:
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"❌ Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            return f"📊 Session '{session_id}' data:\n{json.dumps(session_data, indent=2, default=str, ensure_ascii=False)}"
            
        except Exception as e:
            return f"❌ Error checking session: {str(e)}"

    @mcp.tool(
        title="Debug Current Question",
        description="Get detailed information about the current question",
    )
    async def debug_current_question(
        session_id: str = Field(description="The ID of the quiz session")
    ) -> str:
        """Debug tool to see current question details including correct answer"""
        try:
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"❌ Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            questions = session_data.get('questions', [])
            current_question_index = session_data.get('current_question', 0)
            
            if current_question_index >= len(questions):
                return "❌ No more questions available"
            
            current_question = questions[current_question_index]
            
            debug_info = {
                "question_number": current_question_index + 1,
                "total_questions": len(questions),
                "question_text": current_question.get('question'),
                "options": current_question.get('options', []),
                "correct_answer": current_question.get('correct_answer'),
                "question_id": current_question.get('id')
            }
            
            return f"🔍 Debug info:\n{json.dumps(debug_info, indent=2, ensure_ascii=False)}"
            
        except Exception as e:
            return f"❌ Error debugging question: {str(e)}"

    @mcp.tool(
        title="List All Sessions",
        description="List all sessions in the database",
    )
    async def list_all_sessions() -> str:
        """List all quiz sessions in the database"""
        try:
            sessions_ref = db.collection('quiz_sessions')
            docs = sessions_ref.stream()
            
            sessions = []
            for doc in docs:
                session_data = doc.to_dict()
                sessions.append({
                    'id': doc.id,
                    'users_count': len(session_data.get('users', [])),
                    'questions_count': len(session_data.get('questions', [])),
                    'current_question': session_data.get('current_question', 0)
                })
            
            return f"📋 All sessions:\n{json.dumps(sessions, indent=2, ensure_ascii=False)}"
            
        except Exception as e:
            return f"❌ Error listing sessions: {str(e)}"


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _clean_text(text: str) -> str:
    """Remove HTML tags and normalize text for comparison"""
    return re.sub(r'<[^>]+>', '', text).lower().strip()

def _check_answer(user_answer: str, question: dict) -> bool:
    """Check if user's answer is correct"""
    correct_answer = question.get('correct_answer', '')
    options = question.get('options', [])
    
    # Clean both answers
    clean_user = _clean_text(user_answer)
    clean_correct = _clean_text(correct_answer)
    
    # Check direct match
    if clean_user == clean_correct:
        return True
    
    # Check if answer matches any option
    return any(clean_user == _clean_text(opt) for opt in options)

def _update_user_score(session_data: dict, user_pseudo: str, session_ref) -> None:
    """Update user's score in the session"""
    users = session_data.get('users', [])
    for user in users:
        if user.get('pseudo') == user_pseudo:
            user['score'] = user.get('score', 0) + 1
            session_data['users'] = users
            session_ref.set(session_data, merge=True)
            break

def _format_question_display(question: dict, question_num: int, total_questions: int) -> str:
    """Format question for display"""
    options_text = "\n".join([f"- {option}" for option in question.get('options', [])])
    return f"Question {question_num}/{total_questions}:\n{question.get('question')}\n\nOptions:\n{options_text}"

def _format_current_question(session_data: dict) -> str:
    """Format the current question for display"""
    questions = session_data.get('questions', [])
    current_question_index = session_data.get('current_question', 0)
    
    if current_question_index >= len(questions):
        return "🎉 Quiz finished - no more questions available"
    
    current_question = questions[current_question_index]
    return _format_question_display(current_question, current_question_index + 1, len(questions))

def _get_first_question(session_data: dict, user_pseudo: str, session_id: str) -> str:
    """Get and format the first question after adding a user"""
    questions = session_data.get('questions', [])
    current_question_index = session_data.get('current_question', 0)
    
    if current_question_index < len(questions):
        current_question = questions[current_question_index]
        question_display = _format_question_display(current_question, current_question_index + 1, len(questions))
        return f"✅ User '{user_pseudo}' added to session '{session_id}' with score 0.\n\n🎯 Quiz started!\n\n{question_display}"
    else:
        return f"✅ User '{user_pseudo}' added to session '{session_id}' with score 0.\n\n🎉 Quiz is already finished."

def _format_answer_result(is_correct: bool, user_pseudo: str, current_question: dict, session_data: dict) -> str:
    """Format the result after submitting an answer"""
    questions = session_data.get('questions', [])
    current_question_index = session_data.get('current_question', 0)
    
    # Get next question if available
    next_question_index = current_question_index
    if next_question_index < len(questions):
        next_question = questions[next_question_index]
        next_question_text = f"\n\n{_format_question_display(next_question, next_question_index + 1, len(questions))}"
    else:
        next_question_text = "\n\n🎉 Quiz finished! No more questions."
    
    # Return result
    if is_correct:
        return f"✅ Correct! User '{user_pseudo}' score updated (+1 point).{next_question_text}"
    else:
        correct_answer = current_question.get('correct_answer', '')
        return f"❌ Incorrect. The correct answer was '{correct_answer}'.{next_question_text}"