/**
 * चालू घडामोडींसाठी सुरुवातीचे गट आणि काही नमुना लेख.
 *
 * `seed.ts` पेक्षा वेगळा आणि **मुद्दाम.** तो सुरुवातीलाच `deleteMany` ने सगळं
 * मिटवतो; हा **काहीच मिटवत नाही** — फक्त "नसेल तर बनव" करतो, आणि पुन्हा पुन्हा
 * चालवला तरी तेच निकाल देतो. Database सामायिक आहे (website आणि app दोन्ही तोच
 * वापरतात), म्हणून ही खबरदारी.
 *
 *   npm run seed:current-affairs --workspace @mahatest/db
 *
 * लेख `published: true` आहेत, म्हणजे app मध्ये लगेच दिसतात. नको असतील तर
 * admin मधून अप्रकाशित करा किंवा हा script चालवूच नका.
 */
import path from 'node:path';

import { PrismaClient } from '@prisma/client';

/**
 * `.env` इथे स्वतः वाचावा लागतो.
 *
 * `prisma.config.ts` तो वाचतो, पण तो फक्त `prisma` CLI चालवताना लागतो — हा
 * script सरळ `tsx` ने चालतो, म्हणून तिथपर्यंत पोहोचतच नाही आणि
 * "Environment variable not found: DATABASE_URL" येतं.
 *
 * क्रम `prisma.config.ts` सारखाच: आधी repo च्या मुळाशी, मग स्थानिक. दोन्ही
 * नसतील तर environment आधीच भरलेलं आहे असं गृहीत धरायचं (उदा. CI).
 */
for (const candidate of [path.join(__dirname, '..', '..', '..', '.env'), '.env']) {
  try {
    process.loadEnvFile(candidate);
    break;
  } catch {
    // पुढचा प्रयत्न.
  }
}

const prisma = new PrismaClient();

/**
 * Design sheet मधले गट, तोच क्रम.
 *
 * दोन नावं मुद्दाम: वरचे chips design मध्ये **इंग्रजीत** आहेत, पण cards वरचा tag
 * आणि खालची वर्तुळं **मराठीत**. रंग `tokens.ts` मधल्या मूल्यांशी जुळवले आहेत,
 * म्हणजे एकाच गटाचा रंग app भर एकच दिसतो.
 */
const CATEGORIES = [
  { name: 'राष्ट्रीय', nameEn: 'National', slug: 'national', icon: 'flag', color: '#F59E0B', orderIndex: 1 },
  { name: 'आंतरराष्ट्रीय', nameEn: 'International', slug: 'international', icon: 'globe', color: '#0EA5E9', orderIndex: 2 },
  { name: 'अर्थव्यवस्था', nameEn: 'Economy', slug: 'economy', icon: 'cash', color: '#10B981', orderIndex: 3 },
  { name: 'विज्ञान व तंत्रज्ञान', nameEn: 'Science & Tech', slug: 'science-tech', icon: 'planet', color: '#8B5CF6', orderIndex: 4 },
  { name: 'संरक्षण', nameEn: 'Defence', slug: 'defence', icon: 'shield', color: '#4F46E5', orderIndex: 5 },
];

/**
 * नमुना लेख — design sheet मधलीच शीर्षकं.
 *
 * `daysAgo` वापरला आहे, ठरलेल्या तारखा नाहीत: script कधीही चालवला तरी यादी
 * "अलीकडची" दिसावी. सगळ्यांना एकच वेळ दिली तर क्रम बेभरवशाचा होतो, म्हणून
 * प्रत्येकाला वेगळा तास.
 */
