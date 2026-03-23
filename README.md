# 🌟 OmniLife — Full-Stack Monorepo

A production-ready monorepo combining **calendar/task management**, **diet tracking**, and **personal finance** — with a gamified daily scoring system.

---

## 📸 App Screens

| Dashboard | Calendar | Diet | Finance |
|-----------|----------|------|---------|
| Active focus, nutrition ring, finance capital, upcoming agenda | Month grid, event dots, agenda list | Daily fuel ring, macros, meal log | Balance card, top spending, savings goals, activity |

---

## 🏗️ Monorepo Structure

```
omni-life/
├── apps/
│   ├── mobile/          # Expo React Native (TypeScript + NativeWind)
│   └── api/             # NestJS backend (Clean Architecture)
├── packages/
│   └── shared/          # Shared types, enums, utilities
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## 📱 Mobile App (`apps/mobile`)

Built with **Expo SDK 52**, **TypeScript**, **NativeWind v4** (Tailwind CSS), and **Expo Router v4**.

### Tech Stack
| Concern | Library |
|---------|---------|
| Navigation | Expo Router (file-based) |
| Styling | NativeWind v4 + StyleSheet |
| State | Zustand |
| API | Axios + SecureStore token handling |
| Icons | @expo/vector-icons (Ionicons) |
| Charts | react-native-svg |

### Screens
- **Auth**: Sign In / Sign Up / Social Login (Google, Apple)
- **Dashboard**: Active focus card, nutrition donut ring, finance capital, upcoming agenda
- **Calendar**: Month grid with event dots, current event (NOW badge), focus balance, color-coded agenda
- **Diet**: Daily calorie ring, macro bars (protein/carbs/fat), meal cards by type
- **Finance**: Total balance, top spending categories, savings goals, recent activity
- **Profile**: User stats, settings menu, sign out

---

## 🧠 Backend API (`apps/api`)

Built with **NestJS**, following **Clean Architecture** principles.

### Architecture Layers
```
src/
├── domain/            # Entities & business rules
├── application/       # Use-case services
│   └── use-cases/
│       ├── auth/
│       ├── users/
│       ├── tasks/
│       ├── meals/
│       ├── transactions/
│       └── scoring/
├── infrastructure/    # Prisma, JWT strategy
│   ├── auth/
│   └── database/
└── presentation/      # Controllers, DTOs, Modules
    └── modules/
```

### API Modules
| Module | Endpoints |
|--------|-----------|
| Auth | POST /register, /login, /refresh, /social, /logout |
| Users | GET/PUT /users/me, POST /change-password, DELETE |
| Tasks | CRUD + PATCH /:id/complete + GET /stats |
| Meals | CRUD + GET /nutrition |
| Transactions | CRUD + GET /summary |
| Scoring | GET /today, /weekly, /history, /leaderboard |

### 🔐 Authentication
- **JWT Access Token** (15min expiry)
- **Refresh Token** (7 days, hashed in DB, rotated on use)
- **Social Login** structure (Google/Apple)
- Global `JwtAuthGuard` + `@Public()` decorator for open endpoints

### 🎯 Scoring System (Gamification)
- Users earn **10 pts** per task completed (+ 5 bonus for HIGH priority)
- `PATCH /tasks/:id/complete` → triggers scoring update atomically
- Daily score tracked in `scores` table (upsert by userId + date)
- Weekly summary + leaderboard endpoints

---

## 🗄️ Database Schema (Prisma + PostgreSQL)

```
User ──┬── Task
       ├── Meal
       ├── Transaction
       ├── Score          (userId + date unique)
       └── RefreshToken
```

---

## 🐳 Running with Docker

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start all services
docker-compose up

# API running at: http://localhost:3000/api/v1
# Swagger docs:   http://localhost:3000/api/docs
```

---

## 💻 Running Locally (without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm 10+

### Setup

```bash
# 1. Install all dependencies (from root)
npm install

# 2. Configure environment
cp .env.example apps/api/.env
# Edit apps/api/.env with your DATABASE_URL and JWT secrets

# 3. Run database migrations
npm run db:migrate

# 4. Seed demo data
npm run db:seed

# 5. Start API
cd apps/api && npm run dev
# → http://localhost:3000/api/v1

# 6. Start mobile app (new terminal)
cd apps/mobile && npm run dev
# → Press 'i' for iOS, 'a' for Android, 'w' for web
```

---

## ⚙️ Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `JWT_EXPIRY` | Access token expiry (default: 15m) |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry (default: 7d) |
| `PORT` | API port (default: 3000) |

---

## 🔄 Full Feature Flow: Task Creation → Completion → Scoring

```
1. POST /api/v1/tasks
   Body: { title, priority: "HIGH", dueDate }
   → Creates Task (status: PENDING, points: 15)

2. PATCH /api/v1/tasks/:id/complete
   → Sets status = COMPLETED, completedAt = now()
   → Calls ScoringService.addPoints(userId, 15, 1)
   → Upserts Score(today) += 15 pts, tasksCompleted += 1

3. GET /api/v1/scoring/today
   → { points: 15, tasksCompleted: 1, date: "..." }

4. GET /api/v1/scoring/weekly
   → { totalPoints, totalTasksCompleted, dailyScores[] }
```

---

## 📦 Shared Package (`packages/shared`)

```typescript
// Enums
TaskStatus, TaskPriority, MealType, TransactionType, TransactionCategory, SocialProvider

// Interfaces
IUser, ITask, IMeal, ITransaction, IScore, IAuthTokens, IApiResponse, IPaginatedResponse

// Utils
formatCurrency, formatDate, isToday, getStartOfDay, getStartOfWeek
```

---

## 🛠️ Development Commands

```bash
# From repo root (Turborepo)
npm run dev          # Start all apps in dev mode
npm run build        # Build all packages and apps
npm run lint         # Lint all packages
npm run test         # Run all tests

# Database (API only)
npm run db:migrate   # Apply migrations
npm run db:seed      # Seed demo data
npm run db:generate  # Regenerate Prisma client
```
