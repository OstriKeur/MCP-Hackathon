---
  title: Kahoot
  emoji: 📈
  colorFrom: indigo
  colorTo: blue
  sdk: docker
  pinned: false
  license: mit
  short_description: 'A server for playing kahoot wit friends '
---
Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference


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

### 1. Start Quiz Session

**Tool Name**: `start_session`

**Description**: Create a new quiz session structure (questions must be added separately)

**Parameters**:
- `theme` (string, optional): Theme for the quiz questions (default: "general knowledge")
- `num_questions` (int, optional): Number of questions to generate (default: 3)

**Example Usage**:
```python
result = await start_session(theme="science", num_questions=5)
```

**Response**: JSON object containing:
```json
{
  "session_id": "abc123",
  "theme": "science",
  "total_questions": 5,
  "status": "pending_questions",
  "message": "Quiz session created. 5 questions need to be generated for theme: science"
}
```

### 2. Add Questions to Session

**Tool Name**: `add_questions_to_session`

**Description**: Add AI-generated questions to an existing quiz session

**Parameters**:
- `session_id` (string): The ID of the quiz session
- `questions` (string): JSON string containing array of questions

**Example Usage**:
```python
questions_json = json.dumps([
  {
    "id": 1,
    "question": "What is photosynthesis?",
    "options": ["Energy conversion", "Water absorption", "Light absorption", "Oxygen production"],
    "correct": 0
  }
])
result = await add_questions_to_session(session_id="abc123", questions=questions_json)
```

**Response**: JSON object containing:
```json
{
  "session_id": "abc123",
  "questions_added": 3,
  "status": "ready",
  "message": "Successfully added 3 questions to session"
}
```

### 2. Add User to Session

**Tool Name**: `add_user`

**Description**: Add a user to a quiz session with their pseudo and initial score

**Parameters**:
- `session_id` (string): The ID of the session to add the user to
- `user_pseudo` (string): The pseudo/username of the user to add

**Example Usage**:
```python
result = await add_user(session_id="abc123", user_pseudo="PlayerName")
```

**Response**: JSON object containing:
```json
{
  "user_id": "def456",
  "user_pseudo": "PlayerName",
  "session_id": "abc123",
  "score": 0,
  "message": "Successfully added user 'PlayerName' to session 'abc123'",
  "already_exists": false
}
```

### 3. Get Next Question

**Tool Name**: `get_next_question`

**Description**: Retrieve the current question from a quiz session

**Parameters**:
- `session_id` (string): The ID of the quiz session

**Example Usage**:
```python
question = await get_next_question(session_id="abc123")
```

**Response**: JSON object containing:

**Success Response:**
```json
{
  "question_id": 1,
  "question_text": "What is photosynthesis?",
  "options": ["Energy conversion", "Water absorption", "Light absorption", "Oxygen production"],
  "question_number": 1,
  "total_questions": 3,
  "session_status": "ready"
}
```

**Error Responses:**
```json
{
  "error": "No questions available",
  "status": "pending_questions",
  "message": "Questions have not been added to this session yet. Please add questions first."
}
```

**Quiz Finished Response:**
```json
{
  "finished": true,
  "message": "Quiz finished - no more questions available",
  "total_questions": 3,
  "current_question": 4
}
```

### 4. Validate Answer

**Tool Name**: `validate_answer`

**Description**: Check if a submitted answer is correct without updating scores

**Parameters**:
- `session_id` (string): The ID of the quiz session
- `question_id` (int): The ID of the question being answered
- `answer_index` (int): The selected answer index (0-3)

**Example Usage**:
```python
result = await validate_answer(session_id="abc123", question_id=1, answer_index=2)
```

**Response**: JSON object containing:
```json
{
  "correct": true,
  "correct_answer_index": 2,
  "submitted_answer_index": 2,
  "question_id": 1
}
```

### 5. Update User Score

**Tool Name**: `update_score`

**Description**: Update a user's score in the database

**Parameters**:
- `session_id` (string): The ID of the quiz session
- `user_pseudo` (string): The pseudo/username of the user
- `correct` (boolean): Whether the answer was correct

**Example Usage**:
```python
result = await update_score(session_id="abc123", user_pseudo="PlayerName", correct=True)
```

**Response**: JSON object containing:
```json
{
  "user_pseudo": "PlayerName",
  "new_score": 1,
  "score_increased": true
}
```

### 6. Submit Answer (Consolidated)

**Tool Name**: `submit_answer`

