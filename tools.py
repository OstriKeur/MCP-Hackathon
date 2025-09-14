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
            
            return f"Successfully added user '{user_pseudo}' to session '{session_id}' with initial score 0"
            
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
        title="Submit Quiz Answer",
        description="Submit an answer for a quiz question and update user score",
    )
    async def submit_quiz_answer(
        session_id: str = Field(description="The ID of the quiz session"),
        user_pseudo: str = Field(description="The pseudo/username of the user answering"),
        answer: str = Field(description="The answer provided by the user")
    ) -> str:
        """Submit an answer for a quiz question and update the user's score"""
        try:
            # Récupérer la session depuis Firestore
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            questions = session_data.get('questions', [])
            current_question_index = session_data.get('current_question', 0)
            users = session_data.get('users', [])
            
            # Vérifier s'il y a encore des questions
            if current_question_index >= len(questions):
                return "Quiz finished - no more questions available"
            
            # Récupérer la question courante
            current_question = questions[current_question_index]
            correct_answer = current_question.get('correct_answer', '')
            
            # Trouver l'utilisateur dans la liste
            user_found = False
            for user in users:
                if user.get('pseudo') == user_pseudo:
                    user_found = True
                    # Vérifier si la réponse est correcte
                    if answer.lower().strip() == correct_answer.lower().strip():
                        user['score'] = user.get('score', 0) + 1
                        result_message = f"Correct! {user_pseudo} gets 1 point. New score: {user['score']}"
                    else:
                        result_message = f"Incorrect! The correct answer was '{correct_answer}'. {user_pseudo}'s score remains: {user.get('score', 0)}"
                    break
            
            if not user_found:
                return f"User '{user_pseudo}' not found in session '{session_id}'"
            
            # Mettre à jour la session avec les nouveaux scores
            session_data['users'] = users
            session_ref.set(session_data, merge=True)
            
            return result_message
            
        except Exception as e:
            return f"Error submitting answer: {str(e)}"

    @mcp.tool(
        title="Start Quiz",
        description="Start a quiz session by adding questions",
    )
    async def start_quiz(
        session_id: str = Field(description="The ID of the quiz session"),
        questions: str = Field(description="JSON string containing the quiz questions")
    ) -> str:
        """Start a quiz session by adding questions"""
        try:
            # Parser les questions JSON
            questions_data = json.loads(questions)
            
            # Vérifier que c'est une liste de questions
            if not isinstance(questions_data, list):
                return "Questions must be provided as a JSON array"
            
            # Créer la référence de session
            session_ref = db.collection('quiz_sessions').document(session_id)
            
            # Préparer les données de session
            session_data = {
                'questions': questions_data,
                'current_question': 0,
                'users': [],
                'status': 'active'
            }
            
            # Créer ou mettre à jour la session
            session_ref.set(session_data)
            session_ref.update({'created_at': firestore.SERVER_TIMESTAMP})
            
            return f"Quiz session '{session_id}' started with {len(questions_data)} questions"
            
        except json.JSONDecodeError:
            return "Invalid JSON format for questions"
        except Exception as e:
            return f"Error starting quiz: {str(e)}"

    @mcp.tool(
        title="Next Question",
        description="Move to the next question in the quiz",
    )
    async def next_question(
        session_id: str = Field(description="The ID of the quiz session")
    ) -> str:
        """Move to the next question in the quiz"""
        try:
            # Récupérer la session depuis Firestore
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            current_question_index = session_data.get('current_question', 0)
            questions = session_data.get('questions', [])
            
            # Vérifier s'il y a encore des questions
            if current_question_index >= len(questions) - 1:
                return "Quiz finished - no more questions available"
            
            # Passer à la question suivante
            new_question_index = current_question_index + 1
            session_data['current_question'] = new_question_index
            
            # Mettre à jour la session
            session_ref.set(session_data, merge=True)
            
            return f"Moved to question {new_question_index + 1} of {len(questions)}"
            
        except Exception as e:
            return f"Error moving to next question: {str(e)}"

    @mcp.tool(
        title="Get Quiz Results",
        description="Get the current results/scores for all users in the quiz",
    )
    async def get_quiz_results(
        session_id: str = Field(description="The ID of the quiz session")
    ) -> str:
        """Get the current results/scores for all users in the quiz"""
        try:
            # Récupérer la session depuis Firestore
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            users = session_data.get('users', [])
            current_question = session_data.get('current_question', 0)
            total_questions = len(session_data.get('questions', []))
            
            # Trier les utilisateurs par score (décroissant)
            sorted_users = sorted(users, key=lambda x: x.get('score', 0), reverse=True)
            
            results = {
                "session_id": session_id,
                "current_question": current_question + 1,
                "total_questions": total_questions,
                "leaderboard": []
            }
            
            for i, user in enumerate(sorted_users):
                results["leaderboard"].append({
                    "rank": i + 1,
                    "pseudo": user.get('pseudo', 'Unknown'),
                    "score": user.get('score', 0)
                })
            
            return json.dumps(results, indent=2)
            
        except Exception as e:
            return f"Error getting quiz results: {str(e)}"
