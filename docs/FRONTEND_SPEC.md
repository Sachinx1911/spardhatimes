# Frontend Specification — Spardha Times

_Design style: **Hybrid Minimalism** (flat + minimal), Bento-grid admin dashboard, subtle glassmorphism navbar. Mobile-first and fully responsive; full light + dark mode._

---

## 1. Typography

- **Font:** Inter (Google Font, loaded via `next/font`, CSS var `--font-inter`). Used everywhere.
- **Weights:** regular for body, bold/black for headings and stat numbers.
- Sentence case throughout; uppercase only for small section labels (letter-spaced).

## 2. Color palette

CSS variables in `app/globals.css`, auto-switching between light and dark.

| Role | Light | Dark |
|---|---|---|
| Primary (blue accent) | `#2563eb` | `#3b82f6` |
| Background | `#f8fafc` | `#0b0f19` |
| Foreground (text) | `#0f172a` | `#f8fafc` |
| Secondary | `#0f172a` | `#1e293b` |
| Muted / border / input | `#e2e8f0` | `#1e293b` |
| Muted text | `#64748b` | `#94a3b8` |
| Success (green) | `#10b981` | `#34d399` |
| Danger (red) | `#ef4444` | `#f87171` |
| Focus ring | `#3b82f6` | `#60a5fa` |

Percentage badges (results/leaderboard): green ≥60%, amber 35–59%, red <35%.

## 3. Components

**UI primitives** (`components/ui/`): `Button`, `Card` (+ CardHeader/Title/Content/Description), `Input`, `Select`, `Dialog`, `Tabs`. These are the most-reused nodes in the codebase (Card, Button appear in nearly every screen).

**Shared** (`components/shared/`): `Navbar` (frosted/glass), `Footer`, `NotificationBell`, `ThemeContext` (dark-mode toggle, persisted), `Providers`, `CategoryIcon`, `ChartBox`.

**Feature components:**
- `quiz/QuizEngine` — logged-in test engine (question number "Q.1", options, timer, progress, question-sheet grid, auto-save). `quiz/PublicQuizEngine` — same UI for public/no-login tests with in-page result. `quiz/ResultAnalytics` — result charts.
- `admin/*` — QuizManager, QuestionManager, CategoryManager, UserManager, ResultManager, SeriesManager/SeriesDetail, SettingsManager, QuestionImporter, AdminCharts.
- `dashboard/*` — MyTestSeries, PerformanceCharts, SettingsForm.

**Layout:** admin uses a sidebar shell (`app/admin/layout.tsx`); stat cards are laid out in a responsive Bento-style grid. Heavy libraries (recharts) are lazy-loaded (`*Lazy.tsx`) for mobile performance.

## 4. API integration

There is **no separate REST API** — the frontend talks to the backend through **Next.js Server Actions** (`app/actions/*.ts`), called directly from components. Two exceptions are PDF routes.

| Feature | Called action / route |
|---|---|
| Login / session | Auth.js (`signIn`) + `getSession()` |
| Profile / password | `auth.ts` → `updateProfile`, `changePassword` |
| Password reset | `password-reset.ts` → `requestPasswordReset`, `resetPassword` |
| Take test (logged in) | `quiz.ts` → `submitQuizAttempt` |
| Take public test | `public-quiz.ts` → `submitPublicQuizAttempt` |
| Admin: tests/questions/categories/users/settings | `admin.ts` (16 actions, all admin-gated) |
| Admin: series + students | `test-series.ts` |
| Admin: leaderboard data | `leaderboard.ts` → `getQuizList`, `getTestLeaderboard` |
| Notifications | `notifications.ts` |
| Certificate PDF | `GET /api/certificates/[code]/pdf` |
| Leaderboard report PDF | `GET /api/reports/test/[quizId]/pdf` |

**Data flow:** Server Components fetch directly from Prisma for initial render; interactive mutations call server actions which return `{ success }` or `{ error }`; the client updates or reloads. PDFs are generated as styled printable HTML that triggers the browser print dialog (no server-side PDF library).

## 5. Responsiveness & accessibility notes

- Mobile-first: every screen designed for phone first (tables scroll horizontally, sidebar collapses).
- Dark mode is a first-class toggle, persisted via ThemeContext.
- PWA manifest present (`public/manifest.webmanifest`) with app icons; offline fallback page + service worker.
