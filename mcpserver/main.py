"""
MCP Server Template
"""

import dotenv
import os
import json
from mcp.server.fastmcp import FastMCP
from pydantic import Field

import mcp.types as types

# Global variable to store the database client
_db = None

def get_firestore_client():
    """
    Lazy-load Firestore client to improve cold start performance.
    """
    global _db
    if _db is not None:
        return _db
        
    # Import Firebase modules only when needed
    import firebase_admin
    from firebase_admin import credentials, firestore
    
    # Check if default app already exists
    try:
        firebase_admin.get_app()
        _db = firestore.client()  # App already exists, just return client
        return _db
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
    
    _db = firestore.client()
    return _db

mcp = FastMCP("Echo Server", port=7860, stateless_http=True, debug=True, host="0.0.0.0")

# Import tools registration
from tools import register_tools

# Register all tools with lazy DB initialization
register_tools(mcp, get_firestore_client)

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


@mcp.tool(
    title="Health Check",
    description="Quick health check that responds immediately without initializing heavy dependencies",
)
async def health_check() -> str:
    """Health check endpoint for fast Lambda response"""
    return json.dumps({
        "status": "healthy",
        "timestamp": json.dumps({"$timestamp": "server"}),
        "service": "mcp-server"
    })


if __name__ == "__main__":
    mcp.run(transport="streamable-http")