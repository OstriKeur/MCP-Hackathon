"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Clock, Target, Zap, TrendingUp, Users, Medal } from "lucide-react"
import { LeaderboardChart } from "@/components/leaderboard-chart"
import { AccuracyChart } from "@/components/accuracy-chart"
import { ResponseTimeChart } from "@/components/response-time-chart"
import { cn } from "@/lib/utils"

interface PlayerStats {
  id: string
  name: string
  score: number
  accuracy: number
  avgResponseTime: number
  correctAnswers: number
  totalAnswers: number
  rank: number
  trend: "up" | "down" | "same"
}

interface GameStats {
  totalPlayers: number
  questionsAnswered: number
  totalQuestions: number
  avgAccuracy: number
  avgResponseTime: number
  gameProgress: number
}

export default function StatisticsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const gameCode = params.code as string
  const theme = searchParams.get("theme") || "classic"

  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([])
  const [gameStats, setGameStats] = useState<GameStats | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(1)

  // Mock real-time data updates
  useEffect(() => {
    const mockPlayerStats: PlayerStats[] = [
      {
        id: "1",
        name: "Alice",
        score: 8500,
        accuracy: 95,
        avgResponseTime: 2.3,
        correctAnswers: 19,
        totalAnswers: 20,
        rank: 1,
        trend: "up",
      },
      {
        id: "2",
        name: "Bob",
        score: 7800,
        accuracy: 87,
        avgResponseTime: 3.1,
        correctAnswers: 17,
        totalAnswers: 20,
        rank: 2,
        trend: "same",
      },
      {
        id: "3",
        name: "Charlie",
        score: 7200,
        accuracy: 82,
        avgResponseTime: 4.2,
        correctAnswers: 16,
        totalAnswers: 20,
        rank: 3,
        trend: "down",
      },
      {
        id: "4",
        name: "Diana",
        score: 6900,
        accuracy: 78,
        avgResponseTime: 3.8,
        correctAnswers: 15,
        totalAnswers: 20,
        rank: 4,
        trend: "up",
      },
      {
        id: "5",
        name: "Eve",
        score: 6500,
        accuracy: 75,
        avgResponseTime: 4.5,
        correctAnswers: 15,
        totalAnswers: 20,
        rank: 5,
        trend: "down",
      },
    ]

    const mockGameStats: GameStats = {
      totalPlayers: 5,
      questionsAnswered: 8,
      totalQuestions: 10,
      avgAccuracy: 83.4,
      avgResponseTime: 3.6,
      gameProgress: 80,
    }

    setPlayerStats(mockPlayerStats)
    setGameStats(mockGameStats)

    // Simulate real-time updates
    const interval = setInterval(() => {
      setPlayerStats((prev) =>
        prev.map((player) => ({
          ...player,
          score: player.score + Math.floor(Math.random() * 100) - 50,
          accuracy: Math.max(0, Math.min(100, player.accuracy + (Math.random() - 0.5) * 2)),
          avgResponseTime: Math.max(0.5, player.avgResponseTime + (Math.random() - 0.5) * 0.2),
        })),
      )

      setCurrentQuestion((prev) => Math.min(10, prev + (Math.random() > 0.8 ? 1 : 0)))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getThemeColors = (theme: string) => {
    const themes = {
      classic: ["bg-green-600", "bg-blue-600", "bg-yellow-600", "bg-red-600"],
      ocean: ["bg-blue-700", "bg-cyan-600", "bg-teal-600", "bg-indigo-600"],
      sunset: ["bg-orange-600", "bg-pink-600", "bg-purple-600", "bg-red-600"],
      forest: ["bg-green-700", "bg-emerald-600", "bg-lime-600", "bg-yellow-700"],
    }
    return themes[theme as keyof typeof themes] || themes.classic
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return (
          <div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">
            #{rank}
          </div>
        )
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Trophy className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Live Statistics</h1>
                <p className="text-sm text-muted-foreground">Question {currentQuestion} of 10</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono">
                {gameCode}
              </Badge>
              <Badge className="bg-green-100 text-green-800">Live</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Game Overview */}
        {gameStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-chart-1 mx-auto mb-2" />
                <p className="text-2xl font-bold">{gameStats.totalPlayers}</p>
                <p className="text-sm text-muted-foreground">Players</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-chart-2 mx-auto mb-2" />
                <p className="text-2xl font-bold">{gameStats.avgAccuracy.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-chart-3 mx-auto mb-2" />
                <p className="text-2xl font-bold">{gameStats.avgResponseTime.toFixed(1)}s</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 text-chart-4 mx-auto mb-2" />
                <p className="text-2xl font-bold">{gameStats.gameProgress}%</p>
                <p className="text-sm text-muted-foreground">Progress</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Live Leaderboard
                </CardTitle>
                <CardDescription>Real-time player rankings and scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {playerStats.map((player, index) => (
                    <div
                      key={player.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-all",
                        player.rank <= 3
                          ? "bg-gradient-to-r from-yellow-50 to-transparent border-yellow-200"
                          : "bg-muted/50",
                      )}
                    >
                      {/* Rank */}
                      <div className="flex items-center gap-2">
                        {getRankIcon(player.rank)}
                        {getTrendIcon(player.trend)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className={cn("text-white font-semibold", getThemeColors(theme)[index % 4])}>
                          {player.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{player.name}</p>
                          {player.rank === 1 && <Badge className="bg-yellow-100 text-yellow-800">Leader</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {player.correctAnswers}/{player.totalAnswers} correct
                          </span>
                          <span>{player.accuracy.toFixed(1)}% accuracy</span>
                          <span>{player.avgResponseTime.toFixed(1)}s avg</span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="text-2xl font-bold">{player.score.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <AccuracyChart players={playerStats} theme={theme} />
              <ResponseTimeChart players={playerStats} theme={theme} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <LeaderboardChart players={playerStats} theme={theme} />

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Performers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Highest Score</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-yellow-600 text-white text-xs">
                            {playerStats[0]?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{playerStats[0]?.score.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Best Accuracy</span>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">
                          {Math.max(...playerStats.map((p) => p.accuracy)).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Fastest Response</span>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">
                          {Math.min(...playerStats.map((p) => p.avgResponseTime)).toFixed(1)}s
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Game Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Game Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Questions</span>
                        <span>{currentQuestion}/10</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(currentQuestion / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{((currentQuestion / 10) * 100).toFixed(0)}%</p>
                      <p className="text-sm text-muted-foreground">Complete</p>
                    </div>
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
