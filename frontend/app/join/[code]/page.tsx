"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Clock, HelpCircle, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface GameInfo {
  title: string
  description: string
  questionCount: number
  theme: string
  estimatedTime: number
  isActive: boolean
}

export default function JoinGamePage() {
  const params = useParams()
  const gameCode = params.code as string

  const [playerName, setPlayerName] = useState("")
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")

  // Simulate fetching game info
  useEffect(() => {
    const fetchGameInfo = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock game data - in real implementation, this would fetch from backend
        const mockGameInfo: GameInfo = {
          title: "Science Quiz Challenge",
          description: "Test your knowledge of basic science concepts",
          questionCount: 10,
          theme: "classic",
          estimatedTime: 5,
          isActive: true,
        }

        setGameInfo(mockGameInfo)
      } catch (err) {
        setError("Game not found or has ended")
      } finally {
        setIsLoading(false)
      }
    }

    if (gameCode) {
      fetchGameInfo()
    }
  }, [gameCode])

  const joinGame = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name")
      return
    }

    setIsJoining(true)
    setError("")

    try {
      // Simulate joining game
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Navigate to waiting room
      const theme = gameInfo?.theme || "classic"
      window.location.href = `/waiting/${gameCode}?player=${encodeURIComponent(playerName)}&theme=${theme}`
    } catch (err) {
      setError("Failed to join game. Please try again.")
    } finally {
      setIsJoining(false)
    }
  }

  const getThemeColors = (theme: string) => {
    const themes = {
      classic: ["bg-green-600", "bg-blue-600", "bg-yellow-600", "bg-red-600"],
      ocean: ["bg-blue-700", "bg-cyan-600", "bg-teal-600", "bg-indigo-600"],
      sunset: ["bg-orange-600", "bg-pink-600", "bg-purple-600", "bg-red-600"],
      forest: ["bg-green-700", "bg-emerald-600", "bg-lime-600", "bg-yellow-700"],
    }
    return themes[theme as keyof typeof themes] || themes.classic
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading game...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !gameInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Game Not Found</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => (window.location.href = "/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Badge variant="outline" className="font-mono">
              Game: {gameCode}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Game Info Card */}
          {gameInfo && (
            <Card className="mb-8">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-balance">{gameInfo.title}</CardTitle>
                {gameInfo.description && (
                  <CardDescription className="text-base text-pretty">{gameInfo.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {/* Game Stats */}
                <div className="flex justify-center gap-6 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                      <HelpCircle className="h-4 w-4" />
                      Questions
                    </div>
                    <p className="text-2xl font-bold">{gameInfo.questionCount}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      Time
                    </div>
                    <p className="text-2xl font-bold">~{gameInfo.estimatedTime}m</p>
                  </div>
                </div>

                {/* Theme Preview */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Theme: {gameInfo.theme}</p>
                  <div className="flex justify-center gap-2">
                    {getThemeColors(gameInfo.theme).map((color, index) => (
                      <div key={index} className={`w-6 h-6 ${color} rounded-full`} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Join Form */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Join the Game
              </CardTitle>
              <CardDescription>Enter your name to participate in this quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Player Name Input */}
              <div className="space-y-2">
                <Label htmlFor="player-name">Your Name</Label>
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {playerName.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    id="player-name"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && joinGame()}
                    className="text-lg"
                    maxLength={20}
                  />
                </div>
                <p className="text-xs text-muted-foreground">This name will be visible to other players</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Join Button */}
              <Button
                onClick={joinGame}
                disabled={isJoining || !playerName.trim()}
                className="w-full text-lg py-6 bg-primary hover:bg-primary/90"
                size="lg"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Joining Game...
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5 mr-2" />
                    Join Game
                  </>
                )}
              </Button>

              {/* Game Status */}
              <div className="text-center">
                <Badge variant={gameInfo?.isActive ? "default" : "secondary"} className="bg-green-100 text-green-800">
                  {gameInfo?.isActive ? "Game Active" : "Waiting for Host"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">How to Play:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Wait in the lobby until the host starts the game</li>
                <li>• Answer questions as quickly and accurately as possible</li>
                <li>• Points are awarded based on speed and correctness</li>
                <li>• Check the leaderboard to see your ranking</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
