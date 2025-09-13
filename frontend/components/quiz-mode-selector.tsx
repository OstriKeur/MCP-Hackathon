"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

interface QuizModeSelectorProps {
  selectedMode: string
  onModeChange: (mode: string) => void
}

const quizModes = [
  {
    id: "question-by-question",
    name: "Question by Question",
    icon: Eye,
    description: "Show answers after each question",
    color: "bg-blue-600",
  },
  {
    id: "full-game",
    name: "Full Game",
    icon: EyeOff,
    description: "No answers shown during game",
    color: "bg-purple-600",
  },
]

export function QuizModeSelector({ selectedMode, onModeChange }: QuizModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {quizModes.map((mode) => {
        const IconComponent = mode.icon
        return (
          <Card
            key={mode.id}
            className={cn(
              "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
              selectedMode === mode.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/30",
            )}
            onClick={() => onModeChange(mode.id)}
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", mode.color, "bg-opacity-10")}>
                <IconComponent className={cn("h-5 w-5", mode.color.replace("bg-", "text-"))} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{mode.name}</p>
                <p className="text-xs text-muted-foreground">{mode.description}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
