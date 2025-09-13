"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Clock } from "lucide-react"

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

interface ResponseTimeChartProps {
  players: PlayerStats[]
  theme: string
}

export function ResponseTimeChart({ players, theme }: ResponseTimeChartProps) {
  const getThemeColor = (theme: string) => {
    const colors = {
      classic: "#1d4ed8", // blue-700
      ocean: "#0891b2", // cyan-600
      sunset: "#db2777", // pink-600
      forest: "#65a30d", // lime-600
    }
    return colors[theme as keyof typeof colors] || colors.classic
  }

  const chartData = players
    .sort((a, b) => a.avgResponseTime - b.avgResponseTime)
    .map((player, index) => ({
      name: player.name.length > 8 ? player.name.substring(0, 8) + "..." : player.name,
      responseTime: Number.parseFloat(player.avgResponseTime.toFixed(1)),
      fullName: player.name,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-primary" />
          Response Times
        </CardTitle>
        <CardDescription>Average response time per player</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: "Seconds", angle: -90, position: "insideLeft" }} />
              <Tooltip
                formatter={(value: number) => [`${value}s`, "Avg Response Time"]}
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
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke={getThemeColor(theme)}
                strokeWidth={3}
                dot={{ fill: getThemeColor(theme), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