const ARTICLES = [
  {
    slug: 'g20-shikhar-parishad-sampanna',
    title: 'भारताची G20 शिखर परिषद यशस्वीरित्या संपन्न',
    categorySlug: 'national',
    isTopNews: true,
    daysAgo: 0,
    excerpt:
      'G20 शिखर परिषद नवी दिल्ली येथे यशस्वीरित्या पार पडली. जागतिक नेत्यांची महत्त्वपूर्ण चर्चा झाली.',
    body: `G20 शिखर परिषद नवी दिल्ली येथे यशस्वीरित्या पार पडली. या परिषदेत जगभरातील प्रमुख अर्थव्यवस्थांचे नेते सहभागी झाले होते.

परिषदेत हवामान बदल, डिजिटल अर्थव्यवस्था, अन्नसुरक्षा आणि विकसनशील देशांचे कर्ज या विषयांवर सविस्तर चर्चा झाली. भारताने आफ्रिकन युनियनला G20 चे कायमस्वरूपी सदस्यत्व देण्याचा प्रस्ताव मांडला, तो एकमताने मंजूर झाला.

परीक्षेच्या दृष्टीने महत्त्वाचे मुद्दे — G20 ची स्थापना 1999 मध्ये झाली. भारताचे अध्यक्षपद 1 डिसेंबर 2022 ते 30 नोव्हेंबर 2023 या काळात होते. या परिषदेची संकल्पना "वसुधैव कुटुम्बकम् — One Earth, One Family, One Future" अशी होती.

नवी दिल्ली जाहीरनाम्यात शाश्वत विकास ध्येयांना गती देणे, हरित विकासाचा करार आणि बहुपक्षीय विकास बँकांमध्ये सुधारणा या तीन गोष्टींवर भर देण्यात आला.`,
  },
  {
    slug: 'navin-shikshan-dhoran-2024-manjuri',
    title: 'केंद्र सरकारने नवीन शिक्षण धोरण 2024 ला मंजुरी दिली',
    categorySlug: 'national',
    isTopNews: false,
    daysAgo: 0,
    excerpt: 'शालेय आणि उच्च शिक्षणात मोठे बदल सूचित करणाऱ्या धोरणाला मंत्रिमंडळाची मान्यता.',
    body: `केंद्रीय मंत्रिमंडळाने नवीन शिक्षण धोरणाच्या पुढील टप्प्याला मंजुरी दिली आहे. यात शालेय शिक्षणाची रचना, मूल्यमापन पद्धती आणि उच्च शिक्षणातील प्रवेशप्रक्रिया यांमध्ये बदल सूचित करण्यात आले आहेत.

मातृभाषेतून प्राथमिक शिक्षण, व्यावसायिक शिक्षणाचा शालेय अभ्यासक्रमात समावेश, आणि पदवी अभ्यासक्रमात बहुविध प्रवेश-निर्गमन (multiple entry-exit) या तरतुदी महत्त्वाच्या मानल्या जात आहेत.

स्पर्धा परीक्षांसाठी लक्षात ठेवा — शिक्षण हा संविधानाच्या समवर्ती सूचीतील (Concurrent List) विषय आहे. 42व्या घटनादुरुस्तीने (1976) तो राज्य सूचीतून समवर्ती सूचीत हलवला.`,
  },
  {
    slug: 'chin-dragon-ai-chip-launch',
    title: "चीनमध्ये नवीन कृत्रिम बुद्धिमत्ता चिप 'Dragon AI' लाँच",
    categorySlug: 'international',
    isTopNews: true,
    daysAgo: 1,
    excerpt: 'स्वदेशी बनावटीची AI चिप जाहीर; सेमीकंडक्टर क्षेत्रातील स्वावलंबनाकडे पाऊल.',
    body: `चीनने स्वदेशी बनावटीची नवीन कृत्रिम बुद्धिमत्ता चिप जाहीर केली आहे. आयात केलेल्या प्रगत चिपवरील अवलंबित्व कमी करण्याच्या दिशेने हे महत्त्वाचे पाऊल मानले जात आहे.

जागतिक सेमीकंडक्टर पुरवठा साखळीत काही मोजक्या देशांचे वर्चस्व आहे. या पार्श्वभूमीवर अनेक देश स्वतःची उत्पादनक्षमता उभारण्याचा प्रयत्न करत आहेत.

भारताच्या संदर्भात — India Semiconductor Mission अंतर्गत देशात चिप निर्मिती आणि जुळणी प्रकल्पांना प्रोत्साहन दिले जात आहे.`,
  },
  {
    slug: 'rbi-repo-dar-kayam',
    title: 'RBI ने रेपो दरात कोणताही बदल केला नाही',
    categorySlug: 'economy',
    isTopNews: false,
    daysAgo: 1,
    excerpt: 'पतधोरण समितीने रेपो दर स्थिर ठेवला; महागाईवर लक्ष ठेवण्याचे संकेत.',
    body: `भारतीय रिझर्व्ह बँकेच्या पतधोरण समितीने (MPC) रेपो दरात कोणताही बदल न करण्याचा निर्णय घेतला. महागाईचा दर लक्ष्याच्या पट्ट्यात राखण्यावर भर देण्यात येईल असे स्पष्ट करण्यात आले.

संकल्पना समजून घ्या — **रेपो दर** म्हणजे ज्या दराने व्यापारी बँका RBI कडून अल्पमुदतीचे कर्ज घेतात. **रिव्हर्स रेपो** म्हणजे RBI बँकांकडून पैसे घेते तो दर. रेपो दर वाढला की कर्जे महाग होतात आणि मागणी आवरली जाते.

पतधोरण समितीत सहा सदस्य असतात — तीन RBI चे आणि तीन सरकारने नेमलेले. गव्हर्नर अध्यक्ष असतात आणि समसमान मते पडल्यास त्यांना निर्णायक मत असते. महागाईचे लक्ष्य 4% आहे, दोन्ही बाजूंना 2% ची मुभा.`,
  },
  {
    slug: 'isro-eos-08-prakshepit',
    title: "ISRO चं नवीन उपग्रह 'EOS-08' यशस्वीरित्या प्रक्षेपित",
    categorySlug: 'science-tech',
    isTopNews: true,
    daysAgo: 2,
    excerpt: 'पृथ्वी निरीक्षण उपग्रहाचे यशस्वी प्रक्षेपण; हवामान आणि आपत्ती व्यवस्थापनात उपयोग.',
    body: `भारतीय अंतराळ संशोधन संस्थेने पृथ्वी निरीक्षण उपग्रहाचे यशस्वी प्रक्षेपण केले. हा उपग्रह हवामान निरीक्षण, आपत्ती व्यवस्थापन आणि पर्यावरणविषयक माहिती संकलनासाठी वापरला जाणार आहे.

प्रक्षेपण श्रीहरिकोटा येथील सतीश धवन अंतराळ केंद्रातून करण्यात आले.

परीक्षेसाठी महत्त्वाचे — ISRO ची स्थापना 1969 मध्ये झाली, मुख्यालय बंगळुरू येथे आहे. भारताचा पहिला उपग्रह आर्यभट्ट (1975). प्रक्षेपण केंद्रे: श्रीहरिकोटा (आंध्र प्रदेश) आणि थुंबा (केरळ, मुख्यत्वे संशोधन रॉकेटसाठी).`,
  },
  {
    slug: 'sanrakshan-swadeshi-kharedi-manjuri',
    title: 'संरक्षण मंत्रालयाकडून स्वदेशी खरेदी प्रस्तावांना मंजुरी',
    categorySlug: 'defence',
    isTopNews: false,
    daysAgo: 3,
    excerpt: 'देशांतर्गत उत्पादनाला चालना देणाऱ्या खरेदी प्रस्तावांना संरक्षण खरेदी परिषदेची मान्यता.',
    body: `संरक्षण खरेदी परिषदेने देशांतर्गत उत्पादकांकडून खरेदीच्या प्रस्तावांना मंजुरी दिली आहे. 'आत्मनिर्भर भारत' अंतर्गत संरक्षण उत्पादनात स्वावलंबन वाढवण्याचे धोरण आहे.

लक्षात ठेवा — संरक्षण खरेदी परिषदेचे (DAC) अध्यक्ष संरक्षणमंत्री असतात. Defence Acquisition Procedure अंतर्गत खरेदीचे वर्ग ठरवले जातात, ज्यात स्वदेशी बनावटीला प्राधान्य देणारे वर्ग वरचे असतात.`,
  },
];

