# Tech Stack — ठरलेले निर्णय

> तयार: 2026-07-29. हा दस्तऐवज दिलेल्या stack spec आणि प्रत्यक्ष project यांची
> जुळवणी आहे. `docs/PAID_TEST_SERIES_PLAN.md` अजूनही payment साठी अधिकृत आहे.

## रचना (monorepo)

```
apps/
  admin/      Next.js 16.2.9 — admin panel + /checkout (Razorpay)
  mobile/     Expo SDK 57 (RN 0.86) — विद्यार्थ्यांचं app
backend/      NestJS 11 — REST API (@mahatest/api)
packages/
  core/       framework-निरपेक्ष business logic (@mahatest/core)
  db/         Prisma schema + client (@mahatest/db)
```

npm workspaces. Root वरून: `npm test`, `npm run dev:admin`, `npm run dev:mobile`,
`npm run dev:api`, `npm run db:push`.

## ठरलेले निर्णय

| विषय | निर्णय |
|---|---|
| Backend | **NestJS** मध्ये नवीन API (spec प्रमाणे) |
| Student app | React Native + Expo |
| Admin | Next.js **16.2.9** — spec मधलं "Next.js 15" चुकीचं होतं, तो downgrade ठरला असता |
| Login | **Mobile + Password, OTP नाही** — SMS खर्च टाळण्यासाठी |
| Payment | **फक्त per-series एकदाच खरेदी** — subscription / wallet / coupon / gift card वगळले |
| Styling | tokens + StyleSheet, **NativeWind नाही** (खाली कारण) |

## spec मधून बदललेलं (आणि का)

| Spec | प्रत्यक्षात | कारण |
|---|---|---|
| Next.js 15 | Next.js 16.2.9 | project आधीच 16 वर आहे; 15 वर जाणं downgrade |
| Firebase OTP + MSG91 | दोन्ही नाही | OTP च ठेवला नाही; दोन SMS vendor निरर्थक |
| NativeWind | tokens + StyleSheet | v4 चा Expo 57 / RN 0.86 support कुठेही confirmed नाही, v5 pre-release |
| Subscription + Wallet + Coupon + Gift Card | फक्त per-series | मंजूर payment plan; entitlement model सोपा राहतो |
| LiveKit + Zoom SDK | नंतर ठरवायचं, एकच | दोन्ही एकच काम करतात; Zoom SDK ला paid license |
| OpenAI + Claude + Gemini | एकाने सुरू करायचं | तीन vendor = तीन billing + rate limits |
| Website: Landing/Blog/Pricing/Student Dashboard | फक्त `/admin` + `/checkout` | student अनुभव app मध्येच |

## `packages/core` चा नियम

इथलं **काहीही** Prisma, NestJS, Next.js किंवा React वर अवलंबून नाही. म्हणून admin आणि
NestJS API दोघेही तेच वापरतात आणि tests ला database लागत नाही.

आज त्यात: `grading.ts`, `entitlements.ts`, `quiz-access.ts`, `question-import.ts` —
**64 tests**, monorepo हलवणीनंतरही हिरवे.

नवीन file टाकताना तपासा: तिला काही `import` लागतं का? लागत असेल तर ती इथे नाही.

## `.env`

एकच file, repo च्या मुळाशी. `apps/admin/.env` हा तिचा symlink आहे — Next.js फक्त
स्वतःच्या folder मधून `.env` वाचतो, वरचे folders बघत नाही. `backend/` ला पण असाच
symlink लागेल.

`packages/db/prisma.config.ts` आधी root चा `.env` शोधतो, मग स्थानिक.

## ⚠️ Vercel

Admin आता `apps/admin` मध्ये आहे. **Vercel project च्या Settings मध्ये Root Directory
`apps/admin` करावी लागेल**, नाहीतर पुढचा deploy अयशस्वी होईल.

## पुढचा क्रम

1. NestJS API चा गाभा — auth (mobile+password, JWT + refresh token), quiz, series
2. Mobile app चे 6 core screens (dummy data) → मग API जोडणी
3. Paid series Stage 2-6 (`docs/PAID_TEST_SERIES_PLAN.md`)
4. `Question.subject` — याशिवाय Result/Analytics चे subject-wise screens बनतच नाहीत
5. Admin मधून student-facing routes काढणे
