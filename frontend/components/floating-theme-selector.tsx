"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Palette, Sun, Moon, Flame } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function FloatingThemeSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const themes = [
    { id: "dark", name: "Dark", icon: Moon, color: "bg-slate-800" },
    { id: "light", name: "Light", icon: Sun, color: "bg-slate-100" },
    { id: "miaou", name: "Miaou", icon: Flame, color: "bg-orange-500" },
  ] as const

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <Card className="mb-2 shadow-lg border-2">
          <CardContent className="p-2">
            <div className="flex gap-2">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon
                return (
                  <Button
                    key={themeOption.id}
                    variant={theme === themeOption.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setTheme(themeOption.id)
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-2 h-10"
                  >
                    <div className={`w-3 h-3 rounded-full ${themeOption.color}`} />
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{themeOption.name}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={() => setIsOpen(!isOpen)} size="icon" className="rounded-full shadow-lg h-12 w-12">
        <Palette className="h-5 w-5" />
      </Button>
    </div>
  )
}
