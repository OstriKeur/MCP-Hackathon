# Frontend - Quiz Game UI

A modern, responsive Next.js frontend for the AI-powered multiplayer quiz game. Built with React, TypeScript, Tailwind CSS, and shadcn/ui components for a beautiful and intuitive user experience.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with dark/light theme support
- **Real-time Gameplay**: Live scoring, leaderboards, and question flow
- **Multiple Quiz Modes**: Question-by-question or full-game experiences
- **Interactive Charts**: Visual statistics with accuracy and response time tracking
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **TypeScript**: Full type safety and excellent developer experience
- **Performance Optimized**: Fast loading with Next.js optimizations

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **State Management**: React hooks with localStorage persistence
- **HTTP Client**: Native fetch API with custom service layer

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── create/            # Game creation flow
│   ├── game/[code]/       # Active game session
│   ├── game-end/[code]/   # Post-game results
│   ├── join/[code]/       # Join game flow
│   ├── review/[code]/     # Question review mode
│   ├── statistics/[code]/ # Detailed game analytics
│   ├── waiting/[code]/    # Pre-game lobby
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx          # Homepage
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui base components
│   ├── accuracy-chart.tsx
│   ├── game-countdown.tsx
│   ├── leaderboard-chart.tsx
│   ├── player-list.tsx
│   ├── question-card.tsx
│   ├── quiz-mode-selector.tsx
│   ├── response-time-chart.tsx
│   ├── theme-provider.tsx
│   └── ...
├── lib/                  # Utilities and services
│   ├── api/             # API client layer
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   └── utils.ts         # Utility functions
├── public/              # Static assets
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🎯 User Flow

### 1. Homepage (`/`)
- **Create Game**: Choose quiz mode and generate session
- **Join Game**: Enter 6-digit game code to participate
- **Return to Results**: Quick access to previous game results

### 2. Game Creation (`/create`)
- Select quiz theme (AI generates relevant questions)
- Choose game mode:
  - **Question-by-Question**: Host controls progression
  - **Full Game**: Players answer at their own pace
- Generate shareable game code

### 3. Join Flow (`/join/[code]`)
- Enter player name
- Validate game code
- Redirect to waiting room

### 4. Waiting Room (`/waiting/[code]`)
- Display joined players
- Show game settings
- Host can start the game

### 5. Active Game (`/game/[code]`)
- Display current question with multiple choice options
- Real-time scoring feedback
- Live leaderboard updates
- Progress indicators

### 6. Game Results (`/game-end/[code]`)
- Final leaderboard with rankings
- Performance statistics
- Options to review questions or view detailed analytics

### 7. Additional Modes
- **Review** (`/review/[code]`): Replay questions with correct answers
- **Statistics** (`/statistics/[code]`): Detailed analytics and charts

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API URL
```

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Run development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🎨 UI Components

### Core Components

#### `QuizModeSelector`
```tsx
<QuizModeSelector 
  selectedMode={selectedMode} 
  onModeChange={setSelectedMode} 
/>
```

#### `QuestionCard`
```tsx
<QuestionCard
  question={question}
  onAnswer={handleAnswer}
  disabled={answered}
  timeLimit={30}
/>
```

#### `PlayerList`
```tsx
<PlayerList
  players={players}
  currentUserId={userId}
  showScores={true}
/>
```

#### `LeaderboardChart`
```tsx
<LeaderboardChart
  scores={scores}
  currentUserId={userId}
  animated={true}
/>
```

### Chart Components

#### `AccuracyChart`
- Visual representation of answer accuracy per question
- Color-coded bars for correct/incorrect responses
- Responsive design for all screen sizes

#### `ResponseTimeChart`
- Line chart showing average response times
- Helps identify question difficulty patterns
- Smooth animations and hover effects

## 🔄 State Management

### GameService
Central service for managing game state and API interactions:

```typescript
// Create new game
const sessionId = await GameService.createNewGame()

// Join existing game
const userId = await GameService.joinGame(name, sessionId)

// Get current game state
const gameState = GameService.getCurrentGameState()

