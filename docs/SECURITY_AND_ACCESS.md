# Security & Access — Spardha Times

_Reviewed and black-box tested on the running app. Findings below are verified against the code and live behavior._

---

## 1. Authentication

- **Method:** Auth.js Credentials provider (`auth.ts`). Email + password.
- **Password storage:** `bcryptjs` hashes (never plaintext). Verified with `bcrypt.compare`.
- **Sessions:** JWT (stateless). Role + user id are embedded in the token (`jwt`/`session` callbacks in `auth.config.ts`).
- **Login checks:** a blocked user (`isBlocked: true`) is rejected at login; wrong password returns null (no user enumeration difference in the UI).
- **`trustHost: true`** is set — required behind a reverse proxy / custom domain, prevents the generic "server configuration" error in production.

## 2. Roles

| Role | Can do |
|---|---|
| **STUDENT** | Take assigned tests, view own results/analytics, edit own profile |
| **ADMIN** | Full admin panel — manage categories, series, tests, questions, users, results, settings |
| **SUPERADMIN** | Same as ADMIN (highest tier) |

No public self-registration — `registerUser()` and `/register` are permanently disabled; accounts are created by an admin.

## 3. Access control / permissions

Two enforcement layers:

**A. Route gating (`proxy.ts` + `auth.config.ts` `authorized` callback):**
- `/admin/*` → requires login **and** role ADMIN/SUPERADMIN, else redirect.
- `/dashboard/*` → requires login, else redirect.
- Everything else (home, `/login`, `/leaderboard`, `/test/[slug]`, legal pages) → public.

**B. Server-action authorization (defense in depth):**
- `admin.ts` — every one of the 16 admin actions calls `ensureAdmin()`, which **throws** for non-admins. (createCategory/Quiz/Question, deleteUser, toggleBlockUser, resetUserPassword, updateSettings, bulkImportQuestions, etc.)
- `test-series.ts` — same `ensureAdmin()` gate on all series/student-management actions.
- `leaderboard.ts` — admin-only data actions return empty for non-admins.
- `quiz.ts` — `submitQuizAttempt` requires a session.
- `public-quiz.ts` — intentionally ungated (public free tests), but only serves quizzes with `isPublic = true`.

**Black-box test results (logged out):** `/admin/dashboard`, `/admin/users`, `/dashboard` → all redirect ✓. `/login`, `/leaderboard`, `/test/[slug]` → 200 ✓. Admin login → lands on `/admin/dashboard` and renders ✓.

## 4. Password reset (verified)

`password-reset.ts`:
- Raw token = `crypto.randomBytes(32)`, only ever sent in the emailed link.
- Stored as **sha256 hash** (`tokenHash`), never the raw token.
- Expires (`TOKEN_TTL_MINUTES`), single-use (`usedAt`), and rejects tokens for blocked users.
- Old unused tokens for a user are invalidated when a new one is requested.

## 5. Other protections

- **SQL injection:** not possible — all DB access is via Prisma parameterized queries.
- **Secrets:** `.env` is gitignored; no secrets in the repo.
- **Dev auth bypass:** only active when `NODE_ENV !== production` — safe in prod.
- **Audit trail:** every admin action is logged to `AdminLog` (`logAdminAction`), viewable at `/admin/logs`.
- **CSRF:** handled by Auth.js + Next.js server-action framing.

## 6. Error handling & edge cases

- Server actions wrap logic in try/catch and return `{ error }` objects rather than crashing; the UI shows the message.
- Blocked user: cannot log in; existing JWT still works until expiry (see gap #4 below).
- Guest/public attempts: `userId` nullable, tracked by `guestId` (localStorage); excluded from the ranked leaderboard.
- Quiz submit: auto-saves answers to localStorage; auto-submits at timer zero; grading is idempotent per attempt.

---

## 7. Go-live security checklist (action items — config, not code bugs)

- [ ] **Set a strong `AUTH_SECRET`** in production (the `.env.example` placeholder is weak — never ship it).
- [ ] **Set `NEXTAUTH_URL`** to the live https domain.
- [ ] **Do not set `DEV_BYPASS_AUTH`** in production (absent/false).
- [ ] **Change the seeded passwords** — `Admin@123` / `Student@123` are public in `prisma/seed.ts`. Change immediately after seeding production.
- [ ] **Verify a Resend domain** so password-reset emails reach all users (currently limited to the account owner until a domain is verified).
- [ ] **Enable HTTPS/SSL** on the domain (login cookies require it in production).

### Recommended hardening (gaps, not blockers)
1. **Rate limiting** — there is currently **no rate limiting** on `/login` or password-reset. Add throttling (e.g. per-IP) to resist brute-force / email-spam before or soon after launch.
2. **Blocked-user session revocation** — blocking a user prevents new logins but their existing JWT stays valid until it expires. If instant lockout matters, shorten session lifetime or add a server-side check.
3. **Decide the production admin email** — seed now uses `admin@spardhatimes.com`; the current Supabase data still has an older `admin@quizplatform.com`. Align before launch.
