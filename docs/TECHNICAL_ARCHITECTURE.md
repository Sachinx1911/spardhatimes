# Technical Architecture — Spardha Times

_Online test-series / mock-exam platform for competitive-exam students. Mobile-first (~90% of students attempt on phone)._

---

## 1. Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, Server Components, Server Actions) |
| Language | **TypeScript** (strict) |
| UI | **React 19** + **Tailwind CSS v4** + custom components |
| Icons / Charts | `lucide-react` · `recharts` |
| Auth | **Auth.js / NextAuth v5** (Credentials provider, JWT sessions) |
| ORM | **Prisma 6** |
| Database | **PostgreSQL** (Neon serverless) |
| Password hashing | `bcryptjs` |
| Email | **Resend** (password-reset links) |
| Excel import/export | `xlsx` |
| Middleware | `proxy.ts` (Next.js 16 renamed `middleware` → `proxy`) |

Build: `prisma generate && next build` · `postinstall: prisma generate`

---

## 2. Folder structure

```
app/
  page.tsx                     Home
  login/  register/            Auth pages (register = disabled notice)
  forgot-password/  reset-password/[token]/   Password reset
  quizzes/  categories/  leaderboard/  faq/  terms/  privacy/   Public pages
  dashboard/                   Student dashboard (login required)
  quiz/[slug]/attempt/         Test engine (login required)
  quiz/result/[attemptId]/     Result + answer review
  test/[slug]/                 PUBLIC free test (no login)
  admin/                       Admin panel (role-gated)
    dashboard/ categories/ series/ series/[seriesId]/ quizzes/
    quizzes/[quizId]/questions/ users/ results/ leaderboard/
    questions/import/ logs/ settings/  layout.tsx
  api/
    auth/[...nextauth]/        NextAuth handler
    certificates/[code]/pdf/   Certificate PDF (printable HTML)
    reports/test/[quizId]/pdf/ Leaderboard report PDF
  actions/                     Server actions (the "backend")
    admin.ts auth.ts quiz.ts public-quiz.ts test-series.ts
    leaderboard.ts notifications.ts password-reset.ts
components/
  ui/         Button, Card, Input, Select, Dialog, Tabs
  shared/     Navbar, Footer, NotificationBell, ThemeContext, Providers, CategoryIcon, ChartBox
  admin/      QuizManager, QuestionManager, CategoryManager, UserManager, ResultManager,
              SeriesManager, SeriesDetail, SettingsManager, QuestionImporter, AdminCharts(+Lazy)
  dashboard/  MyTestSeries, PerformanceCharts(+Lazy), SettingsForm
  quiz/       QuizEngine, PublicQuizEngine, ResultAnalytics(+Lazy)
lib/          db.ts (Prisma client) · session.ts (getSession) · settings.ts · mailer.ts · releases.ts · utils.ts
prisma/       schema.prisma · seed.ts
auth.ts · auth.config.ts · proxy.ts    Auth + route gating
```

**Where the logic lives:** business logic runs in `app/actions/*.ts` (server actions) and the two PDF API routes. There is no separate REST API — the frontend calls server actions directly.

---

## 3. Database schema (Prisma / PostgreSQL)

Core models and their role:

| Model | Purpose | Key fields |
|---|---|---|
| **User** | admins + students | `email` (unique), `passwordHash`, `role` (STUDENT/ADMIN/SUPERADMIN), `isBlocked`, `phone?` |
| **PasswordResetToken** | reset flow | `tokenHash` (sha256, unique), `expiresAt`, `usedAt?` |
| **Category** | test grouping | `name`, `slug`, `icon?`, counters, SEO meta |
| **TestSeries** | admin-managed series of tests | `title`, `slug`, `categoryId`, `timingMode` (RELEASE_ONLY/WINDOW), `plannedTotalTests`, `published` |
| **TestSeriesAccess** | which student can access which series | unique `(userId, testSeriesId)`, `assignedById?` |
| **Quiz** (a test) | one test | `title`, `slug`, `duration`, `marks`, `negativeMarks`, `passingMarks`, `difficulty`, `status` (DRAFT/PUBLISHED), `isPublic`, `testSeriesId?`, `releaseAt?`, `closeAt?` |
| **Question** | one question | `type` (SINGLE_CHOICE/MULTIPLE_CHOICE/TRUE_FALSE), `optionA-D`, `correctAnswer` ("A".."D" or sorted list "A,C"), `marks`, `explanation?` |
| **QuizAttempt** | one attempt | `userId?` (nullable for guests), `guestId?`, `quizId`, `score`, `percentage`, `correct/wrong/skipped`, `timeTaken`, `status` (IN_PROGRESS/COMPLETED) |
| **QuestionResponse** | per-question answer | unique `(attemptId, questionId)`, `chosenOption?`, `isCorrect`, `timeSpent` |
| **Bookmark · Certificate · Notification · Setting · AdminLog** | supporting | AdminLog = audit trail of every admin action |

**Relationships:** Category → TestSeries → Quiz → Question; Quiz → QuizAttempt → QuestionResponse; User ↔ TestSeriesAccess ↔ TestSeries.

**Grading rule:** correct → +question marks; wrong → −quiz.negativeMarks; skipped → 0. Multiple-choice must match the full correct set exactly.

---

## 4. Environment configuration

`.env` is **gitignored** — never committed. Set these on the host (e.g. Vercel → Settings → Environment Variables):

| Var | Purpose | Production value |
|---|---|---|
| `DATABASE_URL` | Neon Postgres connection string | the Neon URL |
| `AUTH_SECRET` | Auth.js JWT signing secret | **strong** value (`openssl rand -base64 32`) — do NOT use the example placeholder |
| `NEXTAUTH_URL` | canonical app URL | the **live https domain** (not localhost) |
| `RESEND_API_KEY` | password-reset email | Resend key |
| `EMAIL_FROM` | sender address | address on a verified domain |
| `DEV_BYPASS_AUTH` / `NEXT_PUBLIC_DEV_BYPASS_AUTH` | dev-only login bypass | **absent / false** in prod (only honored when `NODE_ENV !== production`) |
| `R2_*` | optional Cloudflare R2 upload | optional — falls back to local/base64 storage |

**Verified this review:** TypeScript compiles clean (`tsc --noEmit`), and a production build (`npm run build`) succeeds with all routes compiling.
