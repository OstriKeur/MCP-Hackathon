"""
MCP Tools for Session Management and Quiz
"""

import json
from firebase_admin import firestore
from mcp.server.fastmcp import FastMCP
from pydantic import Field


def register_tools(mcp: FastMCP, db):
    """Register all MCP tools"""
    
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
            # Create a reference to the session document
            session_ref = db.collection('sessions').document(session_id)
            
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
                return f"User '{user_pseudo}' already exists in session '{session_id}' with score {existing_user.get('score', 0)}"
            
            # Add the new user
            users.append(new_user)
            session_data['users'] = users
            
            # Update the session document
            if not session_doc.exists:
                # For new sessions, use update with timestamp
                session_ref.set(session_data)
                session_ref.update({'created_at': firestore.SERVER_TIMESTAMP})
            else:
                # For existing sessions, just merge
                session_ref.set(session_data, merge=True)
            
            return f"Successfully added user '{user_pseudo}' to session '{session_id}' with initial score 0"
            
        except Exception as e:
            return f"Error adding user to session: {str(e)}"

    @mcp.tool(
        title="Get Quiz Question",
        description="Get the current question for a quiz session (without advancing)",
    )
    async def get_quiz_question(
        session_id: str = Field(description="The ID of the quiz session")
    ) -> str:
        """Get the current question from the quiz session (without advancing)"""
        try:
            # Récupérer la session depuis Firestore
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            questions = session_data.get('questions', [])
            current_question_index = session_data.get('current_question', 0)
            
            # Vérifier s'il y a encore des questions
            if current_question_index >= len(questions):
                return "Quiz finished - no more questions available"
            
            # Récupérer la question courante
            current_question = questions[current_question_index]
            
            # Formater la réponse (sans la bonne réponse)
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
        title="Reset Quiz Session",
        description="Reset a quiz session to start from the first question",
    )
    async def reset_quiz_session(
        session_id: str = Field(description="The ID of the quiz session to reset")
    ) -> str:
        """Reset a quiz session to start from the first question"""
        try:
            # Récupérer la session depuis Firestore
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            # Reset current_question to 0
            session_ref.update({'current_question': 0})
            
            return f"Quiz session '{session_id}' has been reset to the first question"
            
        except Exception as e:
            return f"Error resetting quiz session: {str(e)}"

    @mcp.tool(
        title="Submit Quiz Answer",
        description="Submit an answer to the current quiz question and get explanation",
    )
    async def submit_quiz_answer(
        session_id: str = Field(description="The ID of the quiz session"),
        answer: int = Field(description="The answer number (1, 2, 3, or 4)")
    ) -> str:
        """Submit an answer to the current quiz question and get explanation"""
        try:
            # Récupérer la session depuis Firestore
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            questions = session_data.get('questions', [])
            current_question_index = session_data.get('current_question', 0)
            
            # Vérifier s'il y a encore des questions
            if current_question_index >= len(questions):
                return "Quiz finished - no more questions available"
            
            # Récupérer la question courante
            current_question = questions[current_question_index]
            correct_answer = current_question.get('correct_answer', 1)
            explanation = current_question.get('explanation', 'No explanation available')
            
            # Vérifier la réponse
            is_correct = (answer == correct_answer)
            
            # Formater la réponse
            result = {
                "is_correct": is_correct,
                "correct_answer": correct_answer,
                "user_answer": answer,
                "explanation": explanation,
                "question_text": current_question.get('question'),
                "question_number": current_question_index + 1,
                "total_questions": len(questions)
            }
            
            # Avancer à la question suivante automatiquement
            next_question_index = current_question_index + 1
            session_ref.update({'current_question': next_question_index})
            
            # Construire le message de réponse
            if is_correct:
                response_message = f"✅ Correct ! La réponse était bien la {correct_answer}.\n\n"
            else:
                response_message = f"❌ Dommage ! La réponse correcte était la {correct_answer}.\n\n"
                response_message += f"💡 Explication : {explanation}\n\n"
            
            # Vérifier s'il y a encore des questions
            if next_question_index >= len(questions):
                response_message += "🎉 Quiz terminé ! Plus de questions disponibles."
            else:
                response_message += f"➡️ Passage automatique à la question suivante ({next_question_index + 1}/{len(questions)})."
            
            return response_message
            
        except Exception as e:
            return f"Error submitting answer: {str(e)}"
