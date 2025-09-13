"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Trophy, Clock, Target, Eye, Home, Zap } from "lucide-react"
import { useParams } from "next/navigation"

interface GameResults {
  gameCode: string
  totalQuestions: number
  totalPlayers: number
  gameMode: string
  winner: {
    name: string
    score: number
    accuracy: number
  }
  averageAccuracy: number
  averageResponseTime: number
}

export default function GameEndPage() {
  const params = useParams()
  const gameCode = params.code as string
  const [results, setResults] = useState<GameResults | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    localStorage.setItem("last-game-code", gameCode)

    // Simulate loading game results
    const timer = setTimeout(() => {
      setResults({
        gameCode,
        totalQuestions: 10,
        totalPlayers: 4,
        gameMode: "question-by-question",
        winner: {
          name: "Alice",
          score: 8500,
          accuracy: 85,
        },
        averageAccuracy: 72,
        averageResponseTime: 2.8,
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [gameCode])

  const handleReviewAnswers = () => {
    window.location.href = `/review/${gameCode}`
  }

  const handleNewGame = () => {
    localStorage.removeItem("last-game-code")
    window.location.href = "/"
  }

  const handleReturnHome = () => {
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">Calculating results...</p>
        </div>
      </div>
    )
  }

  if (!results) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Game Complete!</h1>
            </div>
            <Badge variant="secondary">Game: {gameCode}</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
          <p className="text-lg text-muted-foreground">The game has ended. Here are the final results.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
          {/* Winner Card */}
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Winner
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">{results.winner.name}</div>
              <div className="text-3xl font-bold mb-1">{results.winner.score.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mb-2">Final Score</p>
              <Badge variant="secondary">{results.winner.accuracy}% Accuracy</Badge>
            </CardContent>
          </Card>

          {/* Game Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Game Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{results.totalQuestions}</div>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{results.totalPlayers}</div>
                <p className="text-sm text-muted-foreground">Players</p>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="capitalize">
                  {results.gameMode.replace("-", " ")} Mode
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">{results.averageAccuracy}%</div>
                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{results.averageResponseTime}s</div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
          <Button onClick={handleReviewAnswers} className="flex items-center gap-2 text-lg py-6" size="lg">
            <Eye className="h-5 w-5" />
            Review Answers
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={handleReturnHome}
              variant="outline"
              className="flex items-center gap-2 text-lg py-6 bg-transparent flex-1"
              size="lg"
            >
              <Home className="h-5 w-5" />
              Home
            </Button>
            <Button
              onClick={handleNewGame}
              variant="secondary"
              className="flex items-center gap-2 text-lg py-6 flex-1"
              size="lg"
            >
              <Zap className="h-5 w-5" />
              New Game
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
