# Development Plan — कोणतं आधी, कोणतं नंतर

> तयार: 2026-07-29. Stack चे निर्णय `docs/TECH_STACK.md` मध्ये.
> Payment चा तपशील `docs/PAID_TEST_SERIES_PLAN.md` मध्ये.

## न बदलणारे नियम

1. **विद्यार्थी = फक्त mobile app.** Website वर student साठी काहीही नाही.
2. **Website = फक्त admin** + एक `/checkout` public route (Razorpay साठी).
3. Payment = **per-series एकदाच**, subscription/wallet नाही.
4. Login = **mobile + password**, OTP नाही.
5. AI features = **v1 मध्ये नाहीत.** सगळं संपल्यावर आठवण करायची — करायचं की नाही ते
   तेव्हा ठरेल.

---

## v1 मध्ये काय (ठरलं: गाभा + Content)

| Backend module | App screen | स्थिती |
|---|---|---|
| Auth | Login | नवीन (mobile+password) |
| Student/Profile | Profile, Settings | अर्धवट आहे |
| Category | (filter chips) | ✅ आहे |
| Test Series | My Test Series, Store | ✅ आहे |
| Quiz / Question Bank | — | ✅ आहे |
| Attempt + Grading | Test attempt | ✅ logic आहे (`@mahatest/core`) |
| Entitlement | (अदृश्य) | ✅ **पूर्ण, 64 tests** |
| Result / Analytics | Result, Analytics | अर्धवट |
| Payment + Order | Store → Buy | नवीन |
| Notification | Notifications | model आहे, app नाही |
| Current Affairs | Current Affairs | **पूर्ण नवीन** |
| Study material (Notes/PYQ) | Learn | **पूर्ण नवीन** |
| Bookmark | Bookmarks | model आहे (फक्त प्रश्नांसाठी) |
| Search | (Home वरचा search) | नवीन |
| Home aggregate | Home | नवीन |

## v1 मध्ये **नाही** (नंतरच्या टप्प्यात)

Live Classes · Mentorship · Wallet/Coupon/Gift Card · Subscription plans ·
Badges/XP/Streak · Referral · Videos · Books · Vocabulary · Short News ·
Flash Cards · Downloads · Leaderboard (app मध्ये) · **सर्व AI features**

---

## क्रम — आणि प्रत्येक टप्पा त्या जागी का

> **सुरुवात कुठून:** ठरलं — **आधी app चे 6 core screens dummy data ने**
> (Login, Home, My Test Series, Test attempt, Result, Profile), मग टप्पा A पासून
> backend. माझी शिफारस backend-आधी होती; UI-आधी निवडलं गेलं म्हणून प्रत्येक screen
> नंतर एकदा उघडून API जोडावी लागेल — तेवढं दुहेरी काम गृहीत धरलं आहे. बदल्यात design
> लवकर पक्का होतो आणि mockup शी तुलना करता येते.
>
> म्हणून dummy data **एकाच ठिकाणी** ठेवायचा (`apps/mobile/src/data/`), प्रत्येक
> screen मध्ये विखरून नाही — म्हणजे API आल्यावर एकच जागा बदलावी लागेल.
>
> **Login screen सर्वात शेवटी.** आधी बांधला आणि auth gate लावला तर पुढच्या प्रत्येक
> screen ची चाचणी घेताना दर वेळी login करावा लागेल. तोपर्यंत app थेट `(tabs)` उघडतो,
> gate नाही — तो टप्पा A मध्ये Auth बांधताना लागेल.

### टप्पा A · पाया
> काहीही दिसणार नाही, पण याशिवाय पुढचं काहीच test करता येत नाही.

1. NestJS सांगाडा — config, global error handling, validation pipe, Swagger
2. `User.phone` → **unique + required** (schema migration)
3. Auth module — mobile+password → **JWT + refresh token**
4. Mobile app — API client, token साठवण (`expo-secure-store`), auth state (Zustand)
5. Login screen (mockup प्रमाणे)

**का आधी:** प्रत्येक पुढची screen logged-in विद्यार्थ्यासाठी आहे. Auth शिवाय कुठलीही
API खरी तपासताच येत नाही.

### टप्पा B · Test सोडवण्याचा प्रवाह — **platform चा आत्मा**

6. **`Question` ला `subject`/`topic` field** ⚠️ *हे इथेच, आत्ताच*
7. Series + Quiz + Question read APIs — entitlement सह
8. App: My Test Series screen
9. App: Test attempt screen — question palette, mark-for-review, timer
10. Attempt submit API — `@mahatest/core` चा `gradeAttempt` + `evaluateAttemptAccess`
11. App: Result screen — subject-wise, time analysis

