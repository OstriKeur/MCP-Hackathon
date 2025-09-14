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
from tools import register_tools

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

# Register all tools
register_tools(mcp, db)

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