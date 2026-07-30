# UI Design Standard — MahaTest student app

> अंतिम. 2026-07-29. हा दस्तऐवज **सर्व screens साठी** आहे — जुन्या आणि पुढे येणाऱ्या.
> संहिता (code): `apps/mobile/src/theme/tokens.ts`. हा दस्तऐवज त्यामागचं **का** सांगतो.

---

## नियम क्रमांक १

**Screen files मध्ये hex रंग, सुटे आकार, किंवा सुटी अंतरं लिहायची नाहीत.**
सगळं `@/theme/tokens` मधून. एखादं मूल्य तिथे नसेल, तर दोनपैकी एक खरं आहे:

1. ते design मध्येही नाही → **विचारा, स्वतः ठरवू नका.**
2. ते खरंच नवीन आहे → **आधी token म्हणून जोडा,** मग वापरा.

कारण साधं आहे: एकच रंग दोन screens वर दोन ठिकाणी लिहिला की तो हळूहळू वेगळा होतो,
आणि मग "app जुनं दिसतं" याचं नेमकं कारण सापडत नाही.

---

## १. रंग

तिन्ही design sheets मध्ये हे **तंतोतंत सारखे** होते — म्हणून यावर वाद नाही.

| Token | Hex | कुठे |
|---|---|---|
| `primary` | `#4F46E5` | Buttons, active tab, दुवे, banner |
| `primaryLight` | `#EDE9FE` | Tags, chips, icon ची पार्श्वभूमी |
| `primarySoft` | `#EEF2FF` | उठून दिसणारं कार्ड ("Continue Your Test") |
| `success` | `#10B981` | बरोबर उत्तर, सवलत, "Completed" |
| `warning` | `#F59E0B` | "In Progress", सावधानतेचे आकडे |
| `danger` | `#EF4444` | चूक, badge counter, धोका |
| `text` | `#0F172A` | मुख्य मजकूर |
| `textSecondary` | `#64748B` | दुय्यम मजकूर, meta |
| `border` | `#E2E8F0` | रेषा, रिकामा progress track |
| `background` | `#F8FAFC` | पडद्याची पार्श्वभूमी |
| `surface` | `#FFFFFF` | कार्ड |

**फिकट छटा** (`successLight`, `warningLight`, `dangerLight`) status chips साठी.
एखाद्या icon मागे कोणताही रंग फिकट करायचा असेल तर `` `${tint}1A` `` — म्हणजे 10%
अपारदर्शकता. प्रत्येक रंगासाठी वेगळा token ठेवण्यापेक्षा हे नेहमी जुळतं.

**Dark mode अजून नाही.** डिझाइन फक्त light मध्ये आलं आहे. करायचं ठरलं तर आधी
tokens ला दुसरा संच लागेल — screens ला हात लावावा लागणार नाही, हाच नियम १ चा फायदा.

---

## २. Typography — Poppins

Weights वेगवेगळ्या **font families** आहेत, `fontWeight` नाही. Android वर
`fontWeight: '600'` ने Poppins चा SemiBold उचलला जात नाही — तो Regular ताणून दाखवतो.
म्हणून प्रत्येक शैलीत `fontFamily` स्पष्ट.

### Screen-पातळीचा scale (`typography`)

| Token | Size | Weight | Line | कुठे |
|---|---|---|---|---|
| `headingXL` | 28 | Bold | 36 | Screen title |
| `headingL` | 22 | SemiBold | 30 | Section title, मोठा आकडा |
| `titleL` | 18 | SemiBold | 26 | Card title |
| `bodyL` | 15 | Regular | 22 | मुख्य मजकूर |
| `bodyM` | 14 | Regular | 20 | नेहमीचा मजकूर |
| `bodyS` | 12 | Regular | 18 | Meta |
| `caption` | 11 | Regular | 16 | सर्वात लहान |

### Component-पातळीची मापं (`componentType`)

Sheet ने एखाद्या घटकाला स्वतःचं माप दिलं असेल तर ते वरच्या scale पेक्षा वरचढ.
किंमत मुद्दाम मोठी आहे — ती scale मध्ये बसवायची नाही.

`cardTitle` 16/SemiBold · `cardDescription` 13/Regular · `badge` 11/Medium ·
`priceCurrent` **22/Bold** · `priceOld` 14/Medium · `discount` 12/SemiBold ·
`buttonText` 16/SemiBold · `smallLabel` 11/Regular · `navLabel` 11/Medium

ठळक करायचं असेल तर आकार तोच ठेवून `strong.semibold` / `strong.bold` जोडा.

---

## ३. अंतर, कोपरे, सावली

