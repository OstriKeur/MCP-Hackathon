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
            
            # Automatically get the first question after adding user
            try:
                questions = session_data.get('questions', [])
                current_question_index = session_data.get('current_question', 0)
                
                if current_question_index < len(questions):
                    current_question = questions[current_question_index]
                    question_data = {
                        "question_id": current_question.get('id'),
                        "question_text": current_question.get('question'),
                        "options": current_question.get('options', []),
                        "question_number": current_question_index + 1,
                        "total_questions": len(questions)
                    }
                    
                    return f"Successfully added user '{user_pseudo}' to session '{session_id}' with initial score 0. Quiz started automatically!\n\nQuestion {current_question_index + 1}/{len(questions)}:\n{current_question.get('question')}\n\nOptions:\n" + "\n".join([f"- {option}" for option in current_question.get('options', [])])
                else:
                    return f"Successfully added user '{user_pseudo}' to session '{session_id}' with initial score 0. Quiz is already finished."
            except Exception as e:
                return f"Successfully added user '{user_pseudo}' to session '{session_id}' with initial score 0. Error getting first question: {str(e)}"
            
        except Exception as e:
            return f"Error adding user to session: {str(e)}"

    @mcp.tool(
        title="Get Quiz Question",
        description="Get the next question for a quiz session",
    )
    async def get_quiz_question(
        session_id: str = Field(description="The ID of the quiz session")
    ) -> str:
        """Get the next question from the quiz session"""
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
        title="Check Session Data",
        description="Check the data in a specific session to debug database issues",
    )
    async def check_session_data(
        session_id: str = Field(description="The ID of the session to check")
    ) -> str:
        """Check the data in a specific session"""
        try:
            # Check in quiz_sessions collection
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found in quiz_sessions collection"
            
            session_data = session_doc.to_dict()
            return f"Session '{session_id}' data: {json.dumps(session_data, indent=2, default=str)}"
            
        except Exception as e:
            return f"Error checking session data: {str(e)}"

    @mcp.tool(
        title="List All Sessions",
        description="List all sessions in the database to see what exists",
    )
    async def list_all_sessions() -> str:
        """List all sessions in the database"""
        try:
            # List all sessions in quiz_sessions collection
            sessions_ref = db.collection('quiz_sessions')
            docs = sessions_ref.stream()
            
            sessions = []
            for doc in docs:
                session_data = doc.to_dict()
                sessions.append({
                    'id': doc.id,
                    'data': session_data
                })
            
            return f"All sessions in quiz_sessions: {json.dumps(sessions, indent=2, default=str)}"
            
        except Exception as e:
            return f"Error listing sessions: {str(e)}"

    @mcp.tool(
        title="Submit Answer",
        description="Submit an answer for a quiz question and update user score",
    )
    async def submit_answer(
        session_id: str = Field(description="The ID of the quiz session"),
        user_pseudo: str = Field(description="The pseudo of the user submitting the answer"),
        answer: str = Field(description="The answer submitted by the user")
    ) -> str:
        """Submit an answer for a quiz question"""
        try:
            # Get the session data
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            questions = session_data.get('questions', [])
            current_question_index = session_data.get('current_question', 0)
            
            # Check if there are questions available
            if current_question_index >= len(questions):
                return "No more questions available in this quiz"
            
            # Get the current question
            current_question = questions[current_question_index]
            correct_answer = current_question.get('correct_answer', '')
            
            # Check if the answer is correct
            is_correct = answer.lower().strip() == correct_answer.lower().strip()
            
            # Update user score if correct
            if is_correct:
                users = session_data.get('users', [])
                user_found = False
                
                for user in users:
                    if user.get('pseudo') == user_pseudo:
                        user['score'] = user.get('score', 0) + 1
                        user_found = True
                        break
                
                if not user_found:
                    return f"User '{user_pseudo}' not found in session '{session_id}'"
                
                # Update the session data
                session_data['users'] = users
                session_ref.set(session_data, merge=True)
            
            # Move to next question
            session_data['current_question'] = current_question_index + 1
            session_ref.set(session_data, merge=True)
            
            # Get next question if available
            next_question_index = current_question_index + 1
            if next_question_index < len(questions):
                next_question = questions[next_question_index]
                next_question_text = f"\n\nNext Question {next_question_index + 1}/{len(questions)}:\n{next_question.get('question')}\n\nOptions:\n" + "\n".join([f"- {option}" for option in next_question.get('options', [])])
            else:
                next_question_text = "\n\n🎉 Quiz finished! No more questions."
            
            # Return result with next question
            if is_correct:
                return f"✅ Correct answer! User '{user_pseudo}' score updated (+1 point).{next_question_text}"
            else:
                return f"❌ Incorrect answer. The correct answer was '{correct_answer}'.{next_question_text}"
            
        except Exception as e:
            return f"Error submitting answer: {str(e)}"

    @mcp.tool(
        title="Update User Score",
        description="Manually update a user's score in a session",
    )
    async def update_user_score(
        session_id: str = Field(description="The ID of the session"),
        user_pseudo: str = Field(description="The pseudo of the user"),
        new_score: int = Field(description="The new score for the user")
    ) -> str:
        """Update a user's score in a session"""
        try:
            # Get the session data
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            users = session_data.get('users', [])
            user_found = False
            
            # Find and update the user's score
            for user in users:
                if user.get('pseudo') == user_pseudo:
                    user['score'] = new_score
                    user_found = True
                    break
            
            if not user_found:
                return f"User '{user_pseudo}' not found in session '{session_id}'"
            
            # Update the session data
            session_data['users'] = users
            session_ref.set(session_data, merge=True)
            
            return f"Successfully updated user '{user_pseudo}' score to {new_score} in session '{session_id}'"
            
        except Exception as e:
            return f"Error updating user score: {str(e)}"
