# FocusGrid - Productivity & Focus Management App

A full-stack web application designed to help users maintain focus consistency, track study sessions, and achieve daily productivity goals through gamification and real-time analytics.

## 📋 Project Overview

FocusGrid combines dual-timer modes (Flow & Pomodoro), session tracking, and a gamified streak system to help users stay consistent with their focus goals. Features include real-time progress updates, daily carry-over targets, detailed analytics, and a GitHub-style activity heatmap.

## 🛠️ Tech Stack

**Frontend:**
- React 19.2.4
- Next.js 16.2.3 (App Router)
- TypeScript
- Tailwind CSS 4
- Framer Motion (animations)
- Recharts (visualizations)
- Zustand (state management)
- shadcn/ui (components)

**Backend:**
- Next.js Server Actions
- Prisma ORM 5.22.0
- SQLite
- NextAuth.js v5 (authentication)
- bcryptjs (password hashing)
- Nodemailer (emails)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/nitincoder06/FocusGrid.git
cd FocusGrid
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

4. **Initialize database:**
```bash
npx prisma migrate dev
```

5. **Run the development server:**
```bash
npm run dev
```

6. **Open in browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Key Features

- **Dual Timer Modes** - Flow (continuous) and Pomodoro (25min focus + 5min break)
- **Session Tracking** - Track focus sessions with pause reasons and duration
- **Daily Goals** - Set minimum daily focus time with carry-over to next day
- **Streak System** - Build consistency streaks with freeze capability
- **Analytics Dashboard** - Real-time progress, heatmap, and pause analysis
- **Background Persistence** - Timer continues running when app is minimized
- **Authentication** - Email/password registration and NextAuth integration

## 📊 Database Schema

Core models: User, FocusSession, PauseLog, DailyFocusTracking, Subject, Task, StreakFreeze

## 🔧 Build & Deploy

**Build for production:**
```bash
npm run build
npm start
```

## 📝 License

This project is open source and available for educational purposes.