**Spacing — 8dp grid:** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64
(`xs sm md lg xl 2xl 3xl 4xl 5xl 6xl 7xl`)

**Radius:** `xs` 4 · `sm` 8 · `buttonSmall` 10 · `md` 12 · `chip` 14 · `lg` 16 ·
`xl` 20 · `xxl` 24 · `full` 999

**Shadow** — `boxShadow` वापरतो, जुने `shadowColor`/`shadowOffset` नाहीत (RN 0.86
वर ते deprecated आहेत आणि web bundler ओरडतो).

| Token | मूल्य | कुठे |
|---|---|---|
| `shadow.card` | `0 2 8 rgba(0,0,0,.05)` | यादीतली कार्डं |
| `shadow.cardRaised` | `0 4 12 rgba(0,0,0,.08)` | उचललेली कार्डं |
| `shadow.button` | `0 2 8 rgba(0,0,0,.10)` | भरीव buttons |

---

## ४. मापं (`layout`)

**रुंदी खऱ्या पडद्यावरून मोजायची, 360 गृहीत धरायची नाही.** Sheet चा स्वतःचा
implementation guide हेच सांगतो. 360dp हा फक्त डिझाइनचा आधार आहे, नियम नाही.

```
cardWidth     = screenWidth − 32          // 360 वर 328
halfCardWidth = (screenWidth − 44) / 2    // दोन प्रति ओळ
```

Screen padding **16** · Header **80** · Bottom nav **56** (+ safe area) ·
Button **44** (secondary 40) · Category chip **36** · Status chip **28** ·
Badge **24** · Search **48** · Nav icon **24** · Card icon **28**

---

## ५. घटक

| घटक | माप | टिप्पणी |
|---|---|---|
| Button (primary) | उंची 44, r12, भरीव | `full` = पूर्ण रुंदी |
| Button (secondary) | उंची 40 | कार्डाच्या आत |
| Buy button | 96×40, r12 | फक्त series कार्डावर |
| Category chip | उंची 36, r20 | आडवं scroll, active = भरीव primary |
| Status chip | उंची 28, r14 | फिकट पार्श्वभूमी + गडद मजकूर |
| Tag / badge | उंची 24, r8, padding 4×10 | "70 Tests", "Bilingual" |
| Card | r16, `shadow.card`, padding 16 | |
| Banner | r24, उंची 170 | |
| Progress track | उंची 6, r-full | रिकामा = `border` |

### Series कार्डाची तीन रूपं

- **`featured`** 160×235 — आडव्या पट्टीत, वर रंगीत आवरण, खाली "View Details"
- **`popular`** पूर्ण रुंदी — डावीकडे आवरण, उजवीकडे मजकूर + Buy Now
- **`buy`** किमान उंची 112, 72dp चिन्ह — "Buy Test Series" screen साठी

---

## ६. Navigation — 🔒 गोठवलेलं

**पाच सपाट tabs, हाच क्रम, सगळीकडे:**

```
Home · Learn · Tests · Analytics · Profile
```

उंची 56dp + safe area. Icon 24dp, label 11sp Medium.
Active = `primary` रंग + खाली 4dp ठिपका.

**मधला उंचावलेला गोल button नाही.** जुन्या mockups मध्ये "Tests" उचललेला होता,
पण अंतिम sheets मध्ये पाचही tabs सारखेच सपाट आहेत.

> ### 🔒 हा क्रम बदलायचा नाही
>
> **ठरलं 2026-07-29 — कायमचं.** पुढे येणाऱ्या एखाद्या design sheet मध्ये वेगळे
> tabs दिसले (उदा. "My Tests · Buy · Current Affairs") तरी **तो क्रम घ्यायचा नाही.**
> ती sheet फक्त त्या एका screen साठी वापरायची; तिचा tab bar दुर्लक्षित करायचा.
>
> कारण: tab bar प्रत्येक screen वर दिसतो. तो एका sheet मागे बदलला की app च्या
> इतर सगळ्या screens शी विसंगत होतो, आणि विद्यार्थ्याला "काल इथे होतं ते आज कुठे
> गेलं" असा प्रश्न पडतो. Navigation ही एकदाच ठरवायची गोष्ट आहे.
>
> क्रम खरंच बदलायचा असेल तर तो **वेगळा, जाणीवपूर्वक निर्णय** — एका screen च्या
> design मधून आपोआप नाही.

---

## ७. Screen ची रचना

```
Header (80)      शीर्षक (headingXL) + उजवीकडे icons
[Chips (36)]     गरज असेल तर
Banner / Hero    गरज असेल तर
──────────────
Section          SectionHeader (headingL + "View All") + मजकूर
Section          वरच्या section पासून 32dp अंतर
──────────────
Bottom nav (56)
```

