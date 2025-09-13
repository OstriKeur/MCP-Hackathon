"use client"

export function SponsorsFooter() {
  const sponsors = [
    { name: "TechCorp", logo: "/techcorp-logo.png" },
    { name: "EduTech", logo: "/edutech-logo.jpg" },
    { name: "AI Solutions", logo: "/ai-solutions-logo.jpg" },
    { name: "Learning Hub", logo: "/learning-hub-logo.jpg" },
    { name: "Quiz Masters", logo: "/quiz-masters-logo.jpg" },
  ]

  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Proudly Sponsored By</h3>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6 opacity-60 hover:opacity-80 transition-opacity">
          {sponsors.map((sponsor, index) => (
            <div key={index} className="flex items-center justify-center">
              <img
                src={sponsor.logo || "/placeholder.svg"}
                alt={`${sponsor.name} logo`}
                className="h-8 w-auto grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">© 2024 Kahoot MCP. Powered by AI and built with ❤️</p>
        </div>
      </div>
    </footer>
  )
}
