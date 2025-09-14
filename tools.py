"""
MCP Tools for Session Management and Quiz - Fixed Version
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
            print(f"Session doc exists: {session_doc.exists}")
            
            # Initialize session_data with default values
            session_data = {
                'users': []
            }
            
            if session_doc.exists:
                session_data = session_doc.to_dict()
                print(f"Current session data: {session_data}")
            
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
                # For new sessions, use set with timestamp
                session_data['created_at'] = firestore.SERVER_TIMESTAMP
                session_ref.set(session_data)
            else:
                # For existing sessions, just update the users
                session_ref.update({'users': users})
            
            return f"Successfully added user '{user_pseudo}' to session '{session_id}' with initial score 0"
            
        except Exception as e:
            print(f"Error in add_user: {str(e)}")
            return f"Error adding user to session: {str(e)}"

    @mcp.tool(
        title="Get Quiz Question", 
        description="Get the current question for a quiz session",
    )
    async def get_quiz_question(
        session_id: str = Field(description="The ID of the quiz session")
    ) -> str:
        """Get the current question from the quiz session"""
        try:
            # Récupérer la session depuis Firestore
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            questions = session_data.get('questions', [])
            current_question_index = session_data.get('current_question', 0)
            
            print(f"Current question index: {current_question_index}, Total questions: {len(questions)}")
            
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
            print(f"Error in get_quiz_question: {str(e)}")
            return f"Error getting question: {str(e)}"

    @mcp.tool(
        title="Submit Quiz Answer", 
        description="Submit an answer for a quiz question and update user score. Use answer_text OR answer_index.",
    )
    async def submit_quiz_answer(
        session_id: str = Field(description="The ID of the quiz session"),
        user_pseudo: str = Field(description="The pseudo/username of the user answering"),
        answer_index: int = Field(description="The answer index (0-3) chosen by the user", default=None),
        answer_text: str = Field(description="The answer text chosen by the user (alternative to index)", default=None)
    ) -> str:
        """Submit an answer for a quiz question and update the user's score"""
        try:
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            questions = session_data.get('questions', [])
            current_question_index = session_data.get('current_question', 0)
            users = session_data.get('users', [])
            
            if current_question_index >= len(questions):
                return "Quiz finished - no more questions available"
            
            # Récupérer la question courante
            current_question = questions[current_question_index]
            correct_answer_index = current_question.get('correct')  # Index correct
            options = current_question.get('options', [])
            
            print(f"Current question: {current_question}")
            print(f"Answer index provided: {answer_index}, Answer text provided: {answer_text}")
            
            # Déterminer l'index de la réponse
            final_answer_index = answer_index
            
            # Si answer_text est fourni, trouver l'index correspondant
            if answer_text and answer_index is None:
                for i, option in enumerate(options):
                    if option.lower().strip() == answer_text.lower().strip():
                        final_answer_index = i
                        break
                
                if final_answer_index is None:
                    return f"Answer '{answer_text}' not found in options: {options}"
            
            if final_answer_index is None:
                return "Please provide either answer_index (0-3) or answer_text"
            
            # Valider l'index
            if final_answer_index < 0 or final_answer_index >= len(options):
                return f"Invalid answer index {final_answer_index}. Must be between 0 and {len(options)-1}"
            
            # Trouver l'utilisateur
            user_found = False
            for user in users:
                if user.get('pseudo') == user_pseudo:
                    user_found = True
                    # Vérifier si la réponse est correcte
                    if final_answer_index == correct_answer_index:
                        user['score'] = user.get('score', 0) + 1
                        correct_text = options[correct_answer_index] if correct_answer_index < len(options) else "Unknown"
                        result_message = f"✅ Correct! {user_pseudo} gets 1 point. Answer: '{correct_text}'. New score: {user['score']}"
                    else:
                        correct_text = options[correct_answer_index] if correct_answer_index < len(options) else "Unknown"
                        user_text = options[final_answer_index] if final_answer_index < len(options) else "Invalid option"
                        result_message = f"❌ Incorrect! {user_pseudo} chose '{user_text}'. Correct answer: '{correct_text}'. Score remains: {user.get('score', 0)}"
                    break
            
            if not user_found:
                return f"User '{user_pseudo}' not found in session '{session_id}'. Available users: {[u.get('pseudo') for u in users]}"
            
            # Sauvegarder les scores mis à jour
            session_ref.update({'users': users})
            
            return result_message
            
        except Exception as e:
            print(f"Error in submit_quiz_answer: {str(e)}")
            return f"Error submitting answer: {str(e)}"

    @mcp.tool(
        title="Submit Answer by Text",
        description="Submit an answer using the answer text (like 'Au', 'Go', etc.) - convenience method",
    )
    async def submit_answer_by_text(
        session_id: str = Field(description="The ID of the quiz session"),
        user_pseudo: str = Field(description="The pseudo/username of the user answering"),
        answer: str = Field(description="The answer text (e.g., 'Au', 'Go', 'Ag', 'Fe')")
    ) -> str:
        """Submit an answer using the text of the answer"""
        return await submit_quiz_answer(session_id, user_pseudo, None, answer)

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
                'status': 'active',
                'created_at': firestore.SERVER_TIMESTAMP
            }
            
            # Créer ou mettre à jour la session
            session_ref.set(session_data)
            
            return f"Quiz session '{session_id}' started with {len(questions_data)} questions"
            
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {str(e)}")
            return f"Invalid JSON format for questions: {str(e)}"
        except Exception as e:
            print(f"Error in start_quiz: {str(e)}")
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
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            current_question_index = session_data.get('current_question', 0)
            questions = session_data.get('questions', [])
            
            # Passer à la question suivante
            new_question_index = current_question_index + 1
            
            if new_question_index >= len(questions):
                # Quiz terminé, retourner les résultats finaux
                return await get_quiz_results(session_id) + "\n\n🏁 Quiz completed!"
            
            # Mettre à jour l'index dans la DB
            session_ref.update({'current_question': new_question_index})
            
            # Récupérer la nouvelle question
            next_question_data = questions[new_question_index]
            question_info = {
                "question_id": next_question_data.get('id'),
                "question_text": next_question_data.get('question'),
                "options": next_question_data.get('options', []),
                "question_number": new_question_index + 1,
                "total_questions": len(questions)
            }
            
            return f"➡️ Moving to question {new_question_index + 1}/{len(questions)}:\n\n{json.dumps(question_info, indent=2)}"
            
        except Exception as e:
            print(f"Error in next_question: {str(e)}")
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
            print(f"Error in get_quiz_results: {str(e)}")
            return f"Error getting quiz results: {str(e)}"

    @mcp.tool(
        title="Get Session Info",
        description="Get detailed information about a quiz session",
    )
    async def get_session_info(
        session_id: str = Field(description="The ID of the quiz session")
    ) -> str:
        """Get detailed information about a quiz session for debugging"""
        try:
            session_ref = db.collection('quiz_sessions').document(session_id)
            session_doc = session_ref.get()
            
            if not session_doc.exists:
                return f"Session '{session_id}' not found"
            
            session_data = session_doc.to_dict()
            
            # Prepare a clean version for display
            display_data = {
                "session_id": session_id,
                "status": session_data.get('status', 'unknown'),
                "current_question": session_data.get('current_question', 0),
                "total_questions": len(session_data.get('questions', [])),
                "users_count": len(session_data.get('users', [])),
                "users": session_data.get('users', [])
            }
            
            return json.dumps(display_data, indent=2)
            
        except Exception as e:
            print(f"Error in get_session_info: {str(e)}")
            return f"Error getting session info: {str(e)}"