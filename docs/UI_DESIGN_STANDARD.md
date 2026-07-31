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

| Token | Hex | कुठे |
|---|---|---|
| `primary` | `#5B3DF5` | Buttons, active tab, दुवे |
| `primaryDark` | `#4427D6` | Gradient चं दुसरं टोक, दाबलेलं बटण |
| `primaryLight` | `#F3F0FF` | Tags, chips, icon ची पार्श्वभूमी |
| `success` | `#22C55E` | बरोबर उत्तर, सवलत, "Completed" |
| `warning` | `#F59E0B` | "In Progress", सावधानतेचे आकडे |
| `danger` | `#EF4444` | चूक, badge counter, धोका |
| `blue` | `#3B82F6` | Tile चिन्हं |
| `pink` | `#EC4899` | Tile चिन्हं |
| `text` | `#1E293B` | मुख्य मजकूर |
| `textSecondary` | `#64748B` | दुय्यम मजकूर, meta |
| `border` | `#E5E7EB` | रेषा, रिकामा progress track |
| `background` | `#F8F9FD` | पडद्याची पार्श्वभूमी |
| `surface` | `#FFFFFF` | कार्ड |

**वरची पट्टी gradient आहे** — `gradients.appBar` (`#5B3DF5` → `#7C5CFF`).
Screen मध्ये hex लिहायचे नाहीत, तो token वापरायचा.

**फिकट छटा** (`successLight`, `warningLight`, `dangerLight`) status chips साठी.
एखाद्या icon मागे कोणताही रंग फिकट करायचा असेल तर `` `${tint}1A` `` — म्हणजे 10%
अपारदर्शकता. प्रत्येक रंगासाठी वेगळा token ठेवण्यापेक्षा हे नेहमी जुळतं.

**Dark mode अजून नाही.** डिझाइन फक्त light मध्ये आलं आहे. करायचं ठरलं तर आधी
tokens ला दुसरा संच लागेल — screens ला हात लावावा लागणार नाही, हाच नियम १ चा फायदा.

---

## २. Typography — Poppins + Mukta

Weights वेगवेगळ्या **font families** आहेत, `fontWeight` नाही. Android वर
`fontWeight: '600'` ने Poppins चा SemiBold उचलला जात नाही — तो Regular ताणून दाखवतो.
म्हणून प्रत्येक शैलीत `fontFamily` स्पष्ट.

### 🔤 मराठी मजकुराला **Mukta**

Poppins मध्ये देवनागरी अक्षरं नाहीत. मराठी ओळ Poppins मध्ये दिली की OS स्वतःचा
पर्यायी font घालतो — आणि तो प्रत्येक फोनवर वेगळा दिसतो. म्हणून:

```ts
<Text style={{ ...typography.titleL, ...marathi.semibold }}>मोफत टेस्ट</Text>
```

आकार तोच राहतो, फक्त family बदलते. **मराठी मजकूर असलेल्या प्रत्येक `Text` ला
`marathi.*` जोडा.**

### Screen-पातळीचा scale (`typography`)

| Token | Size | Weight | Line | कुठे |
|---|---|---|---|---|
| `headingXL` | 30 | Bold | 38 | Screen title |
| `headingL` | 24 | SemiBold | 32 | Section title, मोठा आकडा |
| `titleL` | 20 | SemiBold | 28 | Card title |
| `bodyL` | 16 | Regular | 24 | मुख्य मजकूर |
| `bodyM` | 15 | Regular | 22 | नेहमीचा मजकूर |
| `bodyS` | 14 | Regular | 20 | Meta |
| `caption` | 13 | Regular | 18 | सर्वात लहान |

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

**Radius:** `xs` 4 · `sm` 8 · `buttonSmall` 10 · `md` 12 · `chip` 14 ·
**`button` 14** · `lg` 16 · **`card` 18** · `xl` 20 · `xxl` 24 · `full` 999

कार्डांना `radius.card` (18) आणि बटणांना `radius.button` (14) — spec ने हे दोन
वेगळे दिले आहेत, म्हणून त्यांचे स्वतःचे tokens.

**Shadow** — `boxShadow` वापरतो, जुने `shadowColor`/`shadowOffset` नाहीत (RN 0.86
वर ते deprecated आहेत आणि web bundler ओरडतो).

