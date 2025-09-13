"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share2, Clock, HelpCircle } from "lucide-react"

interface GamePreviewProps {
  title: string
  description: string
  questionCount: number
  theme: string
  gameCode: string
}

export function GamePreview({ title, description, questionCount, theme, gameCode }: GamePreviewProps) {
  const shareGame = () => {
    const shareUrl = `${window.location.origin}/join/${gameCode}`
    navigator.clipboard.writeText(shareUrl)
    alert("Game link copied to clipboard!")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Game Preview
        </CardTitle>
        <CardDescription>How your game will appear to players</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-balance">{title || "Untitled Quiz"}</h3>
            {description && <p className="text-sm text-muted-foreground text-pretty mt-1">{description}</p>}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              {questionCount} Questions
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />~{questionCount * 0.5} min
            </Badge>
          </div>

          {/* Theme Preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Theme: {theme}</p>
            <div className="flex gap-1">
              {theme === "classic" && (
                <>
                  <div className="w-4 h-4 bg-green-600 rounded-full" />
                  <div className="w-4 h-4 bg-blue-600 rounded-full" />
                  <div className="w-4 h-4 bg-yellow-600 rounded-full" />
                  <div className="w-4 h-4 bg-red-600 rounded-full" />
                </>
              )}
              {theme === "ocean" && (
                <>
                  <div className="w-4 h-4 bg-blue-700 rounded-full" />
                  <div className="w-4 h-4 bg-cyan-600 rounded-full" />
                  <div className="w-4 h-4 bg-teal-600 rounded-full" />
                  <div className="w-4 h-4 bg-indigo-600 rounded-full" />
                </>
              )}
              {theme === "sunset" && (
                <>
                  <div className="w-4 h-4 bg-orange-600 rounded-full" />
                  <div className="w-4 h-4 bg-pink-600 rounded-full" />
                  <div className="w-4 h-4 bg-purple-600 rounded-full" />
                  <div className="w-4 h-4 bg-red-600 rounded-full" />
                </>
              )}
              {theme === "forest" && (
                <>
                  <div className="w-4 h-4 bg-green-700 rounded-full" />
                  <div className="w-4 h-4 bg-emerald-600 rounded-full" />
                  <div className="w-4 h-4 bg-lime-600 rounded-full" />
                  <div className="w-4 h-4 bg-yellow-700 rounded-full" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Game Code */}
        <div className="p-3 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-1">Game Code</p>
          <p className="text-2xl font-mono font-bold tracking-wider">{gameCode}</p>
        </div>

        {/* Share Button */}
        <Button onClick={shareGame} variant="outline" className="w-full bg-transparent">
          <Share2 className="h-4 w-4 mr-2" />
          Copy Game Link
        </Button>
      </CardContent>
    </Card>
  )
}
