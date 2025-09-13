"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Clock, Users, ArrowRight, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  question: string
  answers: string[]
  correctAnswer: number
  timeLimit: number
  explanation?: string
}

interface Player {
  id: string
  name: string
  answer?: number
  responseTime?: number
  isCorrect?: boolean
}

export default function GamePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const gameCode = params.code as string
  const isHost = searchParams.get("host") === "true"
  const quizMode = searchParams.get("mode") || "question-by-question"

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [gamePhase, setGamePhase] = useState<"question" | "review" | "waiting">("question")
  const [debugMode, setDebugMode] = useState(false)

  const [players, setPlayers] = useState<Player[]>([
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
    { id: "3", name: "Charlie" },
    { id: "4", name: "Diana" },
  ])

  // Mock questions with explanations
  const questions: Question[] = [
    {
      id: "1",
      question: "What is the capital of France?",
      answers: ["Paris", "London", "Berlin", "Madrid"],
      correctAnswer: 0,
      timeLimit: 30,
      explanation:
        "Paris has been the capital of France since 987 AD and is the country's political, economic, and cultural center.",
    },
    {
      id: "2",
      question: "Which planet is closest to the Sun?",
      answers: ["Venus", "Mercury", "Earth", "Mars"],
      correctAnswer: 1,
      timeLimit: 30,
      explanation:
        "Mercury is the innermost planet in our solar system, orbiting at an average distance of 36 million miles from the Sun.",
    },
  ]

  const currentQuestion = questions[currentQuestionIndex]
  const answeredPlayers = players.filter((p) => p.answer !== undefined).length
  const totalPlayers = players.length

  // Timer effect
  useEffect(() => {
    if (gamePhase === "question" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gamePhase === "question") {
      // Time's up - show review if in question-by-question mode
      if (quizMode === "question-by-question") {
        setGamePhase("review")
      }
    }
  }, [timeLeft, gamePhase, quizMode])

  useEffect(() => {
    if (gamePhase === "question" && debugMode) {
      const interval = setInterval(() => {
        setPlayers((prevPlayers) =>
          prevPlayers.map((player) => {
            // Randomly simulate players answering
            if (!player.answer && Math.random() < 0.1) {
              return {
                ...player,
                answer: Math.floor(Math.random() * currentQuestion.answers.length),
                responseTime: Math.round((Math.random() * 10 + 1) * 10) / 10,
                isCorrect: Math.random() < 0.6, // 60% chance of being correct for demo
              }
            }
            return player
          }),
        )
      }, 500)

      return () => clearInterval(interval)
    }
  }, [gamePhase, debugMode, currentQuestion])

  const handleAnswerSelect = (answerIndex: number) => {
    if (gamePhase !== "question" || selectedAnswer !== null) return

    setSelectedAnswer(answerIndex)

    // In question-by-question mode, show review after everyone answers
    if (quizMode === "question-by-question") {
      // Simulate all players answering
      setTimeout(() => {
        setGamePhase("review")
      }, 1000)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setTimeLeft(questions[currentQuestionIndex + 1].timeLimit)
      setGamePhase("question")
    } else {
      // Game finished - redirect to results
      window.location.href = `/game-end/${gameCode}?mode=${quizMode}`
    }
  }

  const colors = [
    { bg: "bg-green-600", text: "text-white" },
    { bg: "bg-blue-600", text: "text-white" },
    { bg: "bg-yellow-600", text: "text-white" },
    { bg: "bg-red-600", text: "text-white" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Quiz Game</h1>
                <p className="text-sm text-muted-foreground">Code: {gameCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                {answeredPlayers}/{totalPlayers}
              </Badge>
              {isHost && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDebugMode(!debugMode)}
                  className="flex items-center gap-2"
                >
                  {debugMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  Debug {debugMode ? "Off" : "On"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {gamePhase === "question" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Timer */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-medium">Time Remaining</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{timeLeft}s</span>
                </div>
                <Progress value={(timeLeft / currentQuestion.timeLimit) * 100} className="h-2" />
              </CardContent>
            </Card>

            {isHost && debugMode && (
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-800 dark:text-orange-200">
                    <Eye className="h-5 w-5" />
                    Debug Mode - Real-time Player Answers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-all",
                          player.answer !== undefined
                            ? "border-blue-200 bg-blue-50 dark:bg-blue-950/20"
                            : "border-gray-200 bg-gray-50 dark:bg-gray-950/20",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-white",
                              player.answer !== undefined ? "bg-blue-500" : "bg-gray-400",
                            )}
                          >
                            {player.name[0]}
                          </div>
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <div className="text-right">
                          {player.answer !== undefined ? (
                            <>
                              <div className="text-sm font-medium">
                                Answer: {String.fromCharCode(65 + player.answer)}
                              </div>
                              <div className="text-xs text-muted-foreground">{player.responseTime}s</div>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">Thinking...</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Debug Info:</strong> This panel shows real-time player responses as they select their
                      answers. Players cannot see this information.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">{currentQuestion.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.answers.map((answer, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      className={cn(
                        "h-20 text-lg font-medium transition-all",
                        selectedAnswer === index && "ring-2 ring-primary bg-primary/10",
                      )}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                            colors[index].bg,
                            colors[index].text,
                          )}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        {answer}
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gamePhase === "review" && quizMode === "question-by-question" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Question Review */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">{currentQuestion.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {currentQuestion.answers.map((answer, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all",
                        index === currentQuestion.correctAnswer
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                          : "border-border bg-card",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                            colors[index].bg,
                            colors[index].text,
                          )}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="font-medium">{answer}</span>
                        {index === currentQuestion.correctAnswer && (
                          <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
                            Correct
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                {currentQuestion.explanation && (
                  <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Explanation</h4>
                      <p className="text-blue-800 dark:text-blue-200">{currentQuestion.explanation}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Player Results */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Player Results</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border",
                          player.isCorrect
                            ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                            : "border-red-200 bg-red-50 dark:bg-red-950/20",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                              player.isCorrect ? "bg-green-500" : "bg-red-500",
                            )}
                          >
                            {player.name[0]}
                          </div>
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {player.answer !== undefined ? String.fromCharCode(65 + player.answer) : "No answer"}
                          </div>
                          <div className="text-xs text-muted-foreground">{player.responseTime}s</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {isHost && (
                  <div className="flex justify-center mt-6">
                    <Button onClick={handleNextQuestion} size="lg">
                      {currentQuestionIndex < questions.length - 1 ? (
                        <>
                          Next Question
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        "Finish Game"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
