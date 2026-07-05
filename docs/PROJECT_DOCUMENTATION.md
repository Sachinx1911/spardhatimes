# Spardha Times — Complete Project Documentation

Master reference for the platform: technology stack, backend, frontend, business
logic, and the pre-launch verification report. Companion docs:
[TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) ·
[SECURITY_AND_ACCESS.md](SECURITY_AND_ACCESS.md) ·
[FRONTEND_SPEC.md](FRONTEND_SPEC.md)

Last verified: 2026-07-05 (white-box + black-box pass, production build clean).

---

## 1. What this product is

A mobile-first online test-series platform for competitive-exam students
(MPSC/UPSC/Banking/SSC). Admins (coaching classes) create tests, group them into
scheduled test series, and assign them to students. Students attempt tests on
mobile with a live timer and get instant results, rank, and analysis. Tests can
also be made public and shared as a link that anyone can attempt without login.

Roles: **STUDENT**, **ADMIN**, **SUPERADMIN**. No public self-signup — the admin
creates student accounts.

---

## 2. Technology stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | **Next.js 16.2.9** (App Router) | SSR + Server Components + Server Actions; `proxy.ts` middleware (Next 16 convention) |
| Frontend | **React 19**, **TypeScript 5** (strict) | |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`) | Custom UI kit, no external component library |
| Icons / Charts | **lucide-react** / **recharts** | Charts lazy-loaded |
| Backend runtime | Node.js 20+ (Next.js server) | All backend code lives in server actions + 3 API routes |
| ORM | **Prisma 6** | Client generated at build (`postinstall` + `build` scripts) |
| Database | **Neon PostgreSQL** (serverless cloud) | Connection string only in `.env` |
| Auth | **Auth.js / NextAuth v5 (beta)** | Credentials provider, JWT sessions, bcryptjs hashing, `trustHost: true` |
| Email | **Resend** via `lib/mailer.ts` | Password-reset links |
| Excel | **xlsx** | Question bulk-import + results/users export |
| PDF | Print-ready HTML routes (`window.print()`) | No server-side PDF library needed |
| PWA | `manifest.webmanifest` + `public/sw.js` | Installable, offline fallback page |
| Fonts | **Inter** via `next/font` | |
| Deploy target | Vercel (recommended) or any Node host | See §8 |

---

## 3. Backend

### 3.1 Server actions (`app/actions/`) — the API layer

| File | Responsibility |
|---|---|
| `auth.ts` | Login helpers, profile update, password change; **registration hard-disabled** |
| `quiz.ts` | Logged-in attempt submission → grading engine (§5.2) |
| `public-quiz.ts` | Guest attempt submission for public tests (no login, guestId) |
| `admin.ts` | Category/quiz/question/user CRUD, block/unblock, bulk Excel import, audit logging |
| `test-series.ts` | Series CRUD, per-series scheduled tests, student assignment, admin/student creation |
| `leaderboard.ts` | Test list + per-test ranked rows (logged-in users only) |
| `notifications.ts` | Fetch + mark-read for the navbar bell |
| `password-reset.ts` | Token issue (sha256 stored) + reset flow |

### 3.2 API routes (`app/api/`)

- `auth/[...nextauth]` — Auth.js handlers
- `certificates/[code]/pdf` — printable certificate (owner/admin session required)
- `reports/test/[quizId]/pdf` — printable leaderboard report (**admin-only, returns 401 otherwise — verified**)

### 3.3 Middleware — `proxy.ts` + `auth.config.ts`

- Gates `/dashboard/*` (any logged-in user) and `/admin/*` (ADMIN/SUPERADMIN)
- Everything else is public (includes `/test/[slug]` shareable tests)
- `DEV_BYPASS_AUTH` skips the gate in development only (must be absent in prod)

### 3.4 `lib/` utilities

`db.ts` (Prisma singleton) · `session.ts` (`getSession()` wrapper — used by every
protected page/action) · `mailer.ts` (Resend) · `releases.ts` (series release
windows + release notifications, §5.3) · `settings.ts` (key-value platform
settings with defaults) · `utils.ts` (class merge etc.)

---

## 4. Database schema (Prisma, 14 models)

| Model | Purpose |
|---|---|
| `User` | name, email, phone, passwordHash, role, `isBlocked` |
| `PasswordResetToken` | sha256 token hash, expiry, single-use |
| `Category` | subject grouping + SEO fields + icon |
| `TestSeries` | title, category, `timingMode` (RELEASE_ONLY / WINDOW), planned count |
| `TestSeriesAccess` | join: which student can access which series (+ granting admin) |
| `Quiz` | duration, marks, `negativeMarks`, passingMarks, difficulty, DRAFT/PUBLISHED, `isPublic`, series linkage + `releaseAt`/`closeAt` |
| `Question` | SINGLE_CHOICE / MULTIPLE_CHOICE / TRUE_FALSE; options A–D; `correctAnswer` ("B" or sorted "A,C"); explanation; per-question marks |
| `QuizAttempt` | **`userId` nullable** (guest attempts) + `guestId`; score, %, correct/wrong/skipped, timeTaken, rank, percentile, status |
| `QuestionResponse` | per-question answer + correctness + time; unique (attempt, question) |
| `Bookmark`, `Certificate`, `Notification`, `Setting`, `AdminLog` | supporting features |

---

## 5. Business logic (the brains)

### 5.1 Authentication & access
- Credentials login → bcrypt compare → JWT session carrying `role` + `id`
- **Blocked users cannot log in** (`if (!user || user.isBlocked) return null`)
- Public registration disabled at **two levels**: the page shows "Contact your
  institute / admin" AND `registerUser()` returns an error (defense in depth)
- Password reset: raw token only in the emailed link; DB stores sha256 hash,
  time-limited, single-use

### 5.2 Grading engine (identical rules in `quiz.ts` and `public-quiz.ts`)
1. Normalize the chosen answer: uppercase, split on commas, keep only A–D,
   **sort**, re-join — so "c,a" === "A,C" (multiple-choice must match the full
   correct set exactly; partial = wrong)
2. Score: correct → `+question.marks`; wrong → `−quiz.negativeMarks`;
   skipped → 0
3. Round score and percentage to 2 decimals
4. Pass/fail vs `quiz.passingMarks`; certificate created on pass
5. Rank = position by score among the quiz's completed attempts; percentile
   computed from rank
6. Attempt + all `QuestionResponse` rows written in **one transaction**
   (15s timeout) — no partial writes
7. Student gets a result notification

### 5.3 Test lifecycle & series scheduling
- Quiz status: `DRAFT` (hidden) → `PUBLISHED`
- Inside a series each test derives an availability state from `releaseAt` /
  `closeAt` (`lib/releases.ts`): **UPCOMING** (before release) → **OPEN** →
  **CLOSED** (only in WINDOW mode after `closeAt`)
- On release, students with series access get a "test is live" notification
  (`releaseNotified` flag prevents duplicates)
- Students only see series granted via `TestSeriesAccess`

### 5.4 Public / free tests
- Admin toggles `isPublic` on a quiz → shareable `/test/[slug]` link
- No login, no student details; a random `guestId` is stored in the browser's
  localStorage and saved on the attempt (`userId = null`)
- In-page result after submit; guest attempts are **excluded from leaderboards**
  and display as "Guest" in admin Results

### 5.5 Client-side quiz engine (`QuizEngine` / `PublicQuizEngine`)
- Countdown timer with **auto-submit at 0**
- Answers auto-saved to localStorage — refresh restores progress
- Question sheet grid (answered/unanswered) for jumping between questions
- Q.1/Q.2 numbering; single-choice radios, multiple-choice checkboxes,
  true/false pair; confirm modal before submit (answered/remaining counts)

### 5.6 Admin operations
- Full CRUD for categories (with icon upload), quizzes, per-quiz questions,
  users, series
- **Excel import** of questions (all three types) via `xlsx`
- Results table with search/filter + **Excel export**; user directory export
- Test-wise **leaderboard** (top-3 medals, colored % badges) + printable PDF
- **Audit log** (`AdminLog`) records admin actions with details; viewer at
  `/admin/logs`
- Platform `Setting`s with real effects; admin dashboard with live stats +
  trend charts

---

## 6. Frontend

- **Design style:** Hybrid Minimalism (flat + minimal), Bento-grid dashboard,
  subtle glassmorphism navbar; full light/dark mode (persisted toggle)
- **Palette:** primary blue `#2563eb` (dark: `#3b82f6`), slate neutrals,
  success `#10b981`, danger `#ef4444` — all as CSS variables (see
  [FRONTEND_SPEC.md](FRONTEND_SPEC.md) for the full table)
- **Font:** Inter
- **Components:** custom `components/ui/` kit (Button, Card, Input, Select,
  Dialog, Tabs) + feature components under `components/admin/`,
  `components/quiz/`, `components/dashboard/`, `components/shared/`
- **Mobile-first:** every screen designed for phones (~90% of students);
  tables scroll horizontally on small screens
- PWA installable; SEO: per-page metadata, `robots.ts`, `sitemap.ts`

---

## 7. Verification report (pre-launch, 2026-07-05)

### White-box (code-level)
| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ clean |
| `npm run build` (production) | ✅ all routes compile; proxy middleware active |
| Grading logic review | ✅ normalization, negative marking, rounding, transaction |
| Blocked-user guard | ✅ login rejected |
| Registration guard | ✅ blocked at UI + server action |
| Series release logic | ✅ UPCOMING/OPEN/CLOSED derivation |

### Black-box (from outside, no code knowledge)
| Check | Result |
|---|---|
| Public pages (`/`, `/login`, `/quizzes`, `/test/test-2`) unauthenticated | ✅ 200 |
| `/dashboard`, `/admin/*` unauthenticated | ✅ 307 → `/login?callbackUrl=…` |
| Admin-only PDF report API unauthenticated | ✅ 401 |
| Admin login → all 10 admin pages + student pages | ✅ 200, no errors |
| **Full public test E2E** (start → answer 10 → confirm modal → submit) | ✅ graded 2/10, 20% — verified in Neon DB (guestId, score, correct/wrong) |
| Admin Results with guest attempts | ✅ renders "Guest" rows (crash fixed in `fa22ed8`) |
| Leaderboard PDF (admin) | ✅ 200, valid printable HTML |

### Bug found & fixed during testing
- **Admin Results crashed** (`Cannot read properties of null (reading 'name')`)
  as soon as any guest/public attempt existed — `ResultManager` assumed
  `attempt.user` was never null. Fixed with null-guards ("Guest"/"—") in commit
  `fa22ed8`; all other attempt readers (dashboard, leaderboard, result page,
  certificate) were already guarded.

---

## 8. Environment & deployment

`.env` (never committed): `DATABASE_URL` (Neon), `AUTH_SECRET`,
`NEXTAUTH_URL` (**live https domain in prod**), `RESEND_API_KEY`, `EMAIL_FROM`.
Do **not** set `DEV_BYPASS_AUTH` in production.

Recommended host: **Vercel** (free tier, GitHub auto-deploy). Build is already
prod-ready: `build = prisma generate && next build`, `postinstall = prisma generate`.

Pre-go-live checklist (details in [SECURITY_AND_ACCESS.md](SECURITY_AND_ACCESS.md)):
1. Set the 5 env vars on the host; `NEXTAUTH_URL` = live https URL
2. **Change seeded passwords** (`Admin@123` / `Student@123` are public in `prisma/seed.ts`)
3. Verify a sender domain at Resend (until then reset emails reach only the owner)
4. Smoke test on the live URL: login, create test, attempt, result, public link

### Known caveats (accepted for launch)
- No rate limiting on login/API (add later if abuse appears)
- Public tests allow repeat attempts from the same browser (new guestId after
  clearing storage) — by design for free tests
- Category icon upload writes to local `public/uploads/` — on Vercel use an
  object store later if icons are needed in prod
