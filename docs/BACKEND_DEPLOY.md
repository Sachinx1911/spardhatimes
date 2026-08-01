# Backend Vercel वर — deploy कसा करायचा

> Code तयार आहे आणि स्थानिक पातळीवर तपासलेला आहे. उरलेलं काम Vercel च्या
> संकेतस्थळावर करायचं आहे — त्यासाठी लॉगिन लागतं, म्हणून ते इथे लिहून ठेवलं आहे.

## आधी हे समजून घ्या

Repo मध्ये **दोन** deploy होणारे प्रकल्प आहेत:

| प्रकल्प | Root Directory | काय |
|---|---|---|
| Admin (आधीच आहे) | `apps/admin` | Next.js संकेतस्थळ |
| **API (नवीन)** | `backend` | विद्यार्थी app साठी |

एका repo चे दोन Vercel प्रकल्प बनतात — प्रत्येकाची Root Directory वेगळी.

---

## ⚠️ सर्वात महत्त्वाचं: database चा पत्ता बदलावा लागेल

आजच्या `.env` मध्ये **दोन्ही** URL थेट जोडणीचे आहेत (port **5432**,
`db.xxx.supabase.co`). लॅपटॉपवर तो एकच process असल्याने चालतो.

**Serverless वर तो चालणार नाही.** प्रत्येक function instance स्वतःची जोडणी
उघडतो; थोडे विद्यार्थी एकाच वेळी आले की Postgres च्या जोडण्यांची मर्यादा
संपते आणि `too many connections` येऊन **सगळंच** थांबतं.

म्हणून Vercel वर असं द्यायचं:

```
DATABASE_URL   → pooler, port 6543, शेवटी ?pgbouncer=true
DIRECT_URL     → थेट, port 5432 (फक्त migrations साठी)
```

Supabase Dashboard → Project Settings → Database → Connection string मध्ये
दोन्ही मिळतात ("Transaction pooler" आणि "Direct connection").

---

## पायऱ्या

### १ · नवीन प्रकल्प

Vercel → Add New → Project → हाच repo निवडा.

**Root Directory: `backend`**

आणि **"Include files outside of the Root Directory"** चालू करा — `backend`
हा `packages/core` आणि `packages/db` वर अवलंबून आहे; ते बाहेर आहेत, आणि हा
पर्याय बंद असेल तर build "module not found" देऊन थांबेल.

Framework Preset: **Other**. Build आणि Install चे commands `vercel.json`
मधून येतात, हाताने लिहायचे नाहीत.

### २ · Environment Variables

| नाव | कुठून |
|---|---|
| `DATABASE_URL` | Supabase → **Transaction pooler** (6543) + `?pgbouncer=true` |
| `DIRECT_URL` | Supabase → **Direct connection** (5432) |
| `JWT_SECRET` | आजच्या `.env` मधलाच |
| `AUTH_SECRET` | आजच्या `.env` मधलाच |

तिन्ही environments ना (Production, Preview, Development) द्या.

### ३ · Deploy करा आणि तपासा

```
https://<तुमचा-प्रकल्प>.vercel.app/api/docs
```

Swagger चं पान दिसलं की API चालू आहे. मग खरी चाचणी:

```bash
curl -X POST https://<तुमचा-प्रकल्प>.vercel.app/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"phone":"9000000001","password":"Student@123"}'
```

`accessToken` आला की झालं.

### ४ · App ला नवीन पत्ता द्या

`apps/mobile/.env.local` मध्ये:

```
EXPO_PUBLIC_API_URL=https://<तुमचा-प्रकल्प>.vercel.app/api
```

मग नवीन APK बांधा. **तो पत्ता कायमचा असल्याने** आजचे तीन निर्बंध जातात —
लॅपटॉप चालू ठेवायची गरज नाही, wifi चा प्रश्न नाही, आणि पत्ता बदलला म्हणून
पुन्हा build करावा लागत नाही.

`usesCleartextTraffic` सुद्धा काढता येईल (`apps/mobile/app.json`), कारण
`https` ला त्याची गरज नाही.

---

## हे असं का बांधलं

**`api/index.js` मुद्दाम JavaScript आहे.** तो TypeScript असता तर Vercel चा
bundler त्याला compile केला असता आणि तो `emitDecoratorMetadata` तयार करत
नाही. NestJS ची पूर्ण dependency injection त्याच metadata वर उभी आहे —
म्हणजे build यशस्वी झाला असता आणि app चालवताना कोसळला असता. आता सगळं Nest चं
code `nest build` (tsc) नेच compile होतं.

**`src/serverless.ts` मध्ये app cache केलेला आहे.** Nest उभा करणं म्हणजे सगळे
modules आणि database ची जोडणी. प्रत्येक विनंतीला ते केलं असतं तर प्रत्येक
उत्तर उशिरा आलं असतं आणि जोडण्या संपल्या असत्या. स्थानिक चाचणीत:
पहिली विनंती **823ms**, पुढच्या **4ms** आणि **2ms**.

**`configure-app.ts` वेगळा आहे.** लॅपटॉप (`main.ts`) आणि Vercel
(`serverless.ts`) दोन्हीकडे तीच मांडणी लागते. ती दोनदा लिहिली असती तर
हळूहळू वेगळी झाली असती — आणि तिथे `ValidationPipe` चा `whitelist` आहे, जो
client ला नसलेली fields पाठवण्यापासून अडवतो. तो एका बाजूला राहिला असता तर
लॅपटॉपवर सगळं ठीक दिसलं असतं आणि production उघडं पडलं असतं.

## मर्यादा

- **Swagger उघडं आहे** (`/api/docs`). खरे विद्यार्थी येण्याआधी ते
  production मध्ये बंद करावं — सगळे endpoints आणि त्यांचे आकार जाहीर दिसतात.
- **Cold start** — instance झोपला की पहिली विनंती ~1 सेकंद घेते. Fluid
  Compute मुळे पुढच्या वेगात येतात.
