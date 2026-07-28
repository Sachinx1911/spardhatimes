# Paid Test Series — अंमलबजावणी योजना

> स्थिती: **मंजूर, अंमलबजावणी बाकी.** एकही ओळ code अजून लिहिलेला नाही.
> तयार केलं: 2026-07-27

## Context (हे का करतोय)

आत्ता platform पूर्णपणे **मोफत आणि admin-नियंत्रित** आहे: admin विद्यार्थ्याचं account बनवतो आणि हाताने test series देतो. पैसे घेण्याची कोणतीही रचना कुठेही नाही — schema मध्ये price, order, payment असं एकही field नाही.

आता महसूल सुरू करायचा आहे: **admin series ला किंमत ठरवेल → ती series प्रत्येक विद्यार्थ्याच्या dashboard मध्ये दिसेल → विद्यार्थी विकत घेईल → त्यालाच त्याचा access मिळेल.**

एक गोष्ट नोंदवण्यासारखी: `app/faq/page.tsx:16` मध्ये आधीच लिहिलंय की *"premium test series... paid, which you can unlock anytime"* — म्हणजे वचन आधीच दिलं आहे, अंमलबजावणी बाकी आहे.

## ठरलेले निर्णय

| | निर्णय |
|---|---|
| खरेदी प्रकार | एकेक series, एकदाच पैसे (subscription नाही) |
| Access मुदत | ~~कायमस्वरूपी~~ → **मुदत असेल (6 / 12 महिने)** — बदललं 2026-07-29 |
| Payment gateway | **Razorpay** (UPI/card/netbanking) |
| App मधून खरेदी | **Browser उघडून** website वर payment |
| Sign up | **विद्यार्थी स्वतः account बनवतील** |

### App मधून खरेदी — Play Store चा नियम

Test series हे app मध्ये वापरलं जाणारं digital content आहे, म्हणून Google चा नियम Play Billing (१५% कमिशन) मागतो. पण भारतात CCI च्या आदेशामुळे Google **anti-steering लादू शकत नाही** — म्हणजे app मधून बाहेर browser मध्ये पाठवून तिथे पैसे घेता येतात, **कमिशन शून्य**. म्हणून एकच payment मार्ग: website वर Razorpay, app त्याला बाहेर उघडतो.

