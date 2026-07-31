/**
 * खरेदीचं आणि access च्या मुदतीचं गणित.
 *
 * हे इथे आहे कारण **दोन ठिकाणांहून** लागतं: NestJS API (mobile app ची खरेदी) आणि
 * Next.js website (dashboard वरची खरेदी). पैशाशी संबंधित गणित दोन ठिकाणी वेगळं
 * लिहिलं की ते हळूहळू वेगळं वागायला लागतं — आणि मग एका बाजूने 6 महिने, दुसऱ्या
 * बाजूने 12 असं होतं. तेच टाळायला एकच जागा, आणि त्यावर tests.
 */

/**
 * आजपासून `validityMonths` महिन्यांनी मुदत संपते.
 *
 * `0` (किंवा त्याहून कमी) म्हणजे **कायमस्वरूपी** — तेव्हा `null`. Entitlement
 * तपासणी `null` ला "कधीच संपत नाही" असं वाचते, म्हणून हे दोन्ही जुळतात.
 *
 * `setMonth` महिन्याचे वेगवेगळे दिवस स्वतः सांभाळतो: 31 जानेवारीला एक महिना
 * जोडला की JavaScript 3 मार्च करतो (फेब्रुवारीत 31 तारीख नाही म्हणून पुढे
 * ढकलतो). विद्यार्थ्याच्या बाजूने तो एक-दोन दिवस **जास्त** आहे, कमी नाही —
 * म्हणून तो चालेल. उलट दिशेने चुकलं असतं तर तक्रार आली असती.
 */
export function accessExpiryFor(validityMonths: number, from: Date = new Date()): Date | null {
  if (validityMonths <= 0) return null;
  const d = new Date(from);
  d.setMonth(d.getMonth() + validityMonths);
  return d;
}

/**
 * ही access अजून चालू आहे का.
 *
 * `null` = कायमस्वरूपी, म्हणून चालू. सीमेवर उदार नाही — नेमक्या क्षणी संपलेली
 * संपलेलीच धरतो, नाहीतर "मुदत संपली" ही स्थिती कधीच खरी होत नाही.
 * (`evaluateAttemptAccess` मध्ये तीच अट `expiresAt <= now` अशी आहे.)
 */
export function isAccessLive(expiresAt: Date | null, now: Date = new Date()): boolean {
  return expiresAt === null || expiresAt > now;
}

/**
 * सवलत किती टक्के — `mrpInPaise` दिला असेल तरच.
 *
 * खाली पूर्णांक घेतो: 33.9% ला "34% OFF" दाखवलं तर तो थोडा फुगवलेला वाटतो.
 * MRP किंमतीपेक्षा कमी किंवा तेवढाच असेल तर सवलत नाही — तेव्हा `null`, म्हणजे
 * app "0% OFF" असं विचित्र काही दाखवत नाही.
 */
export function discountPercent(
  priceInPaise: number,
  mrpInPaise: number | null
): number | null {
  if (mrpInPaise === null || mrpInPaise <= priceInPaise) return null;
  const off = Math.floor(((mrpInPaise - priceInPaise) / mrpInPaise) * 100);
  return off > 0 ? off : null;
}
