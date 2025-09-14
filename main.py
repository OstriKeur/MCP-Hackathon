"""
MCP Server Template
"""


import dotenv
import firebase_admin
import os
import json
from firebase_admin import credentials, firestore
from firebase_admin.firestore import DocumentReference
from mcp.server.fastmcp import FastMCP
from pydantic import Field

import mcp.types as types

def initialize_firestore():
    """
    Initialize Firestore based on the platform.
    """
    # Check if default app already exists
    try:
        firebase_admin.get_app()
        return firestore.client()  # App already exists, just return client
    except ValueError:
        # App doesn't exist, initialize it
        pass
    
    if os.environ.get("GCP_DEPLOYMENT", "false").lower() == "true":
        # Initialize Firestore for GCP
        firebase_admin.initialize_app()
    else:
        # Try to use environment variable first (for GitHub secrets)
        service_account_json_str = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')
        if service_account_json_str:
            try:
                cred_json = json.loads(service_account_json_str)
                cred = credentials.Certificate(cred_json)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin SDK initialized successfully using environment variable.")
            except json.JSONDecodeError:
                raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY contains invalid JSON.")
        else:
            # Fallback to local file for development
            try:
                cred = credentials.Certificate("cred.json")
                firebase_admin.initialize_app(cred)
                print("Firebase Admin SDK initialized using local cred.json file.")
            except FileNotFoundError:
                raise ValueError("Neither FIREBASE_SERVICE_ACCOUNT_KEY environment variable nor cred.json file found.")
    
    return firestore.client()

db = initialize_firestore()

mcp = FastMCP("Echo Server", port=3000, stateless_http=True, debug=True)


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
    title="Next Question",
    description="Get the next question for a quiz session",
)
async def next_question(
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

@mcp.resource(
    uri="greeting://{name}",
    description="Get a personalized greeting",
    name="Greeting Resource",
)
def get_greeting(
    name: str,
) -> str:
    return f"Hello, {name}!"


@mcp.prompt("")
def greet_user(
    name: str = Field(description="The name of the person to greet"),
    style: str = Field(description="The style of the greeting", default="friendly"),
) -> str:
    """Generate a greeting prompt"""
    styles = {
        "friendly": "Please write a warm, friendly greeting",
        "formal": "Please write a formal, professional greeting",
        "casual": "Please write a casual, relaxed greeting",
    }

    return f"{styles.get(style, styles['friendly'])} for someone named {name}."


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
