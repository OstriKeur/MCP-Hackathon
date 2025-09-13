"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Brain, Users, Trophy, Zap, Clock, Eye, RotateCcw } from "lucide-react"
import { QuizModeSelector } from "@/components/quiz-mode-selector"

export default function HomePage() {
  const [gameCode, setGameCode] = useState("")
  const [selectedMode, setSelectedMode] = useState("question-by-question")
  const [lastGameCode, setLastGameCode] = useState<string | null>(null)

  useEffect(() => {
    const savedGameCode = localStorage.getItem("last-game-code")
    if (savedGameCode) {
      setLastGameCode(savedGameCode)
    }
  }, [])

  const handleCreateGame = () => {
    window.location.href = `/create?mode=${selectedMode}`
  }

  const handleJoinGame = () => {
    if (gameCode.trim()) {
      window.location.href = `/join/${gameCode}`
    }
  }

  const handleReturnToResults = () => {
    if (lastGameCode) {
      window.location.href = `/game-end/${lastGameCode}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-balance">Kahoot MCP</h1>
            </div>
            <div className="flex items-center gap-3">
              {lastGameCode && (
                <Button
                  onClick={handleReturnToResults}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4" />
                  Last Results
                </Button>
              )}
              <Badge variant="secondary" className="text-sm">
                Powered by Mistral AI
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-balance mb-4">
            {"Make Learning "}
            <span className="text-primary">Interactive</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Create engaging quizzes with AI assistance or join live games. Experience real-time learning with dynamic
            quiz modes and instant feedback.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Create Game Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Create a Game</CardTitle>
                  <CardDescription>Design your quiz with AI assistance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mode-selector" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Choose Quiz Mode
                </Label>
                <QuizModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />
              </div>
              <Button
                onClick={handleCreateGame}
                className="w-full text-lg py-6 bg-primary hover:bg-primary/90"
                size="lg"
              >
                Create Game
              </Button>
            </CardContent>
          </Card>

          {/* Join Game Card */}
          <Card className="relative overflow-hidden border-2 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Join a Game</CardTitle>
                  <CardDescription>Enter game code to participate</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="game-code">Game Code</Label>
                <Input
                  id="game-code"
                  placeholder="Enter 6-digit code"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={6}
                />
              </div>
              <Button
                onClick={handleJoinGame}
                disabled={gameCode.length !== 6}
                className="w-full text-lg py-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                size="lg"
              >
                Join Game
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center p-6">
            <div className="p-3 bg-chart-1/10 rounded-full w-fit mx-auto mb-4">
              <Zap className="h-8 w-8 text-chart-1" />
            </div>
            <h3 className="font-semibold mb-2">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Generate questions and get insights with Mistral AI integration
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="p-3 bg-chart-2/10 rounded-full w-fit mx-auto mb-4">
              <Trophy className="h-8 w-8 text-chart-2" />
            </div>
            <h3 className="font-semibold mb-2">Live Statistics</h3>
            <p className="text-sm text-muted-foreground">Real-time rankings, accuracy, and response speed tracking</p>
          </Card>

          <Card className="text-center p-6">
            <div className="p-3 bg-chart-3/10 rounded-full w-fit mx-auto mb-4">
              <Eye className="h-8 w-8 text-chart-3" />
            </div>
            <h3 className="font-semibold mb-2">Quiz Modes</h3>
            <p className="text-sm text-muted-foreground">Question-by-question or full-game modes with review options</p>
          </Card>
        </div>
      </main>
    </div>
  )
}
