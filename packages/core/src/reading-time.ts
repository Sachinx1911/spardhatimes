/**
 * "3 min read" — लेख वाचायला किती वेळ लागेल.
 *
 * हा आकडा database मध्ये साठवलेला **नाही, मोजलेला आहे.** Field ठेवलं असतं तर
 * admin ला प्रत्येक लेखाला अंदाज लावावा लागला असता, आणि मजकूर नंतर वाढवला/कमी
 * केला की तो आकडा जुनाच राहिला असता — म्हणजे चुकीचा.
 */

/**
 * शब्द प्रति मिनिट.
 *
 * इंग्रजीसाठी सामान्यतः 200-250 धरतात. इथे 180 — देवनागरी जोडाक्षरांमुळे वाचन
 * थोडं संथ होतं, आणि चालू घडामोडींमध्ये तारखा, संस्थांची नावं आणि आकडे भरपूर
 * असतात; ते ओझरतं वाचता येत नाही. कमी अंदाज लावून विद्यार्थ्याचा हिरमोड
 * होण्यापेक्षा थोडा उदार अंदाज बरा.
 */
const WORDS_PER_MINUTE = 180;

export function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;

  // रिकामा लेख "0 min read" दाखवणं विचित्र दिसतं; किमान 1.
  if (words === 0) return 1;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/**
 * यादीत दाखवायचा सारांश.
 *
 * `excerpt` हे admin साठी ऐच्छिक ठेवलं आहे — रोज दहा लेख टाकताना प्रत्येकाला
 * वेगळा सारांश लिहायला लावणं म्हणजे तो रिकामाच राहील. नसेल तर मजकुराची सुरुवात
 * वापरतो.
 *
 * शब्दाच्या मधोमध कापत नाही — "भारताची G20 शिख…" असं दिसण्यापेक्षा आधीच्या
 * पूर्ण शब्दापर्यंत मागे येतो.
 */
export function articleExcerpt(
  excerpt: string | null,
  body: string,
  maxChars = 160
): string {
  const source = excerpt?.trim() || body.trim().replace(/\s+/g, ' ');
  if (source.length <= maxChars) return source;

  const cut = source.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');

  // एकही मोकळी जागा नसेल (फार लांब एकच शब्द) तर नाइलाजाने तिथेच कापतो.
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`;
}
