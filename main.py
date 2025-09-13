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
        
        if session_doc.exists:
            session_data = session_doc.to_dict()
        else:
            # Create new session if it doesn't exist
            session_data = {
                'created_at': firestore.SERVER_TIMESTAMP,
                'users': []
            }
        
        # Add the new user to the users list
        new_user = {
            'pseudo': user_pseudo,
            'score': 0,  # Initialize score to 0
            'added_at': firestore.SERVER_TIMESTAMP
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
        session_ref.set(session_data, merge=True)
        
        return f"Successfully added user '{user_pseudo}' to session '{session_id}' with initial score 0"
        
    except Exception as e:
        return f"Error adding user to session: {str(e)}"


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
