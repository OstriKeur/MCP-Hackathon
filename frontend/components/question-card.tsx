"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  question: string
  answers: string[]
  correctAnswer: number
  timeLimit: number
  explanation?: string
}

interface QuestionCardProps {
  question: Question
  index: number
  theme: string
  onUpdate: (question: Partial<Question>) => void
  onDelete: () => void
}

const themeColors = {
  classic: [
    { bg: "bg-green-600", text: "text-white" },
    { bg: "bg-blue-600", text: "text-white" },
    { bg: "bg-yellow-600", text: "text-white" },
    { bg: "bg-red-600", text: "text-white" },
  ],
  ocean: [
    { bg: "bg-blue-700", text: "text-white" },
    { bg: "bg-cyan-600", text: "text-white" },
    { bg: "bg-teal-600", text: "text-white" },
    { bg: "bg-indigo-600", text: "text-white" },
  ],
  sunset: [
    { bg: "bg-orange-600", text: "text-white" },
    { bg: "bg-pink-600", text: "text-white" },
    { bg: "bg-purple-600", text: "text-white" },
    { bg: "bg-red-600", text: "text-white" },
  ],
  forest: [
    { bg: "bg-green-700", text: "text-white" },
    { bg: "bg-emerald-600", text: "text-white" },
    { bg: "bg-lime-600", text: "text-white" },
    { bg: "bg-yellow-700", text: "text-white" },
  ],
}

export function QuestionCard({ question, index, theme, onUpdate, onDelete }: QuestionCardProps) {
  const colors = themeColors[theme as keyof typeof themeColors] || themeColors.classic

  const updateAnswer = (answerIndex: number, value: string) => {
    const newAnswers = [...question.answers]
    newAnswers[answerIndex] = value
    onUpdate({ answers: newAnswers })
  }

  return (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
              {index + 1}
            </div>
            <Label className="text-base font-medium">Question {index + 1}</Label>
          </div>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Input */}
        <div className="space-y-2">
          <Label>Question</Label>
          <Input
            placeholder="Enter your question"
            value={question.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
          />
        </div>

        {/* Answers Grid */}
        <div className="space-y-2">
          <Label>Answer Options</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.answers.map((answer, answerIndex) => (
              <div
                key={answerIndex}
                className={cn(
                  "relative p-3 rounded-lg border-2 transition-all",
                  question.correctAnswer === answerIndex
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-border hover:border-primary/30",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm",
                      colors[answerIndex].bg,
                      colors[answerIndex].text,
                    )}
                  >
                    {String.fromCharCode(65 + answerIndex)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdate({ correctAnswer: answerIndex })}
                    className={cn(
                      "p-1 h-6 w-6",
                      question.correctAnswer === answerIndex ? "text-green-600" : "text-muted-foreground",
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  placeholder={`Answer ${String.fromCharCode(65 + answerIndex)}`}
                  value={answer}
                  onChange={(e) => updateAnswer(answerIndex, e.target.value)}
                  className="border-0 bg-transparent p-0 focus-visible:ring-0"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Click the checkmark to set the correct answer</p>
        </div>

        {/* Time Limit */}
        <div className="space-y-2">
          <Label>Time Limit</Label>
          <Select
            value={question.timeLimit.toString()}
            onValueChange={(value) => onUpdate({ timeLimit: Number.parseInt(value) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 seconds</SelectItem>
              <SelectItem value="20">20 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="120">2 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Explanation Field */}
        <div className="space-y-2">
          <Label>Explanation (Optional)</Label>
          <Input
            placeholder="Explain why this is the correct answer"
            value={question.explanation || ""}
            onChange={(e) => onUpdate({ explanation: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">This explanation will be shown during the review step</p>
        </div>
      </CardContent>
    </Card>
  )
}
