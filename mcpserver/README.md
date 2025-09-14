# MCP Server - Model Context Protocol Integration

A Model Context Protocol (MCP) server that provides tools for quiz session management and game interaction. This server enables AI assistants to directly interact with the quiz game database and manage game sessions through structured tools.

## 🚀 What is MCP?

Model Context Protocol (MCP) is an open protocol that enables AI assistants to securely connect to and interact with external systems. This MCP server specifically provides tools for:

- **Session Management**: Add users to quiz sessions
- **Question Retrieval**: Get quiz questions from game sessions
- **Database Integration**: Direct interaction with Firebase Firestore
- **AI Tool Integration**: Structured tools that AI can invoke

## 📁 Project Structure

```
mcpserver/
├── main.py         # MCP server initialization and setup
├── tools.py        # MCP tool definitions and implementations
├── pyproject.toml  # Project dependencies and metadata
├── uv.lock        # Dependency lock file
└── README.md      # This file
```

## 🛠 Installation & Setup

### Prerequisites

- Python 3.11+
- UV package manager (recommended)
- Firebase project with Firestore enabled
- Access to quiz session database

### Environment Variables

Create a `.env` file or set environment variables:

```env
FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_service_account_json
GCP_DEPLOYMENT=false  # Set to true for Google Cloud Platform deployment
```

### Installation

```bash
# Install dependencies with UV
uv sync

# Or with pip
pip install -r requirements.txt
```

## 🔧 Available Tools

### 1. Add User to Session

**Tool Name**: `add_user`

**Description**: Add a user to a quiz session with their pseudo and initial score

**Parameters**:
- `session_id` (string): The ID of the session to add the user to
- `user_pseudo` (string): The pseudo/username of the user to add

**Example Usage**:
```python
# Via MCP protocol
result = await add_user(
    session_id="abc123",
    user_pseudo="PlayerName"
)
```

**Response**: Confirmation message with user addition status

### 2. Get Quiz Question

**Tool Name**: `get_quiz_question`

**Description**: Retrieve the current question from a quiz session

**Parameters**:
- `session_id` (string): The ID of the quiz session

**Example Usage**:
```python
# Via MCP protocol
question = await get_quiz_question(session_id="abc123")
```

**Response**: JSON object containing:
```json
{
  "question_id": 1,
  "question_text": "What is the capital of France?",
  "options": ["London", "Berlin", "Paris", "Madrid"],
  "question_number": 1,
  "total_questions": 3
}
```

## 🔥 Firebase Integration

### Database Structure

The MCP server interacts with Firestore collections:

```
Collection: quiz_sessions
Document ID: session_id
Fields:
├── session_id: string
├── theme: string
├── questions: array
├── users: array
│   └── {pseudo: string, score: number}
├── current_question: number (optional)
└── created_at: timestamp
```

### Firebase Setup

1. **Create Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com)
2. **Enable Firestore**: Set up Cloud Firestore database
3. **Service Account**: Create and download service account JSON
4. **Environment Setup**:
   - **Local Development**: Save JSON as `cred.json`
   - **Production**: Set `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable

## 🚀 Running the MCP Server

### Development Mode

```bash
# Start the MCP server
uv run python main.py

# Or with Python directly
python main.py
```

The server will start on port 3000 with the following configuration:
- **Protocol**: HTTP with stateless mode
- **Debug Mode**: Enabled for development
- **Port**: 3000 (configurable)

### Production Deployment

```bash
# Set production environment
export GCP_DEPLOYMENT=true

# Run server
python main.py
```

## 🔌 MCP Integration

### Client Connection

AI assistants can connect to this MCP server using the standard MCP protocol:

```typescript
// Example client connection
const client = new MCPClient({
  serverUrl: "http://localhost:3000",
  protocol: "http"
});