async function main() {
  // ── गट ──
  for (const c of CATEGORIES) {
    await prisma.articleCategory.upsert({
      where: { slug: c.slug },
      /**
       * नाव, चिन्ह आणि रंग admin ने बदलले असतील तर ते जपायचे — म्हणून ते इथे
       * नाहीत. `nameEn` मात्र भरतो: तो नंतर जोडलेला column आहे आणि आधी बनलेल्या
       * गटांमध्ये null आहे. रिकामं `update: {}` ठेवलं असतं तर तो null च राहिला
       * असता आणि chips मराठीत दिसले असते.
       */
      update: { nameEn: c.nameEn },
      create: c,
    });
  }
  const categories = await prisma.articleCategory.findMany({
    select: { id: true, slug: true },
  });
  const idBySlug = new Map(categories.map((c) => [c.slug, c.id]));
  console.log(`गट तयार: ${categories.length}`);

  // ── लेख ──
  let added = 0;
  for (const a of ARTICLES) {
    const categoryId = idBySlug.get(a.categorySlug);
    if (!categoryId) {
      console.warn(`गट सापडला नाही, लेख वगळला: ${a.slug}`);
      continue;
    }

    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - a.daysAgo);
    // एकाच दिवसाच्या लेखांचा क्रम ठरलेला राहावा म्हणून वेगवेगळे तास.
    publishedAt.setHours(9 + ARTICLES.indexOf(a), 0, 0, 0);

    const existing = await prisma.article.findUnique({
      where: { slug: a.slug },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.article.create({
      data: {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        body: a.body,
        categoryId,
        isTopNews: a.isTopNews,
        published: true,
        publishedAt,
      },
    });
    added += 1;
  }

  const total = await prisma.article.count({ where: { published: true } });
  console.log(`नवीन लेख: ${added} | एकूण प्रकाशित: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