**का इथे:** हे नसेल तर विकायला काहीच नाही. आणि हा प्रवाह website वर आधीच चालतो,
म्हणून logic सिद्ध आहे — फक्त API + app UI बांधायचं.

> ⚠️ **`Question.subject` उशिरा केलं तर काय होतं:** Result चं "Section/Subject Wise
> Performance" आणि Analytics चं "Subject Wise" — दोन्ही बनूच शकत नाहीत. आणि नंतर
> केलं तर तोपर्यंत भरलेल्या **सगळ्या प्रश्नांना हाताने subject द्यावा लागेल.**
> आज 5 quizzes आहेत — आत्ता स्वस्त, नंतर महाग.

### टप्पा C · पैसे
12. Schema: `TestSeries.priceInPaise` + `mrpInPaise` + `validityMonths`,
    `TestSeriesAccess.expiresAt`, नवीन `Order` model.
    **आणि `entitlements.ts` मध्ये `EXPIRED` reason** — तपशील
    `docs/PAID_TEST_SERIES_PLAN.md` मध्ये.
13. Admin: price field + नवीन `/admin/orders` page
14. `lib/payments.ts` + Razorpay order API — 🔑 **इथे Razorpay account लागेल**
15. Razorpay **webhook** — हाच पैशाचा एकमेव पुरावा
16. `/checkout/[orderId]` — admin app मधला public route
17. App: Test Series store + "Buy" → **बाहेरच्या browser** मध्ये checkout
18. Sign up (mobile + password)

**का इथे:** B नंतर लगेच. **B + C = महसूल.** याच्या पुढचं सगळं "छान वाटणं" आहे.

### टप्पा D · रोजचा वापर
19. Home aggregate API + Home screen
20. Notifications screen + push — 🔑 **इथे Firebase account लागेल**
21. Profile + Settings screens
22. Analytics screen

### टप्पा E · Content
23. Schema: `Article` (Current Affairs), `StudyMaterial` (Notes/PYQ)
24. **Admin: bulk import आधी** (Excel/JSON) — आजच्या question import सारखं
25. App: Current Affairs screen, Learn screen
26. File storage (PDF/फोटो) — 🔑 **इथे Cloudflare R2 लागेल**
27. Bookmarks — सध्या फक्त प्रश्नांसाठी, सर्व प्रकारांसाठी वाढवायचं
28. Search — सुरुवातीला **Postgres full-text**, Meilisearch नंतर गरज पडली तर
29. Admin: CMS editor — *content कोण लिहिणार ठरल्यावरच*

**का शेवटी:** content नसेल तर हे screens रिकामे दिसतात. आणि **कोण लिहिणार ते अजून
ठरलेलं नाही** — म्हणून import आधी (तो दोन्ही बाबतीत उपयोगी), editor नंतर.

### टप्पा F · प्रकाशन
30. Sentry + Crashlytics
31. Rate limiting, Helmet, audit logs
32. Play Store वर app — 🔑 **इथे Play Console लागेल ($25)**
33. Admin मधून student-facing routes काढणे + Capacitor `android/` काढणे

---

## प्रत्येक module याच क्रमाने बांधायचा

```
1. Prisma schema (packages/db)
2. Pure logic + tests (packages/core)   ← database न लागता
3. NestJS module (controller + service + DTO)
4. App screen (apps/mobile)
5. पडताळणी — tests, typecheck, browser/simulator
```

पायरी 2 वगळायची नाही. निर्णय घेणारं कुठलंही logic `packages/core` मध्येच —
`entitlements.ts` सारखं. तिथे database लागत नाही म्हणून tests झटपट चालतात, आणि
admin + API दोघांना तेच उत्तर मिळतं.

---

## अडचणी — तुम्हाला माहीत असाव्यात

**१. Content कोण बनवणार ठरलं नाही.** v1 मध्ये Content हवं म्हणालात, पण रोज Current
Affairs लिहिणारं कोणी नसेल तर module बांधून app मध्ये रिकामी यादी दिसेल. म्हणून
टप्पा E मध्ये **import आधी, editor नंतर** ठेवला आहे. तुमचा निर्णय आल्यावर बदलू.

**२. `Question.subject` लवकर करा.** वर कारण दिलं आहे. उशीर = जुने प्रश्न हाताने भरणे.

**३. Accounts वेळेवर लागतील.** Razorpay (टप्पा C), Firebase (D), Cloudflare (E),
Play Console (F). ती वेळ आली की मी आठवण करेन — आधी नाही.

**४. Search.** Meilisearch वेगळा server आहे (होस्टिंग + देखभाल). सुरुवातीला Postgres
चा full-text पुरेसा — 5 quizzes आणि काही लेखांसाठी Meilisearch जास्तच होईल.

**५. AI.** सगळं संपल्यावर आठवण करेन — तुम्ही तेव्हा ठरवाल.
