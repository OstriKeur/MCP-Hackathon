"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Play, Users, Share2, Copy, Crown, Clock, Loader2 } from "lucide-react"
import { PlayerList } from "@/components/player-list"
import { GameCountdown } from "@/components/game-countdown"

interface Player {
  id: string
  name: string
  joinedAt: Date
  isReady: boolean
}

interface GameInfo {
  title: string
  description: string
  questionCount: number
  theme: string
  hostName: string
}

export default function WaitingRoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const gameCode = params.code as string
  const isHost = searchParams.get("host") === "true"
  const playerName = searchParams.get("player")
  const theme = searchParams.get("theme") || "classic"

  const [players, setPlayers] = useState<Player[]>([])
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Mock data - in real implementation, this would use WebSocket connections
  useEffect(() => {
    const mockGameInfo: GameInfo = {
      title: "Science Quiz Challenge",
      description: "Test your knowledge of basic science concepts",
      questionCount: 10,
      theme: theme,
      hostName: "Quiz Master",
    }

    const mockPlayers: Player[] = [
      {
        id: "1",
        name: isHost ? "Quiz Master" : playerName || "Player",
        joinedAt: new Date(),
        isReady: true,
      },
      {
        id: "2",
        name: "Alice",
        joinedAt: new Date(Date.now() - 30000),
        isReady: true,
      },
      {
        id: "3",
        name: "Bob",
        joinedAt: new Date(Date.now() - 60000),
        isReady: false,
      },
      {
        id: "4",
        name: "Charlie",
        joinedAt: new Date(Date.now() - 90000),
        isReady: true,
      },
    ]

    setGameInfo(mockGameInfo)
    setPlayers(mockPlayers)

    // Simulate new players joining
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newPlayer: Player = {
          id: Date.now().toString(),
          name: `Player${Math.floor(Math.random() * 1000)}`,
          joinedAt: new Date(),
          isReady: Math.random() > 0.3,
        }
        setPlayers((prev) => [...prev, newPlayer])
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isHost, playerName, theme])

  const startGame = () => {
    setIsStarting(true)
    setCountdown(3)

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval)
          // Navigate to game or statistics
          window.location.href = `/statistics/${gameCode}?theme=${theme}`
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const shareGame = () => {
    const shareUrl = `${window.location.origin}/join/${gameCode}`
    navigator.clipboard.writeText(shareUrl)
    alert("Game link copied to clipboard!")
  }

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode)
    alert("Game code copied to clipboard!")
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

  if (countdown !== null) {
    return <GameCountdown countdown={countdown} theme={theme} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Waiting Room</h1>
              </div>
              {isHost && <Badge className="bg-yellow-600 text-white">Host</Badge>}
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono">
                {gameCode}
              </Badge>
              <Button variant="ghost" size="sm" onClick={copyGameCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Info */}
            {gameInfo && (
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-balance">{gameInfo.title}</CardTitle>
                  {gameInfo.description && (
                    <CardDescription className="text-base text-pretty">{gameInfo.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center gap-8 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{gameInfo.questionCount}</p>
                      <p className="text-sm text-muted-foreground">Questions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{players.length}</p>
                      <p className="text-sm text-muted-foreground">Players</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">~{Math.ceil(gameInfo.questionCount * 0.5)}m</p>
                      <p className="text-sm text-muted-foreground">Duration</p>
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

            {/* Players List */}
            <PlayerList players={players} isHost={isHost} theme={theme} />

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Play</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    Answer questions as quickly and accurately as possible
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    Points are awarded based on speed and correctness
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    Watch the leaderboard to track your progress
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    Have fun and learn something new!
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Host Controls */}
              {isHost && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Host Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={startGame}
                      disabled={isStarting || players.length === 0}
                      className="w-full text-lg py-6 bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      {isStarting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Start Game
                        </>
                      )}
                    </Button>

                    <Button onClick={shareGame} variant="outline" className="w-full bg-transparent">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Game Link
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Player Status */}
              {!isHost && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                          {(playerName || "P").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{playerName || "Player"}</p>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Ready
                        </Badge>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg text-center">
                      <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Waiting for host to start the game...</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Game Code Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Game Code</CardTitle>
                  <CardDescription>Share this code with others to join</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-mono font-bold tracking-wider mb-2">{gameCode}</p>
                    <Button variant="ghost" size="sm" onClick={copyGameCode} className="text-xs">
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
