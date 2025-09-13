"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Target } from "lucide-react"

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

interface AccuracyChartProps {
  players: PlayerStats[]
  theme: string
}

export function AccuracyChart({ players, theme }: AccuracyChartProps) {
  const getThemeColors = (theme: string) => {
    const colors = {
      classic: ["#059669", "#1d4ed8", "#ca8a04", "#dc2626"],
      ocean: ["#1e40af", "#0891b2", "#0d9488", "#4338ca"],
      sunset: ["#ea580c", "#db2777", "#9333ea", "#dc2626"],
      forest: ["#047857", "#059669", "#65a30d", "#ca8a04"],
    }
    return colors[theme as keyof typeof colors] || colors.classic
  }

  const accuracyRanges = [
    { name: "90-100%", count: 0, range: [90, 100] },
    { name: "80-89%", count: 0, range: [80, 89] },
    { name: "70-79%", count: 0, range: [70, 79] },
    { name: "Below 70%", count: 0, range: [0, 69] },
  ]

  players.forEach((player) => {
    const range = accuracyRanges.find((r) => player.accuracy >= r.range[0] && player.accuracy <= r.range[1])
    if (range) range.count++
  })

  const chartData = accuracyRanges.filter((range) => range.count > 0)
  const colors = getThemeColors(theme)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Accuracy Distribution
        </CardTitle>
        <CardDescription>Player accuracy ranges</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [value, "Players"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
