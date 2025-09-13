"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Monitor, Smartphone, ExternalLink, Copy, Check } from "lucide-react"

interface DualRoleManagerProps {
  gameCode: string
  isHost?: boolean
}

export function DualRoleManager({ gameCode, isHost = false }: DualRoleManagerProps) {
  const [copied, setCopied] = useState(false)
  const [playerWindow, setPlayerWindow] = useState<Window | null>(null)

  const hostUrl = `${window.location.origin}/waiting/${gameCode}`
  const playerUrl = `${window.location.origin}/join/${gameCode}`

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const openPlayerWindow = () => {
    const newWindow = window.open(playerUrl, "kahoot-player", "width=400,height=600,scrollbars=yes,resizable=yes")
    setPlayerWindow(newWindow)
  }

  const openPlayerTab = () => {
    const newTab = window.open(playerUrl, "_blank")
    setPlayerWindow(newTab)
  }

  useEffect(() => {
    return () => {
      if (playerWindow && !playerWindow.closed) {
        playerWindow.close()
      }
    }
  }, [playerWindow])

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Play as Host & Player
          <Badge variant="secondary" className="ml-auto">
            Same Device
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Want to participate as both host and player? Open the player interface in a separate window or tab.
        </p>

        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Host View:</span>
            <span className="text-sm text-muted-foreground">Current window</span>
          </div>

          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Player View:</span>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={openPlayerWindow} className="text-xs bg-transparent">
                <ExternalLink className="h-3 w-3 mr-1" />
                New Window
              </Button>
              <Button size="sm" variant="outline" onClick={openPlayerTab} className="text-xs bg-transparent">
                <ExternalLink className="h-3 w-3 mr-1" />
                New Tab
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>Player Join URL:</span>
            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(playerUrl)} className="h-6 px-2 text-xs">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <code className="text-xs bg-muted px-2 py-1 rounded block break-all">{playerUrl}</code>
        </div>
      </CardContent>
    </Card>
  )
}
