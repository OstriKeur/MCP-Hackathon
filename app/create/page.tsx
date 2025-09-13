"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Wand2, Play } from "lucide-react"
import { QuestionCard } from "@/components/question-card"
import { GamePreview } from "@/components/game-preview"

interface Question {
  id: string
  question: string
  answers: string[]
  correctAnswer: number
  timeLimit: number
  explanation?: string
}

export default function CreateGamePage() {
  const searchParams = useSearchParams()
  const theme = searchParams.get("theme") || "classic"

  const [gameTitle, setGameTitle] = useState("")
  const [gameDescription, setGameDescription] = useState("")
  const [hiddenDescription, setHiddenDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [gameCode, setGameCode] = useState("")

  useEffect(() => {
    setGameCode(Math.random().toString(36).substring(2, 8).toUpperCase())
  }, [])

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      answers: ["", "", "", ""],
      correctAnswer: 0,
      timeLimit: 30,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updatedQuestion: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updatedQuestion } : q)))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const generateQuestionsWithAI = async () => {
    if (!gameTitle.trim()) {
      alert("Please enter a game title first")
      return
    }

    setIsGenerating(true)
    try {
      const promptDescription = hiddenDescription.trim() || gameDescription.trim() || gameTitle

      await new Promise((resolve) => setTimeout(resolve, 2000))

      const aiQuestions: Question[] = [
        {
          id: Date.now().toString(),
          question: `What is the main topic of "${gameTitle}"?`,
          answers: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          timeLimit: 30,
          explanation: "This question tests basic understanding of the main concept.",
        },
        {
          id: (Date.now() + 1).toString(),
          question: `Which concept is most important in ${gameTitle}?`,
          answers: ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
          correctAnswer: 1,
          timeLimit: 30,
          explanation: "This focuses on identifying key principles and their importance.",
        },
      ]

      setQuestions([...questions, ...aiQuestions])
    } catch (error) {
      console.error("Failed to generate questions:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const publishGame = () => {
    if (!gameTitle.trim() || questions.length === 0) {
      alert("Please add a title and at least one question")
      return
    }

    window.location.href = `/waiting/${gameCode}?host=true&theme=${theme}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">Create Game</h1>
                <p className="text-sm text-muted-foreground">Theme: {theme}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono">
                Code: {gameCode}
              </Badge>
              <Button onClick={publishGame} className="bg-primary hover:bg-primary/90">
                <Play className="h-4 w-4 mr-2" />
                Start Game
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Information</CardTitle>
                <CardDescription>Set up your quiz details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Game Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter your quiz title"
                    value={gameTitle}
                    onChange={(e) => setGameTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Public Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description shown to players"
                    value={gameDescription}
                    onChange={(e) => setGameDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hiddenDescription">Hidden Description (for AI)</Label>
                  <Textarea
                    id="hiddenDescription"
                    placeholder="Detailed context for AI question generation (not shown to players)"
                    value={hiddenDescription}
                    onChange={(e) => setHiddenDescription(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    This description will be used by AI to generate relevant questions but won't be visible to players
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  AI Question Generator
                </CardTitle>
                <CardDescription>
                  Let Mistral AI help you create engaging questions based on your hidden description or title
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={generateQuestionsWithAI}
                  disabled={isGenerating || !gameTitle.trim()}
                  className="w-full bg-transparent"
                  variant="outline"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Questions with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Questions ({questions.length})</h2>
                <Button onClick={addQuestion} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {questions.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No questions yet</p>
                  <Button onClick={addQuestion} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Question
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      index={index}
                      theme={theme}
                      onUpdate={(updatedQuestion) => updateQuestion(question.id, updatedQuestion)}
                      onDelete={() => deleteQuestion(question.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <GamePreview
                title={gameTitle}
                description={gameDescription}
                questionCount={questions.length}
                theme={theme}
                gameCode={gameCode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