// Submit answer
const result = await GameService.submitPlayerAnswer(sessionId, userId, answer)
```

### Local Storage Persistence
```typescript
// Automatically persisted data
{
  currentGameSession: string,
  currentUserId: string,
  currentUserName: string,
  isGameHost: boolean,
  lastGameCode: string,
  gameFinished: boolean
}
```

## 🎯 API Integration

### Game API Service (`lib/api/game-api.ts`)

```typescript
export const GameAPI = {
  createSession: (theme?: string) => Promise<CreateSessionResponse>,
  addUserToSession: (data: AddUserRequest) => Promise<AddUserResponse>,
  getNextQuestion: (sessionId: string) => Promise<QuestionResponse>,
  submitAnswer: (data: AnswerRequest) => Promise<AnswerResponse>,
  getScores: (sessionId: string) => Promise<ScoreResponse>,
  advanceQuestion: (sessionId: string) => Promise<AdvanceResponse>
}
```

### Error Handling
- Automatic retry for network failures
- Graceful degradation when backend is unavailable
- User-friendly error messages
- Offline state detection

## 🎨 Theming & Styling

### Theme System
- **Light/Dark Mode**: Automatic system preference detection
- **Custom Color Palette**: Consistent brand colors throughout
- **Responsive Typography**: Scales beautifully across devices
- **Accessible Design**: WCAG compliant color contrasts

### Tailwind Configuration
```typescript
// Custom theme extensions
theme: {
  extend: {
    colors: {
      chart: {
        '1': 'hsl(var(--chart-1))',
        '2': 'hsl(var(--chart-2))',
        '3': 'hsl(var(--chart-3))',
        '4': 'hsl(var(--chart-4))',
        '5': 'hsl(var(--chart-5))',
      }
    }
  }
}
```

## 📱 Mobile Responsiveness

### Breakpoint Strategy
- **Mobile First**: Base styles for mobile devices
- **Tablet** (`md:`): Enhanced layouts for medium screens
- **Desktop** (`lg:`): Full-featured experience for large screens

### Mobile-Specific Features
- Touch-optimized button sizes
- Swipe gestures for navigation
- Optimized chart displays
- Reduced motion preferences

## 🚀 Performance Optimizations

### Next.js Features
- **App Router**: Latest Next.js routing system
- **Server Components**: Reduced client-side JavaScript
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic bundle optimization

### Custom Optimizations
- **Lazy Loading**: Charts and heavy components load on demand
- **Memoization**: Prevents unnecessary re-renders
- **Local Storage Caching**: Offline functionality and quick loading

## 🧪 Development & Testing

### Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing Considerations
- Component isolation testing
- API integration testing
- Mobile responsiveness testing
- Cross-browser compatibility

## 🔧 Customization

### Adding New Quiz Modes
1. Update `QuizModeSelector` component
2. Add mode-specific logic in game pages
3. Update backend API if needed

### Custom Themes
1. Extend Tailwind color palette
2. Update CSS custom properties
3. Add theme toggle logic

### New Chart Types
1. Install additional Recharts components
2. Create new chart component in `components/`
3. Integrate with statistics page

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```bash
# Build container
docker build -t quiz-frontend .

# Run container
docker run -p 3000:3000 quiz-frontend
```

### Static Export
```bash
# Build static files
npm run build
npm run export
```

## 🤝 Contributing

### Component Development
1. Use TypeScript for all components
2. Follow shadcn/ui patterns for consistency
3. Ensure mobile responsiveness
4. Add proper accessibility attributes

### Code Style
- Use Prettier for formatting
- Follow ESLint configuration
- Use meaningful component names
- Document complex logic with comments

## 📈 Analytics & Monitoring

### Performance Metrics
- Core Web Vitals tracking
- User interaction analytics
- Error boundary monitoring
- Load time optimization

### User Experience
- Session recording capabilities
- A/B testing framework ready
- User feedback collection
- Accessibility auditing

This frontend provides a complete, production-ready interface for the quiz game with excellent user experience, performance, and maintainability.