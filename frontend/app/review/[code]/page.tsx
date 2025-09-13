"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, ArrowLeft, CheckCircle, XCircle, Clock, User } from "lucide-react"
import { useParams } from "next/navigation"

interface PlayerAnswer {
  playerId: string
  playerName: string
  answer: string
  isCorrect: boolean
  responseTime: number
}

interface QuestionReview {
  id: string
  question: string
  correctAnswer: string
  options: string[]
  playerAnswers: PlayerAnswer[]
}

export default function ReviewPage() {
  const params = useParams()
  const gameCode = params.code as string
  const [questions, setQuestions] = useState<QuestionReview[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading game review data
    const timer = setTimeout(() => {
      setQuestions([
        {
          id: "1",
          question: "What is the capital of France?",
          correctAnswer: "Paris",
          options: ["London", "Berlin", "Paris", "Madrid"],
          playerAnswers: [
            { playerId: "1", playerName: "Alice", answer: "Paris", isCorrect: true, responseTime: 2.3 },
            { playerId: "2", playerName: "Bob", answer: "London", isCorrect: false, responseTime: 4.1 },
            { playerId: "3", playerName: "Charlie", answer: "Paris", isCorrect: true, responseTime: 1.8 },
            { playerId: "4", playerName: "Diana", answer: "Berlin", isCorrect: false, responseTime: 3.5 },
          ],
        },
        {
          id: "2",
          question: "Which planet is known as the Red Planet?",
          correctAnswer: "Mars",
          options: ["Venus", "Mars", "Jupiter", "Saturn"],
          playerAnswers: [
            { playerId: "1", playerName: "Alice", answer: "Mars", isCorrect: true, responseTime: 1.9 },
            { playerId: "2", playerName: "Bob", answer: "Mars", isCorrect: true, responseTime: 2.7 },
            { playerId: "3", playerName: "Charlie", answer: "Venus", isCorrect: false, responseTime: 3.2 },
            { playerId: "4", playerName: "Diana", answer: "Mars", isCorrect: true, responseTime: 2.1 },
          ],
        },
      ])
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [gameCode])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading game review...</p>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const correctAnswers = currentQ.playerAnswers.filter((a) => a.isCorrect).length
  const totalAnswers = currentQ.playerAnswers.length
  const accuracyRate = Math.round((correctAnswers / totalAnswers) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Game Review</h1>
              </div>
            </div>
            <Badge variant="secondary">Game: {gameCode}</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Question Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Question {currentQuestion + 1} of {questions.length}
          </h2>
          <div className="flex gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestion ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentQuestion(index)}
                className="w-10 h-10 p-0"
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Question Card */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">{currentQ.question}</CardTitle>
                <CardDescription>
                  Correct Answer:{" "}
                  <span className="font-semibold text-green-700 dark:text-green-400">{currentQ.correctAnswer}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {currentQ.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 ${
                        option === currentQ.correctAnswer
                          ? "border-green-600 bg-green-50 dark:bg-green-950/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {option === currentQ.correctAnswer && (
                          <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-400" />
                        )}
                        <span className="font-medium">{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Player Answers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Player Responses
                </CardTitle>
                <CardDescription>
                  {correctAnswers} out of {totalAnswers} correct ({accuracyRate}% accuracy)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentQ.playerAnswers.map((answer) => (
                    <div key={answer.playerId} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {answer.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-700 dark:text-red-400" />
                          )}
                          <span className="font-medium">{answer.playerName}</span>
                        </div>
                        <Badge variant={answer.isCorrect ? "default" : "destructive"}>{answer.answer}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {answer.responseTime}s
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{accuracyRate}%</div>
                  <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {correctAnswers}/{totalAnswers}
                  </div>
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {(currentQ.playerAnswers.reduce((sum, a) => sum + a.responseTime, 0) / totalAnswers).toFixed(1)}s
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                >
                  Previous Question
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={currentQuestion === questions.length - 1}
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                >
                  Next Question
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
