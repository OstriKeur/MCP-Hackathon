"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface GameCountdownProps {
  countdown: number
  theme: string
}

export function GameCountdown({ countdown, theme }: GameCountdownProps) {
  const getThemeGradient = (theme: string) => {
    const gradients = {
      classic: "from-green-600 to-blue-600",
      ocean: "from-blue-700 to-cyan-600",
      sunset: "from-orange-600 to-pink-600",
      forest: "from-green-700 to-emerald-600",
    }
    return gradients[theme as keyof typeof gradients] || gradients.classic
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background">
      <Card className="w-full max-w-md">
        <CardContent className="p-12 text-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Game Starting!</h2>
            <p className="text-muted-foreground">Get ready to play...</p>
          </div>

          <div
            className={cn(
              "w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl font-bold text-white mb-8 bg-gradient-to-br animate-pulse",
              getThemeGradient(theme),
            )}
          >
            {countdown}
          </div>

          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full bg-gradient-to-r transition-all duration-1000",
                  getThemeGradient(theme),
                )}
                style={{ width: `${((3 - countdown) / 3) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">Prepare yourself!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
