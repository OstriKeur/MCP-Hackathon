"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Trophy } from "lucide-react"

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

interface LeaderboardChartProps {
  players: PlayerStats[]
  theme: string
}

export function LeaderboardChart({ players, theme }: LeaderboardChartProps) {
  const getThemeColor = (theme: string) => {
    const colors = {
      classic: "#059669", // green-600
      ocean: "#0284c7", // sky-600
      sunset: "#ea580c", // orange-600
      forest: "#047857", // emerald-700
    }
    return colors[theme as keyof typeof colors] || colors.classic
  }

  const chartData = players
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((player) => ({
      name: player.name.length > 8 ? player.name.substring(0, 8) + "..." : player.name,
      score: player.score,
      fullName: player.name,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          Score Chart
        </CardTitle>
        <CardDescription>Top 5 players by score</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [value.toLocaleString(), "Score"]}
                labelFormatter={(label: string, payload: any) => {
                  const data = payload?.[0]?.payload
                  return data ? data.fullName : label
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="score" fill={getThemeColor(theme)} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