Sections मध्ये **32dp** (`spacing['3xl']`) अंतर. कार्डांमध्ये **12dp**.

---

## ८. नवीन screen बांधताना

1. `Screen` वापरा — safe area आणि padding तो सांभाळतो
2. Header मध्ये `headingXL`
3. प्रत्येक विभागाला `SectionHeader`
4. आधीच असलेले घटक शोधा (`src/components/ui/`) — नवीन बनवण्याआधी
5. Dummy data `src/data/mock.ts` मध्येच, screen मध्ये विखरून नाही
6. `npx tsc --noEmit`
7. Browser मध्ये **360×800** वर बघा — आडवा scroll येता कामा नये
8. मजकूर कापतोय का ते तपासा (खाली बघा)

### ⚠️ Poppins रुंद आहे

Inter पेक्षा Poppins जास्त जागा घेतो. आधीच दोनदा मजकूर कापला होता —
"Police Bh…" आणि test rows मधलं "100 Qs". **उपाय: जागा आवळा, मजकूर लहान करू नका.**
Sheet मधला आकार हा शेवटचा उपाय म्हणूनच बदलायचा, आणि बदलला तर comment मध्ये कारण द्या.

---

## ९. विरोध आला तर

नवीन design sheet जुन्याशी भांडली तर याच क्रमाने ठरवायचं:

1. **किती sheets सहमत आहेत** — बहुमत जिंकतं
2. **Android 360dp** — app Android-आधी आहे
3. **नवीन sheet** — जुन्यापेक्षा नवी
4. तरीही ठरेना → **विचारा**

आणि ठरलेला निर्णय खाली नोंदवा — म्हणजे तोच वाद पुन्हा होणार नाही.

### सोडवलेले विरोध

| मुद्दा | पर्याय | निर्णय | कारण |
|---|---|---|---|
| Font | Inter / **Poppins** | Poppins | 3 पैकी 2 sheets, आणि नवी |
| Heading XL | **28** / 32 | 28 | 2 sheets Android 360dp चे |
| Bottom nav | **56** / 72 | 56 | 3 पैकी 2 sheets |
| Base width | 360 / 375 / 390 | **मोजून** | sheet चा स्वतःचा guide तेच सांगतो |
| मधला tab | उचललेला / **सपाट** | सपाट | तिन्ही अंतिम sheets |
| Card shadow | तीन वेगवेगळ्या | elevation 1 + 2 | दोन पातळ्या पुरेशा |
| Tab bar चा क्रम | Home·Learn·**Tests**·Analytics·Profile *विरुद्ध* Home·My Tests·Buy·Current Affairs·Profile | **पहिला — गोठवलेला** | Profile च्या sheet मध्ये दुसरा दिसला, पण navigation एका screen मागे बदलायची नाही. बघा §६ |

### डिझाइनमधले दोष — मुद्दाम पाळलेले नाहीत

- **Attempt screen वर Explanation** — sheet मध्ये timer चालू असताना बरोबर उत्तराचा
  खुलासा दाखवला आहे. तसं बनवलं तर प्रत्येक विद्यार्थी 100% मिळवेल. Explanation
  **फक्त Result / Review Answers** मध्ये.
- **Buy कार्ड 112dp** — त्यात शीर्षक + वर्णन + badges + किंमत बसत नाहीत. ते
  **किमान** माप धरून कार्ड वाढू दिलं आहे. मजकूर कापण्यापेक्षा कार्ड उंच बरं.

---

## १०. अजून पाळलं जात नाही

नवीन standard `index.tsx`, `tests.tsx`, आणि सामायिक घटकांना लागू आहे. उरलेल्या
screens वर नवीन tokens आपोआप आले, पण त्यांची स्वतःची design sheet अजून आलेली नाही:

| Screen | स्थिती |
|---|---|
| `quiz/[id]/attempt.tsx` | सुटे `fontSize: 10, 17` — sheet आल्यावर |
| `quiz/[id]/result.tsx` | सुटे `fontSize: 22, 30` — sheet आल्यावर |
| `test-card.tsx` | सुटे `fontSize: 20` |
| `(tabs)/learn.tsx`, `analytics.tsx` | सांगाडाच आहेत |
| `login.tsx` | सर्वात शेवटी बांधायचा (ठरलेलं) |

`fontSize: 9` (badge counter) मुद्दाम आहे — scale मधलं सर्वात लहान 11 आहे, आणि
सूचनांचा आकडा त्याहून लहान हवा.