| Token | मूल्य | कुठे |
|---|---|---|
| `shadow.card` | `0 4 24 rgba(30,41,59,.08)` | कार्डं — spec चं soft shadow |
| `shadow.cardRaised` | `0 8 24 rgba(30,41,59,.10)` | उचललेली कार्डं, banner |
| `shadow.button` | `0 4 12 rgba(91,61,245,.24)` | भरीव primary buttons |

---

## ४. मापं (`layout`)

**रुंदी खऱ्या पडद्यावरून मोजायची, 360 गृहीत धरायची नाही.** Sheet चा स्वतःचा
implementation guide हेच सांगतो. 360dp हा फक्त डिझाइनचा आधार आहे, नियम नाही.

```
cardWidth     = screenWidth − 40          // 360 वर 320
halfCardWidth = (screenWidth − 52) / 2    // दोन प्रति ओळ
```

Screen padding **20** · Card padding **16** · Header **80** ·
Bottom nav **56** (+ safe area) · Button **52** (secondary 44) ·
Category chip **36** · Status chip **28** · Badge **24** · Search **48** ·
Nav icon **24** · Card icon **28** · Home tile **92** · Carousel **180**

---

## ५. घटक

**चिन्हं Lucide** — `components/ui/icon.tsx` मधून. Screens मध्ये Lucide चा घटक
थेट आयात करायचा नाही; तिथला नकाशा वापरायचा, म्हणजे एकाच गोष्टीला सगळीकडे एकच
चिन्ह राहतं.


| घटक | माप | टिप्पणी |
|---|---|---|
| Button (primary) | उंची 52, r14, भरीव | `full` = पूर्ण रुंदी |
| Button (secondary) | उंची 44 | कार्डाच्या आत |
| Buy button | 96×40, r12 | फक्त series कार्डावर |
| Category chip | उंची 36, r20 | आडवं scroll, active = भरीव primary |
| Status chip | उंची 28, r14 | फिकट पार्श्वभूमी + गडद मजकूर |
| Tag / badge | उंची 24, r8, padding 4×10 | "70 Tests", "Bilingual" |
| Card | r18, `shadow.card`, padding 16 | |
| Banner | r24, उंची 170 | |
| Progress track | उंची 6, r-full | रिकामा = `border` |

### Series कार्डाची तीन रूपं

- **`featured`** 160×235 — आडव्या पट्टीत, वर रंगीत आवरण, खाली "View Details"
- **`popular`** पूर्ण रुंदी — डावीकडे आवरण, उजवीकडे मजकूर + Buy Now
- **`buy`** किमान उंची 112, 72dp चिन्ह — "Buy Test Series" screen साठी

---

## ६. Navigation

**चार सपाट tabs, हाच क्रम, सगळीकडे:**

```
Home · My Course · Free Test · Profile
```

उंची 56dp + safe area. Icon 24dp, label 11sp Medium.
Active = `primary` रंग + खाली 4dp ठिपका. मधला उंचावलेला गोल button नाही.

> **बदलाची नोंद.** 2026-07-29 ला पाच tabs गोठवले होते
> (`Home · Learn · Tests · Analytics · Profile`). 2026-08-01 च्या मुख्य पानाच्या
> design मध्ये ते चार झाले आणि तो बदल **जाणीवपूर्वक स्वीकारला** — मुख्य पान आता
> tiles वर उभं आहे, म्हणून Learn आणि Analytics ला स्वतःचा tab लागत नाही.
>
> नोंद ठेवली आहे कारण **का बदललं** हे दिसलं पाहिजे. नियम तोच राहतो: tab bar
> प्रत्येक screen वर दिसतो, म्हणून तो एका design sheet मागे बदलायचा नाही —
> बदलायचा तर तो स्वतंत्र निर्णय म्हणून.

### Learn, Analytics, Bookmarks कुठे गेले

Tabs मधून निघाले, पण पानं तशीच आहेत. दोन मार्ग:

- **Tiles** — मुख्य पानावरचे आठ शॉर्टकट (PDF Notes → Learn, चालू घडामोडी → …)
- **☰ drawer** — `components/ui/drawer.tsx`. Analytics आणि Bookmarks ला tile
  नाही, त्यामुळे **drawer हाच त्यांचा एकमेव मार्ग आहे** — तो काढला तर ती पानं
  अस्तित्वात असूनही पोहोचता येणार नाहीत.

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
