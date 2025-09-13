import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { FloatingThemeSelector } from "@/components/floating-theme-selector"
import { SponsorsFooter } from "@/components/sponsors-footer"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Kahoot MCP - AI-Powered Quiz Platform",
  description: "Create and play interactive quizzes with AI-generated questions",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider>
          <Suspense fallback={null}>
            {children}
            <FloatingThemeSelector />
            <SponsorsFooter />
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
