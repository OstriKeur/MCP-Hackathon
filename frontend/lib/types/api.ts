// Request Models (matching Pydantic models)
export interface AddUserRequest {
  name: string
  session_id: string
}

export interface AnswerRequest {
  session_id: string
  user_id: string
  answer: number
}

// Response Models
export interface CreateSessionResponse {
  session_id: string
}

export interface AddUserResponse {
  user_id: string
  message: string
}

export interface Question {
  id: number
  question: string
  options: string[]
  question_number: number
  total_questions: number
}

export interface QuestionResponse extends Question {
  finished?: boolean
  message?: string
}

export interface AnswerResponse {
  correct: boolean
  correct_answer: number
  new_score: number
}

export interface PlayerScore {
  user_id: string
  name: string
  score: number
}

export interface ScoresResponse {
  scores: PlayerScore[]
  current_question: number
  total_questions: number
}

export interface AdvanceQuestionResponse {
  message: string
}

// Game State Types
export interface GameSession {
  session_id: string
  users: Record<string, { name: string; score: number }>
  scores: Record<string, number>
  current_question: number
  questions: Question[]
}

// Error Response
export interface APIError {
  detail: string
}
