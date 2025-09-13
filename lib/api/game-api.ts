import type {
  AddUserRequest,
  AddUserResponse,
  AnswerRequest,
  AnswerResponse,
  CreateSessionResponse,
  QuestionResponse,
  ScoresResponse,
  AdvanceQuestionResponse,
  APIError,
} from "../types/api"

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class GameAPIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "GameAPIError"
  }
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error: APIError = await response.json().catch(() => ({
      detail: "Unknown error occurred",
    }))
    throw new GameAPIError(response.status, error.detail)
  }

  return response.json()
}

// API Service Class
export class GameAPI {
  // Health check
  static async healthCheck(): Promise<{ message: string }> {
    return apiCall("/")
  }

  // Create a new game session
  static async createSession(): Promise<CreateSessionResponse> {
    return apiCall("/create-session", {
      method: "POST",
    })
  }

  // Add user to session
  static async addUserToSession(request: AddUserRequest): Promise<AddUserResponse> {
    return apiCall("/add-user-to-session", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  // Get next question
  static async getNextQuestion(sessionId: string): Promise<QuestionResponse> {
    return apiCall(`/next-question/${sessionId}`)
  }

  // Submit answer
  static async submitAnswer(request: AnswerRequest): Promise<AnswerResponse> {
    return apiCall("/answer", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  // Get live scores
  static async getScores(sessionId: string): Promise<ScoresResponse> {
    return apiCall(`/scores/${sessionId}`)
  }

  // Advance to next question (for game master)
  static async advanceQuestion(sessionId: string): Promise<AdvanceQuestionResponse> {
    return apiCall(`/advance-question/${sessionId}`, {
      method: "POST",
    })
  }
}

// React hooks for API calls (optional, for easier integration)
export const useGameAPI = () => {
  const createSession = async () => {
    try {
      return await GameAPI.createSession()
    } catch (error) {
      console.error("[v0] Failed to create session:", error)
      throw error
    }
  }

  const joinSession = async (name: string, sessionId: string) => {
    try {
      return await GameAPI.addUserToSession({ name, session_id: sessionId })
    } catch (error) {
      console.error("[v0] Failed to join session:", error)
      throw error
    }
  }

  const getQuestion = async (sessionId: string) => {
    try {
      return await GameAPI.getNextQuestion(sessionId)
    } catch (error) {
      console.error("[v0] Failed to get question:", error)
      throw error
    }
  }

  const submitAnswer = async (sessionId: string, userId: string, answer: number) => {
    try {
      return await GameAPI.submitAnswer({
        session_id: sessionId,
        user_id: userId,
        answer,
      })
    } catch (error) {
      console.error("[v0] Failed to submit answer:", error)
      throw error
    }
  }

  const getScores = async (sessionId: string) => {
    try {
      return await GameAPI.getScores(sessionId)
    } catch (error) {
      console.error("[v0] Failed to get scores:", error)
      throw error
    }
  }

  return {
    createSession,
    joinSession,
    getQuestion,
    submitAnswer,
    getScores,
  }
}
