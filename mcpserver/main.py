"""
MCP Server Template
"""

from mcp.server.fastmcp import FastMCP
from pydantic import Field

import mcp.types as types

mcp = FastMCP("Echo Server", port=3000, stateless_http=True, debug=True)


@mcp.tool(
    title="Echo Tool",
    description="Echo the input text",
)
def echo(text: str = Field(description="The text to echo")) -> str:
    return text

@mcp.tool(
    title="Add Player",
    description="Add a new player to the game when providing a game session ID",
)
def add_player(session_id: str, player_name: str) -> str:
    # Logic to add a new player to the game
    return f"Added player {player_name} with game session ID {session_id}"


@mcp.tool(
    title="Update Score",
    description="Update the player's score after its response",
)
def update_score(player_id: str, score: int) -> str:
    # Logic to update the player's score in the database
    return f"Updated score for player {player_id} to {score}"



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
def greet_player(
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