संदर्भ: [Play billing in India](https://support.google.com/googleplay/android-developer/answer/13306652) · [Payments policy](https://support.google.com/googleplay/android-developer/answer/10281818)

---

## ⚠️ सर्वात आधी: पैसे घेण्याआधी सुरक्षा भोकं बंद करा

**हे टप्पा १ आहे आणि तो वगळता येणार नाही.** आज paywall फक्त दिसण्यापुरता असेल, प्रत्यक्षात नाही:

**१. `submitQuizAttempt` मध्ये access तपासलाच जात नाही** — `app/actions/quiz.ts`. त्यात फक्त "login आहे का" एवढंच बघतो. कोणताही विद्यार्थी कोणत्याही `quizId` वर उत्तरं पाठवून **निकाल आणि certificate** मिळवू शकतो — series विकत न घेता. आज हा bug आहे; उद्या ही थेट महसूल गळती.

**२. Attempt page चा guard फक्त UI आहे** — `app/quiz/[slug]/attempt/page.tsx` (~ओळ 100). तो `if (quiz?.testSeries)` मध्ये गुंडाळलेला आहे, म्हणून series नसलेले quizzes कोणालाही उघडतात, आणि `status: DRAFT` कधीच तपासला जात नाही.

**३. `/test/[slug]` पूर्णपणे anonymous आहे** — `app/test/[slug]/page.tsx`. `isPublic=true` असलेला कोणताही quiz login शिवाय सोडवता येतो. आणि `toggleQuizPublic` (`app/actions/admin.ts`) paid series मधल्या quiz वर सुद्धा लावता येतो — म्हणजे पैसे भरलेली series फुकट उघडी.

### उपाय: एकच सामायिक तपासणी

नवीन `lib/entitlements.ts` → `canAttemptQuiz(userId, quizId)`, जी परत करेल
`{ allowed: boolean, reason: "NOT_LOGGED_IN" | "NOT_PURCHASED" | "NOT_RELEASED" | "CLOSED" | "DRAFT" }`.

ती **या तिन्ही ठिकाणी** वापरायची:
- `submitQuizAttempt` — सर्वात महत्त्वाची जागा
- attempt page — `if (quiz?.testSeries)` बाहेर काढून सगळ्या quizzes साठी
- `public-quiz.ts` — किंमत असलेल्या series मधला quiz `isPublic` असला तरी नाकारायचा

तसंच `toggleQuizPublic` ने paid series मधल्या quiz ला public करू द्यायचं नाही.

हे pure logic असल्याने `lib/grading.ts` प्रमाणे **Vitest tests** लिहायचे.

---

## Data model (किमान बदल)

**`TestSeries`** मध्ये एक field:
```prisma
priceInPaise Int @default(0)   // 0 = मोफत
```
पैसे **paise मध्ये Int** म्हणून — Float मध्ये पैसे कधीच ठेवायचे नाहीत (₹99.99 चं 99.98999 होतं). Razorpay सुद्धा paise घेतो, त्यामुळे रूपांतर लागत नाही.

**नवीन `Order` model** — जुळवणी आणि परताव्यासाठी:
```prisma
model Order {
  id                String      @id @default(cuid())
  userId            String
  testSeriesId      String
  amountInPaise     Int
  status            OrderStatus @default(CREATED)   // CREATED | PAID | FAILED
  razorpayOrderId   String      @unique
  razorpayPaymentId String?
  createdAt         DateTime    @default(now())
  paidAt            DateTime?

  @@index([userId])
  @@index([testSeriesId])
}
```

**`TestSeriesAccess` जसंच्या तसं वापरायचं** — त्याचा `assignedById` आधीच nullable आहे, म्हणून स्वतः विकत घेतलेल्या rows मध्ये तो null ठेवायचा (= "admin ने दिलं नाही, विकत घेतलं"). फक्त provenance साठी `orderId String?` जोडायचा.

> **⚠️ बदल (2026-07-29): access ला मुदत असेल.** मूळ योजनेत "कायमस्वरूपी" होतं;
> storefront च्या designs मध्ये "Valid for 12 Months" आल्यावर मुदत ठेवायची ठरली.
> याचे तीन परिणाम:
>
> 1. `TestSeries` ला `validityMonths Int` (उदा. 6, 12)
> 2. `TestSeriesAccess` ला `expiresAt DateTime?` — **null = कायमस्वरूपी**, म्हणजे
>    admin ने हाताने दिलेल्या जुन्या rows तशाच चालू राहतात
> 3. `packages/core/src/entitlements.ts` मध्ये नवीन reason **`EXPIRED`** आणि
>    `evaluateAttemptAccess` ला `accessExpiresAt` मिळेल. तपासणीचा क्रम:
>    `NO_ACCESS` → `EXPIRED` → `NOT_RELEASED` / `CLOSED`.
>    त्यासाठी `entitlements.test.ts` मध्ये नवीन cases: मुदत संपलेली, मुदत उरलेली,
>    `expiresAt = null`, आणि admin bypass.
>
> हे टप्पा C चं काम आहे — किंमत आणि Order बरोबरच करायचं.

---

## Razorpay जोडणी

`lib/mailer.ts` चा नमुना वापरायचा — पातळ module, **raw `fetch` (SDK नाही)**, env मधून key, आणि अपयशी झाल्यास throw न करता `{ ok: false }`. या codebase मध्ये मुद्दाम SDK टाळले आहेत (फक्त 15 runtime deps).

नवीन `lib/payments.ts`. Env (Vercel वर, **Setting मध्ये नाही** — तिथली values plaintext असतात आणि admin page ला जातात):
```
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID    # checkout widget साठी, हा public असतोच
```

**प्रवाह:**
1. विद्यार्थी "Buy" दाबतो → server action `createSeriesOrder(seriesId)` → किंमत **server वरून** घेते (client कडून कधीच नाही), Razorpay order बनवते, `Order` row `CREATED` म्हणून साठवते
2. Checkout page वर Razorpay widget
3. 🔑 **Webhook हाच अंतिम पुरावा** — `app/api/payments/razorpay/webhook/route.ts`. HMAC signature तपासायची, मग `Order` → `PAID` आणि `TestSeriesAccess` बनवायचा

**Client चा "payment success" callback कधीच विश्वासार्ह मानायचा नाही** — तो सहज खोटा बनवता येतो. Webhook हेच सत्य.

Webhook **idempotent** असावा — Razorpay तोच event पुन्हा पाठवतो. `razorpayOrderId` वरचा unique आणि `TestSeriesAccess` वरचा compound unique हे दोन्ही आपोआप संरक्षण देतात, पण `upsert` वापरायचा.

---

## Sign up चालू करणे

`app/actions/auth.ts` मध्ये `registerUser` सध्या फक्त "disabled" असा संदेश परत करणारा stub आहे, आणि `app/register/page.tsx` हे स्थिर "accounts are admin-managed" पान आहे. दोन्ही खरे बनवायचे: नाव/email/password, email unique, bcrypt (आधीच वापरात), role `STUDENT`.

`registrations_open` हा Setting key **आधीच अस्तित्वात आहे पण कुठेही वापरला जात नाही** (`lib/settings.ts`) — तोच स्विच म्हणून जोडायचा, म्हणजे गरज पडल्यास admin नोंदणी बंद करू शकेल.

⚠️ Email verification शिवाय बनावट accounts येतील. Resend आधीच जोडलेलं आहे (`lib/mailer.ts`), त्यामुळे verification नंतर टाकता येईल — पण **पहिल्या दिवशी नाही केलं तरी चालेल**, कारण पैसे भरल्याशिवाय काहीच मिळत नाही.

---

## Dashboard

`components/dashboard/MyTestSeries.tsx` आज फक्त **घेतलेल्या** series दाखवतो.

आता dashboard दोन याद्या दाखवेल:
- **My Tests** — घेतलेल्या series (आजच्यासारख्या, Start Test सह)
- **Available Series** — न घेतलेल्या published series, प्रत्येकावर **"₹499 मध्ये घ्या"** बटण

मोफत series (`priceInPaise = 0`) असतील तर "Get free" दाखवून लगेच access द्यायचा.

वेगळं public storefront लागत नाही — सगळं dashboard मध्येच. (पुढे SEO साठी हवं असल्यास `/quizzes` हे आत्ता `redirect("/")` stub आहे, तिथे करता येईल.)

## Admin बाजू

- `components/admin/SeriesManager.tsx` मध्ये **price** field
- नवीन `/admin/orders` — कोणी काय घेतलं, किती पैसे, status
- हाताने access देणे/काढणे आजच्यासारखं चालू राहील (`assignSeries`) — परतावा किंवा अडचणीसाठी उपयोगी

## Android app

`@capacitor/browser` वापरून checkout URL **बाहेरच्या browser मध्ये** उघडायचा. परत आल्यावर dashboard refresh → access दिसेल.

⚠️ **Razorpay चे domains `capacitor.config.ts` मधल्या `allowNavigation` मध्ये टाकायचे नाहीत.** ती यादी सध्या फक्त `spardhatimes.in` आहे आणि तशीच ठेवायची — payment WebView मध्ये उघडलं तर तेच "app मधून खरेदी" ठरतं आणि Play Billing चा नियम लागू होतो. बाहेर उघडणं हाच मुद्दा आहे.

---

## क्रम (कशानंतर काय)

| टप्पा | काम | पैसे घेता येतील? |
|---|---|---|
| **१** | Entitlement तपासणी + tests, तिन्ही भोकं बंद | नाही — पण हे आधी हवंच |
| **२** | Schema (price, Order) + admin मध्ये price | नाही |
| **३** | Razorpay + **webhook** | तांत्रिकदृष्ट्या हो |
| **४** | Sign up चालू | ✅ खरी विक्री सुरू |
| **५** | Dashboard वर Buy UI | ✅ |
| **६** | App मधून link-out | ✅ app मधूनही |

टप्पा १-३ हा गाभा आहे. ४-६ नंतर टप्प्याटप्प्याने.

---

## पडताळणी कशी करायची

1. **Unit tests** — `lib/entitlements.test.ts`: विकत घेतलेलं/न घेतलेलं, मोफत series, DRAFT, releaseAt आधी/नंतर, WINDOW बंद, admin
2. **भोकं बंद झाली का** — विकत न घेतलेल्या `quizId` वर थेट `submitQuizAttempt` चालवून बघणे; ते **नाकारलं गेलं पाहिजे** (आज ते चालतं)
3. **Razorpay test mode** — test keys ने पूर्ण खरेदी, `Order` → PAID, `TestSeriesAccess` बनला का
4. **Webhook** — खोट्या signature ने request पाठवून ती **नाकारली** जाते ना; तोच event दोनदा पाठवून duplicate access बनत नाही ना
5. **End-to-end** — नवीन account बनवणे → series विकत घेणे → test देणे → निकाल
6. **App** — Buy दाबल्यावर browser बाहेर उघडतो ना (WebView मध्ये नाही), आणि परत आल्यावर access दिसतो ना

## महत्त्वाच्या files

| File | काय |
|---|---|
| `lib/entitlements.ts` + `.test.ts` | नवीन — गाभा |
| `lib/payments.ts` | नवीन — `mailer.ts` चा नमुना |
| `app/api/payments/razorpay/webhook/route.ts` | नवीन — सत्याचा स्रोत |
| `app/actions/quiz.ts` | `submitQuizAttempt` मध्ये तपासणी (सर्वात महत्त्वाचा बदल) |
| `app/actions/public-quiz.ts`, `app/quiz/[slug]/attempt/page.tsx` | तपासणी |
| `prisma/schema.prisma` | price, Order, orderId |
| `app/actions/auth.ts`, `app/register/page.tsx` | sign up |
| `components/dashboard/MyTestSeries.tsx` | Buy UI |
| `components/admin/SeriesManager.tsx` | price field |

## धोके

- **Client-side किंमत** — किंमत नेहमी server वरून. Client ने पाठवलेली रक्कम कधीच वापरायची नाही
- **Webhook उशिरा येतो** — विद्यार्थ्याला "payment झालं, access काही क्षणात" दाखवायचं; लगेच access गृहीत धरायचा नाही
- **Supabase latency** — DB ~170ms दूर आहे; webhook मध्ये loop करून per-row writes करायचे नाहीत (हा प्रश्न Excel import मध्ये आधी आलेला आहे)
- **Refund** — Razorpay मधून परतावा दिला की `TestSeriesAccess` आपोआप जात नाही; admin ला हाताने काढावं लागेल (किंवा पुढे refund webhook)