**Description**: Submit answer, validate it, and update score in one atomic operation

**Parameters**:
- `session_id` (string): The ID of the quiz session
- `user_pseudo` (string): The pseudo/username of the user
- `answer_index` (int): The selected answer index (0-3)

**Example Usage**:
```python
result = await submit_answer(session_id="abc123", user_pseudo="PlayerName", answer_index=2)
```

**Response**: JSON object containing:
```json
{
  "correct": true,
  "correct_answer_index": 2,
  "submitted_answer_index": 2,
  "user_pseudo": "PlayerName",
  "new_score": 1,
  "question_id": 1
}
```

### 7. Advance Question

**Tool Name**: `advance_question`

**Description**: Move to the next question in the quiz session

**Parameters**:
- `session_id` (string): The ID of the quiz session

**Example Usage**:
```python
result = await advance_question(session_id="abc123")
```

**Response**: JSON object containing:
```json
{
  "previous_question": 1,
  "current_question": 2,
  "total_questions": 3,
  "quiz_finished": false
}
```

### 8. Get Live Scores

**Tool Name**: `get_scores`

**Description**: Get the current scoreboard for a quiz session

**Parameters**:
- `session_id` (string): The ID of the quiz session

**Example Usage**:
```python
scores = await get_scores(session_id="abc123")
```

**Response**: JSON object containing:
```json
{
  "scores": [
    {"pseudo": "PlayerName", "score": 2},
    {"pseudo": "Player2", "score": 1}
  ],
  "current_question": 2,
  "total_questions": 3,
  "session_id": "abc123"
}
```

### 9. Get Final Score

**Tool Name**: `get_final_score`

**Description**: Get final results when quiz is completed

**Parameters**:
- `session_id` (string): The ID of the quiz session

**Example Usage**:
```python
final_results = await get_final_score(session_id="abc123")
```

**Response**: JSON object containing:
```json
{
  "final_scores": [
    {"pseudo": "PlayerName", "score": 3, "percentage": 100.0, "rank": 1},
    {"pseudo": "Player2", "score": 2, "percentage": 66.7, "rank": 2}
  ],
  "total_questions": 3,
  "quiz_finished": true,
  "session_id": "abc123",
  "theme": "science"
}
```

### 10. Health Check

**Tool Name**: `health_check`

**Description**: Quick health check for server status

**Parameters**: None

**Example Usage**:
```python
status = await health_check()
```

**Response**: JSON object containing server status information

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

### Example 1: Complete Quiz Workflow via MCP

```python
# 1. Start a new quiz session
session = await start_session(theme="science", num_questions=3)
session_id = json.loads(session)["session_id"]

# 2. Add players to session
alice_result = await add_user(session_id=session_id, user_pseudo="Alice")
bob_result = await add_user(session_id=session_id, user_pseudo="Bob")

# 3. Get first question
question = await get_next_question(session_id=session_id)
question_data = json.loads(question)
print(f"Question: {question_data['question_text']}")
print(f"Options: {question_data['options']}")

# 4. Alice answers question 1
alice_answer = await submit_answer(
    session_id=session_id, 
    user_pseudo="Alice", 
    answer_index=2
)

# 5. Bob answers question 1
bob_answer = await submit_answer(
    session_id=session_id, 
    user_pseudo="Bob", 
    answer_index=1
)

# 6. Check live scores
scores = await get_scores(session_id=session_id)
print(f"Current scores: {scores}")

# 7. Advance to next question
advance_result = await advance_question(session_id=session_id)

# 8. Get question 2
next_question = await get_next_question(session_id=session_id)

# ... repeat for all questions ...

# 9. Get final results
final_scores = await get_final_score(session_id=session_id)
print(f"Final results: {final_scores}")
```

### Example 2: Separated Validation Workflow

```python
# Alternative approach using separate validation and scoring
# 1. User submits answer
validation_result = await validate_answer(
    session_id=session_id,
    question_id=1,
    answer_index=2
)

# 2. Check if correct and update score
validation_data = json.loads(validation_result)
if validation_data["correct"]:
    score_update = await update_score(
        session_id=session_id,
        user_pseudo="Alice",
        correct=True
    )
```

### Example 3: Session Management

```python
# Check if user already exists
result = await add_user(session_id="game123", user_pseudo="Alice")
result_data = json.loads(result)
if result_data["already_exists"]:
    print(f"User already in game with score: {result_data['score']}")
else:
    print(f"User added with ID: {result_data['user_id']}")
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