await client.connect();
```

### Tool Discovery

The server automatically exposes available tools through MCP's tool discovery mechanism:

```typescript
// Discover available tools
const tools = await client.listTools();
console.log(tools); // Shows add_user and get_quiz_question
```

### Tool Invocation

```typescript
// Add user to session
const result = await client.callTool("add_user", {
  session_id: "abc123",
  user_pseudo: "Alice"
});

// Get current question
const question = await client.callTool("get_quiz_question", {
  session_id: "abc123"
});
```

## 🛡 Error Handling

### Tool Error Responses

All tools include comprehensive error handling:

```python
# User already exists
"User 'Alice' already exists in session 'abc123' with score 5"

# Session not found
"Session 'xyz789' not found"

# Quiz finished
"Quiz finished - no more questions available"

# Database errors
"Error adding user to session: [specific error details]"
```

### Firebase Connection Errors

```python
# Missing credentials
"Neither FIREBASE_SERVICE_ACCOUNT_KEY environment variable nor cred.json file found."

# Invalid JSON
"FIREBASE_SERVICE_ACCOUNT_KEY contains invalid JSON."

# Network issues
"Error connecting to Firestore: [network error details]"
```

## 📊 Usage Examples

### Example 1: Complete Game Flow via MCP

```python
# 1. Add players to session
await add_user(session_id="game123", user_pseudo="Alice")
await add_user(session_id="game123", user_pseudo="Bob")

# 2. Get first question
question = await get_quiz_question(session_id="game123")
print(f"Question: {question['question_text']}")
print(f"Options: {question['options']}")

# 3. Players would answer via the main game API
# 4. Host advances question via main game API  
# 5. Get next question
next_question = await get_quiz_question(session_id="game123")
```

### Example 2: Session Management

```python
# Check if user already exists
result = await add_user(session_id="game123", user_pseudo="Alice")
if "already exists" in result:
    print("User already in game!")
else:
    print("User added successfully!")
```

## 🔧 Development & Extension

### Adding New Tools

1. **Define Tool Function** in `tools.py`:
```python
@mcp.tool(
    title="Your Tool Name",
    description="Tool description"
)
async def your_tool(
    param1: str = Field(description="Parameter description")
) -> str:
    # Tool implementation
    return "Result"
```

2. **Register Tool** in `main.py`:
```python
register_tools(mcp, db)  # Automatically registers all tools
```

### Database Extensions

To add new database operations:

1. **Extend Firestore Schema**: Add new fields/collections
2. **Create Tool Functions**: Implement CRUD operations
3. **Add Error Handling**: Handle edge cases and validation
4. **Update Documentation**: Document new tools and usage

## 🧪 Testing

### Manual Testing

```bash
# Test tool registration
python -c "from tools import register_tools; print('Tools registered successfully')"

# Test Firebase connection
python -c "from main import initialize_firestore; db = initialize_firestore(); print('Firebase connected')"
```

### Integration Testing

```bash
# Test with MCP client
# (Requires MCP client implementation)
python test_mcp_integration.py
```

## 🚀 Production Considerations

### Security
- **Credential Management**: Use environment variables for sensitive data
- **Access Control**: Implement proper authentication if needed
- **Rate Limiting**: Consider adding rate limiting for tool calls

### Monitoring
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Monitor tool execution times
- **Database Usage**: Track Firestore read/write operations

### Scalability
- **Connection Pooling**: Optimize Firebase connections
- **Caching**: Consider caching frequently accessed data
- **Load Balancing**: Multiple server instances for high availability

## 🤝 Contributing

### Development Guidelines
1. **Follow MCP Standards**: Adhere to MCP protocol specifications
2. **Error Handling**: Always return descriptive error messages
3. **Type Safety**: Use Pydantic models for data validation
4. **Documentation**: Document all tools and parameters

### Adding Features
1. **Tool Design**: Design tools to be atomic and focused
2. **Database Integration**: Ensure proper Firestore error handling
3. **Testing**: Test tools both individually and in workflows
4. **Documentation**: Update README with new tool documentation

This MCP server provides a bridge between AI assistants and the quiz game system, enabling sophisticated AI-powered game management and interaction capabilities.