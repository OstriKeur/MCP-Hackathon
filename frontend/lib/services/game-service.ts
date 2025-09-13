import { GameAPI } from "../api/game-api"
import type { PlayerScore, QuestionResponse } from "../types/api"

export class GameService {
  // Create and initialize a new game session
  static async createNewGame(): Promise<string> {
    const response = await GameAPI.createSession()

    // Store session info in localStorage for persistence
    localStorage.setItem("currentGameSession", response.session_id)
    localStorage.setItem("isGameHost", "true")

    return response.session_id
  }

  // Join an existing game session
  static async joinGame(name: string, sessionId: string): Promise<string> {
    const response = await GameAPI.addUserToSession({ name, session_id: sessionId })

    // Store user info in localStorage
    localStorage.setItem("currentGameSession", sessionId)
    localStorage.setItem("currentUserId", response.user_id)
    localStorage.setItem("currentUserName", name)
    localStorage.setItem("isGameHost", "false")

    return response.user_id
  }

  // Get current game state from localStorage
  static getCurrentGameState() {
    return {
      sessionId: localStorage.getItem("currentGameSession"),
      userId: localStorage.getItem("currentUserId"),
      userName: localStorage.getItem("currentUserName"),
      isHost: localStorage.getItem("isGameHost") === "true",
    }
  }

  // Clear game state (when leaving game)
  static clearGameState() {
    localStorage.removeItem("currentGameSession")
    localStorage.removeItem("currentUserId")
    localStorage.removeItem("currentUserName")
    localStorage.removeItem("isGameHost")
  }

  // Get question with error handling and state management
  static async getCurrentQuestion(sessionId: string): Promise<QuestionResponse | null> {
    try {
      const question = await GameAPI.getNextQuestion(sessionId)

      if (question.finished) {
        // Game is finished, store final state
        localStorage.setItem("gameFinished", "true")
        return null
      }

      return question
    } catch (error) {
      console.error("[v0] Error getting current question:", error)
      throw error
    }
  }

  // Submit answer with optimistic updates
  static async submitPlayerAnswer(sessionId: string, userId: string, answer: number) {
    try {
      const response = await GameAPI.submitAnswer({
        session_id: sessionId,
        user_id: userId,
        answer,
      })

      // Update local score cache
      const currentScore = localStorage.getItem("currentUserScore")
      localStorage.setItem("currentUserScore", response.new_score.toString())

      return response
    } catch (error) {
      console.error("[v0] Error submitting answer:", error)
      throw error
    }
  }

  // Get live leaderboard with caching
  static async getLiveScores(sessionId: string): Promise<PlayerScore[]> {
    try {
      const response = await GameAPI.getScores(sessionId)

      // Cache scores for offline viewing
      localStorage.setItem("lastGameScores", JSON.stringify(response.scores))
      localStorage.setItem(
        "lastGameProgress",
        JSON.stringify({
          current: response.current_question,
          total: response.total_questions,
        }),
      )

      return response.scores
    } catch (error) {
      console.error("[v0] Error getting live scores:", error)

      // Return cached scores if available
      const cachedScores = localStorage.getItem("lastGameScores")
      if (cachedScores) {
        return JSON.parse(cachedScores)
      }

      throw error
    }
  }

  // Host-only: Advance to next question
  static async moveToNextQuestion(sessionId: string) {
    const gameState = this.getCurrentGameState()

    if (!gameState.isHost) {
      throw new Error("Only the game host can advance questions")
    }

    try {
      return await GameAPI.advanceQuestion(sessionId)
    } catch (error) {
      console.error("[v0] Error advancing question:", error)
      throw error
    }
  }
}
