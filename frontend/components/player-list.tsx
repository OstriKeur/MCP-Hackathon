"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown, Users, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Player {
  id: string
  name: string
  joinedAt: Date
  isReady: boolean
}

interface PlayerListProps {
  players: Player[]
  isHost: boolean
  theme: string
}

export function PlayerList({ players, isHost, theme }: PlayerListProps) {
  const getThemeColor = (index: number) => {
    const colors = {
      classic: ["bg-green-600", "bg-blue-600", "bg-yellow-600", "bg-red-600"],
      ocean: ["bg-blue-700", "bg-cyan-600", "bg-teal-600", "bg-indigo-600"],
      sunset: ["bg-orange-600", "bg-pink-600", "bg-purple-600", "bg-red-600"],
      forest: ["bg-green-700", "bg-emerald-600", "bg-lime-600", "bg-yellow-700"],
    }
    const themeColors = colors[theme as keyof typeof colors] || colors.classic
    return themeColors[index % themeColors.length]
  }

  const formatJoinTime = (joinedAt: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - joinedAt.getTime()) / 1000)

    if (diff < 60) return "Just joined"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Players ({players.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                player.isReady ? "bg-green-50 border-green-200 dark:bg-green-950/20" : "bg-muted border-border",
              )}
            >
              {/* Avatar with theme color */}
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={cn("text-white font-semibold", getThemeColor(index))}>
                    {player.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {index === 0 && isHost && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center">
                    <Crown className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{player.name}</p>
                  {index === 0 && isHost && <Badge variant="secondary">Host</Badge>}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatJoinTime(player.joinedAt)}
                </div>
              </div>

              {/* Status */}
              <div>
                <Badge
                  variant={player.isReady ? "default" : "secondary"}
                  className={cn(
                    "text-xs",
                    player.isReady ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600",
                  )}
                >
                  {player.isReady ? "Ready" : "Joining..."}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {players.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No players yet</p>
            <p className="text-sm text-muted-foreground">Share the game code to invite players</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
