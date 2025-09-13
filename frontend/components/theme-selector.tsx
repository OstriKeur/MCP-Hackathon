"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ThemeSelectorProps {
  selectedTheme: string
  onThemeChange: (theme: string) => void
}

const themes = [
  {
    id: "classic",
    name: "Classic",
    colors: ["bg-green-600", "bg-blue-600", "bg-yellow-600", "bg-red-600"],
    description: "Traditional Kahoot colors",
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: ["bg-blue-700", "bg-cyan-600", "bg-teal-600", "bg-indigo-600"],
    description: "Cool ocean vibes",
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: ["bg-orange-600", "bg-pink-600", "bg-purple-600", "bg-red-600"],
    description: "Warm sunset palette",
  },
  {
    id: "forest",
    name: "Forest",
    colors: ["bg-green-700", "bg-emerald-600", "bg-lime-600", "bg-yellow-700"],
    description: "Natural forest theme",
  },
]

export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {themes.map((theme) => (
        <Card
          key={theme.id}
          className={cn(
            "p-3 cursor-pointer transition-all duration-200 hover:shadow-md",
            selectedTheme === theme.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/30",
          )}
          onClick={() => onThemeChange(theme.id)}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              {theme.colors.map((color, index) => (
                <div key={index} className={cn("w-3 h-3 rounded-full", color)} />
              ))}
            </div>
          </div>
          <div>
            <p className="font-medium text-sm">{theme.name}</p>
            <p className="text-xs text-muted-foreground">{theme.description}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
