/**
 * Design tokens — दिलेल्या तीन design system sheets मधून.
 *
 * Screen files मध्ये hex code किंवा सुटे आकडे लिहायचे नाहीत — नेहमी इथून घ्यायचे.
 *
 * **तीन sheets मध्ये काही जागी विरोध होता, तो असा सोडवला:**
 * - Font: "Test Series" आणि "Buy Test Series" दोन्ही Poppins म्हणतात → Poppins.
 * - Type scale: Android 360dp च्या दोन sheets (28/22/18) विरुद्ध 390px च्या एका
 *   sheet (32/26/22). App Android-आधी आहे म्हणून 360dp चा scale global धरला.
 *   जिथे एखाद्या screen ने स्वतःचं वेगळं माप दिलं आहे (उदा. Buy card ची किंमत
 *   22/Bold) तिथे तेच वापरायचं — `componentType` बघा.
 * - Bottom nav: 56dp (दोन sheets) विरुद्ध 72px (एक) → 56.
 * - रंग तिन्ही sheets मध्ये तंतोतंत सारखे होते, त्यामुळे तिथे निवड करावी लागली नाही.
 *
 * NativeWind वापरलेलं नाही: Expo SDK 57 / RN 0.86 वर त्याचा support अजून
 * confirmed नाही (v4 जुना, v5 pre-release).
 */
import { useWindowDimensions } from 'react-native';

// ─── 1. COLOR PALETTE ────────────────────────────────────────────────────────

/**
 * ⚠️ `primary` आणि `danger` **दोन्ही लाल आहेत** — brand लाल आहे (logo बघा) आणि
 * चूकही लालच दाखवली जाते. ते मिसळू नयेत म्हणून:
 *
 * - **भरीव लाल = पुढे जा** (CTA, active tab)
 * - **चूक कधीच भरीव नसते** — चिन्ह + मजकूर + फिकट पार्श्वभूमी
 * - **नष्ट करणारी बटणं कडांची**, भरीव नाहीत
 */
export const colors = {
  // ── Brand — global design system (Royal Purple) ──
  primary: '#5B21B6',
  /** दाबलेलं बटण / गडद छटा. */
  primaryDark: '#4C1D95',
  /** Banner, चिन्हामागची जागा, निवडलेली कार्डं. */
  primaryLight: '#EDE9FE',
  /** ठळक मजकूर, CTA, badges — system चा Secondary. */
  secondary: '#7C3AED',
  /** Active indicator, chips — system चा Accent Purple. */
  accent: '#8B5CF6',

  background: '#F8FAFC',
  surface: '#FFFFFF',

  blue: '#3B82F6',
  /** Information / test statistics — system मध्ये वेगळा नावाने. */
  info: '#3B82F6',
  green: '#22C55E',
  orange: '#F59E0B',
  purple: '#7C3AED',
  /** चिन्हामागचा फिकट जांभळा. */
  purpleLight: '#EDE9FE',
  teal: '#14B8A6',
  pink: '#DB2777',

  text: '#111827',
  textSecondary: '#64748B',
  /** इशारे / अंधुक मजकूर — system चा Text Light. */
  textLight: '#94A3B8',
  border: '#E2E8F0',
  /** याद्यांमधली रेघ — system चा Divider. */
  divider: '#E5E7EB',
  /** अभ्यासक्रम विभाग — फिकट हिरवा आणि गडद हिरवा मजकूर. */
  syllabusBg: '#F0FDF4',
  syllabusBadgeBg: '#DCFCE7',
  syllabusText: '#15803D',

  success: '#22C55E',
  /**
   * Error आता primary पेक्षा **वेगळा रंग आहे** (लाल vs जांभळा) — global
   * system मध्ये तसं ठरलं. त्यामुळे जुनी "लाल = दोन्ही" ची अडचण संपली:
   * जांभळं = पुढे जा, लाल = चूक/delete/notification बिल्ला.
   */
  error: '#EF4444',
  danger: '#EF4444',
  warning: '#F59E0B',

  textInverse: '#FFFFFF',
  /** Bottom nav मधला निष्क्रिय रंग — system मध्ये वेगळा. */
  navInactive: '#6B7280',
  /** Logo मधला गडद निळा ("TIMES"). logo शिवाय दुसरीकडे वापरायचा नाही. */
  navy: '#12277D',

  // फिकट छटा — status chips आणि चिन्हांच्या मागे (system चे Icon Backgrounds).
  successLight: '#DCFCE7',
  dangerLight: '#FEE2E2',
  errorLight: '#FEE2E2',
  warningLight: '#FEF3C7',
  blueLight: '#DBEAFE',
  tealLight: '#CCFBF1',
  orangeLight: '#FEF3C7',
  primarySoft: '#F5F3FF',
} as const;

/**
 * वरची पट्टी spec मध्ये gradient आहे. दोन टोकं इथे ठेवली आहेत म्हणजे
 * `LinearGradient` ला देताना प्रत्येक screen मध्ये hex लिहावे लागत नाहीत.
 */
/**
 * **प्रत्येक screen चा स्वतःचा रंग** (ठरलं 2026-08-01).
 *
 * Design sheets प्रत्येक screen ला वेगळा primary देतात — Home लाल, PDF Notes
 * जांभळा. App भर एकच रंग लादण्याऐवजी तो screen-निहाय ठेवायचा ठरलं.
 *
 * **पण खालची पट्टी नाही.** Tab bar प्रत्येक screen वर दिसतो; त्याचा रंग
 * screen मागे बदलला तर तो लुकलुकल्यासारखा दिसेल. तो `colors.primary` वरच
 * राहतो — हे मुद्दाम.
 */
/**
 * चालू घडामोडींच्या गटांचे रंग — sheet मधून जसेच्या तसे.
 *
 * Admin प्रत्येक गटाला स्वतःचा रंग देऊ शकतो (`categoryColor`); तो दिलेला
 * नसेल तेव्हा नावावरून यातलाच एक निवडतो, म्हणजे तोच गट नेहमी त्याच रंगाचा.
 */
export const categoryColors = ['#8B5CF6', '#3882F6', '#22C55E', '#F97316'] as const;

/**
 * ⚠️ **एकच global रंग — सगळे screens एकसारखे (ठरलं 2026-08-02).**
 *
 * आधी प्रत्येक screen ला स्वतःचा primary होता (Home लाल, PDF Notes जांभळा).
 * Global design system आल्यावर तो निर्णय **रद्द** — आता सगळीकडे Royal Purple.
 *
 * हा object तसाच ठेवला आहे (काढला नाही) कारण ९ screens `screenAccent.<name>`
 * वापरतात; त्या सगळ्यांना हात न लावता इथे एकच संच दिला की पूर्ण app जांभळं
 * होतं. पुढे कधी खरंच screen-निहाय रंग हवा असेल तरच हे वेगळे करायचे.
 */
const BRAND = {
  primary: colors.primary, // #5B21B6 Royal Purple
  primaryDark: '#4C1D95',
  primaryLight: colors.primaryLight, // #EDE9FE
} as const;

export const screenAccent = {
  exam: BRAND,
  onlineTest: BRAND,
  home: BRAND,
  currentAffairs: BRAND,
  syllabus: BRAND,
  pdfNotes: BRAND,
} as const;

export const gradients = {
  /** Banner ची पार्श्वभूमी — global system चा #F5F3FF. सगळ्या screens वर तीच. */
  banner: ['#F5F3FF', '#FFFFFF'] as const,
  notesBanner: ['#F5F3FF', '#FFFFFF'] as const,
  heroPurple: ['#F5F3FF', '#EDE9FE'] as const,
} as const;

// ─── 2. TYPOGRAPHY (Mukta) ───────────────────────────────────────────────────

/**
 * **मुख्य font Mukta आहे**, Poppins नाही — sheet मध्ये सगळ्या शैली Mukta च्या
 * आहेत. App मराठी-प्रथम आहे आणि Mukta मध्ये देवनागरी आणि लॅटिन दोन्ही आहेत,
 * त्यामुळे एकाच font ने दोन्ही भाषा नीट दिसतात.
 *
 * Weights वेगवेगळ्या **families** आहेत, `fontWeight` नाही — Android वर
 * `fontWeight: '600'` ने SemiBold उचलला जात नाही, तो Regular ताणून दाखवतो.
 */
export const fonts = {
  regular: 'Mukta_400Regular',
  medium: 'Mukta_500Medium',
  semibold: 'Mukta_600SemiBold',
  bold: 'Mukta_700Bold',
  extrabold: 'Mukta_800ExtraBold',
} as const;

/**
 * Poppins अजून लोड होतो पण **नवीन screens मध्ये वापरायचा नाही**. जुन्या
 * screens त्यावर आहेत; त्या टप्प्याटप्प्याने Mukta वर आणायच्या.
 */
export const poppins = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

/**
 * Global design system चा typography scale — जशाच्या तसा.
 *
 * नावं जुनीच ठेवली आहेत (screens ती वापरतात), पण आकार आता global spec मधले:
 * Display 34, H2 24, Section 20, Card 18, Subtitle 16, Body 15, Description 14.
 */
export const typography = {
  /** Display / Banner — 34 / ExtraBold */
  headingXL: { fontSize: 34, fontFamily: fonts.extrabold, lineHeight: 42 },
  /** H2 — 24 / Bold */
  headingL: { fontSize: 24, fontFamily: fonts.bold, lineHeight: 32 },
  /** Card title — 18 / Bold */
  titleL: { fontSize: 18, fontFamily: fonts.bold, lineHeight: 26 },
  /** Subtitle — 16 / Medium */
  bodyL: { fontSize: 16, fontFamily: fonts.medium, lineHeight: 24 },
  /** Body — 15 / Regular */
  bodyM: { fontSize: 15, fontFamily: fonts.regular, lineHeight: 22 },
  /** Description — 14 / Regular */
  bodyS: { fontSize: 14, fontFamily: fonts.regular, lineHeight: 20 },
  /** Caption — 12 / Medium */
  caption: { fontSize: 12, fontFamily: fonts.medium, lineHeight: 18 },
} as const;

export const componentType = {
  cardTitle: { fontSize: 18, fontFamily: fonts.bold, lineHeight: 26 },
  cardDescription: { fontSize: 14, fontFamily: fonts.regular, lineHeight: 20 },
  /**
   * यादीतल्या ओळीचं शीर्षक — PDF नाव वगैरे. Design sheet नुसार **16 Medium**,
   * कार्ड-शीर्षकाच्या 18 Bold पेक्षा लहान. मोठी नावं दोन ओळींत बसावीत आणि
   * ओळ गरजेपेक्षा उंच होऊ नये म्हणून हे वेगळं.
   */
  listItemTitle: { fontSize: 16, fontFamily: fonts.medium, lineHeight: 22 },
  /** Button text — 18 / Bold */
  buttonText: { fontSize: 18, fontFamily: fonts.bold, lineHeight: 26 },
  badge: { fontSize: 12, fontFamily: fonts.medium, lineHeight: 16 },
  smallLabel: { fontSize: 12, fontFamily: fonts.regular, lineHeight: 16 },
  /** Bottom nav चं label. */
  /** रंगीत पट्टीतलं शीर्षक — 20sp SemiBold, पांढरं. */
  screenHeaderTitle: { fontSize: 20, fontFamily: fonts.semibold, lineHeight: 28 },
  /** Banner चं मोठं शीर्षक — 24sp ExtraBold. */
  bannerHeading: { fontSize: 24, fontFamily: fonts.extrabold, lineHeight: 32 },
  /** ONLINE TEST sheet: आकडा Bold 22sp. */
  statNumber: { fontSize: 22, fontFamily: fonts.bold, lineHeight: 28 },
  /** ONLINE TEST sheet: यादीतल्या ओळीचं शीर्षक — Medium 15sp. */
  rowTitle: { fontSize: 15, fontFamily: fonts.medium, lineHeight: 22 },
  /** ONLINE TEST sheet: बटणाचा मजकूर — SemiBold 14sp. */
  buttonSmall: { fontSize: 14, fontFamily: fonts.semibold, lineHeight: 20 },
  /** बिल्ल्यातला आकडा — 18dp चौकटीत मावेल एवढा. */
  badgeSmall: { fontSize: 10, fontFamily: fonts.bold, lineHeight: 14 },
  /** ओळीखालचा लहान आकडा / क्रिया. */
  actionLabel: { fontSize: 11, fontFamily: fonts.regular, lineHeight: 16 },
  navLabel: { fontSize: 12, fontFamily: fonts.medium, lineHeight: 16 },
  priceCurrent: { fontSize: 22, fontFamily: fonts.bold, lineHeight: 30 },
  priceOld: { fontSize: 14, fontFamily: fonts.medium, lineHeight: 20 },
  discount: { fontSize: 12, fontFamily: fonts.semibold, lineHeight: 16 },
} as const;

/** ठळक करायचं असेल तेव्हा — आकार तोच, family बदलते. */
export const strong = {
  medium: { fontFamily: fonts.medium },
  semibold: { fontFamily: fonts.semibold },
  bold: { fontFamily: fonts.bold },
  extrabold: { fontFamily: fonts.extrabold },
} as const;

/**
 * जुन्या screens मधून `marathi.*` वापरलं जातं. मुख्य font आता Mukta च आहे,
 * त्यामुळे हे वेगळं ठेवायची गरज उरली नाही — पण ते काढलं तर एकोणीस files
 * तुटतील, म्हणून तेच families इथून देतो.
 */
export const marathi = { ...strong, regular: { fontFamily: fonts.regular } } as const;

// ─── 3. SPACING (8dp grid) ───────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 56,
  '7xl': 64,
} as const;

// ─── 4. BORDER RADIUS ────────────────────────────────────────────────────────

export const radius = {
  /** Sheet चे पाच: 8 · 12 · 18 · 22 · 28. */
  sm: 8,
  md: 12,
  /** कार्डांचा नेहमीचा. */
  card: 18,
  lg: 22,
  xl: 28,
  /** गोल — chips, ठिपके, अवतार. */
  full: 999,

  // जुन्या screens मधून वापरले जाणारे — sheet च्या पाचांशी जोडलेले.
  xs: 8,
  buttonSmall: 12,
  chip: 12,
  button: 12,
  xxl: 28,
} as const;

// ─── 5. SHADOW (elevation) ───────────────────────────────────────────────────

/**
 * जुने `shadowColor`/`shadowOffset` props वापरलेले नाहीत — RN 0.86 वर ते
 * deprecated आहेत आणि web bundler warning देतो. `boxShadow` तिन्ही platforms वर.
 */
export const shadow = {
  /** Sheet चं card shadow: X0 Y8 blur8, 8% अपारदर्शकता. */
  card: { boxShadow: '0px 8px 8px rgba(17, 24, 39, 0.08)' },
  cardRaised: { boxShadow: '0px 8px 16px rgba(17, 24, 39, 0.10)' },
  button: { boxShadow: '0px 4px 12px rgba(239, 68, 68, 0.24)' },
} as const;

// ─── 6. LAYOUT ───────────────────────────────────────────────────────────────

/**
 * रुंदी खऱ्या पडद्यावरून मोजायची, 360 गृहीत धरायची नाही — sheet चा implementation
 * guide सुद्धा हेच सांगतो (`SCREEN_WIDTH - M_PADDING * 2`). 360 हा फक्त आधार आहे.
 */
export const layout = {
  /** Spec: screen padding 20dp. */
  screenPadding: 20,
  /** Spec: card padding 16dp — कार्डाच्या **आतलं** अंतर. */
  cardPadding: 16,

  headerHeight: 80,
  safeAreaTop: 24,
  safeAreaBottom: 16,

  topBannerHeight: 140,
  /** Home वरची सरकती पट्टी — जाहिरात आणि ताजे tests दोन्ही याच उंचीचे. */
  carouselHeight: 180,
  /** Home वरचे आठ शॉर्टकट — सगळे समान उंचीचे. */
  homeTileHeight: 92,
  continueCardHeight: 120,
  examCardHeight: 72,
  featureItemHeight: 64,
  listItemHeight: 72,
  /** Buy Test Series चं आडवं कार्ड. */
  buySeriesCardHeight: 112,
  buySeriesIcon: 72,

  chipHeight: 28,
  categoryChipHeight: 36,
  searchHeight: 48,
  badgeHeight: 24,

  /** Spec: 52dp. */
  buttonHeight: 52,
  /** PDF Notes sheet चं बटण — 44dp. Home पेक्षा बुटकं. */
  buttonHeightCompact: 44,

  // ── PDF Notes sheet मधली मापं ──
  /** रंगीत पट्टीचं शीर्षक — 56dp. */
  screenHeaderHeight: 56,
  /** विषयाची ओळ — 76dp. */
  subjectRowHeight: 76,
  /** ओळीतल्या चिन्हाची चौकट — 48dp. */
  iconBoxLarge: 48,
  /** खालचं promo कार्ड — 72dp, त्यातली चौकट 44dp. */
  promoHeight: 72,
  promoIconBox: 44,
  /** Sheet: सूचनांचा बिल्ला 18dp. */
  badgeSmall: 18,
  /** Banner च्या उजवीकडचं चित्र किती रुंद. */
  bannerArtWidth: 80,
  /** Sheet: promo चं बटण 96dp रुंद. मजकुराला उरलेली जागा मिळावी म्हणून निश्चित. */
  promoButtonWidth: 96,

  // ── ONLINE TEST sheet मधली मापं ──
  /** वरचं कार्ड — 128dp (PDF Notes च्या 140 पेक्षा बुटकं). */
  testBannerHeight: 128,
  /** चार आकड्यांची कार्डं — 80dp. */
  statCardHeight: 80,
  /** Test ची ओळ — 72dp, चिन्हाची चौकट 40dp. */
  testRowHeight: 72,
  iconBoxSmall: 40,
  /** Free/Paid switcher — 40dp उंच, गोल. */
  switcherHeight: 40,
  /** खालचं promo — 64dp. */
  testPromoHeight: 64,
  /** ओळीतलं छोटं बटण — sheet: 40dp. */
  buttonHeightSmall: 40,

  // ── MPSC / परीक्षा sheet मधली मापं ──
  /** वरचं वैशिष्ट्य कार्ड — 72dp. */
  featureCardHeight: 72,
  /** यादीतली ओळ — 64dp. */
  categoryRowHeight: 64,
  /** अभ्यासक्रमाची ओळ — 56dp. */
  syllabusRowHeight: 56,
  /** शीर्षकाखालची पट्टी — सक्रिय 28dp, निष्क्रिय 20dp, जाडी 4dp. */
  indicatorActiveWidth: 28,
  indicatorWidth: 20,
  indicatorHeight: 4,

  // ── Syllabus sheet मधली मापं ──
  /** वरचं कार्ड — 112dp. */
  heroBannerHeight: 112,
  /** विषयाची ओळ — 72dp. */
  syllabusSubjectRow: 72,
  /** "सर्व पहा" ओळ — 56dp. */
  viewAllRowHeight: 56,
  /** गोल चिन्हाची चौकट — 40dp. */
  iconCircle: 40,
  buttonSecondaryHeight: 44,
  buttonSmall: { width: 120, height: 40 },
  buyButton: { width: 96, height: 40 },

  /** Sheet: 74dp. */
  bottomNavHeight: 74,
  /** Active tab खालची दांडी. */
  navIndicatorHeight: 3,
  navIconSize: 24,
  /**
   * चिन्हाची चौकट.
   *
   * Sheet च्या COMPONENTS मध्ये 60×60 दिलं आहे, पण ते **मोठ्या कार्डांसाठी**
   * आहे. Home वरची tiles दोन प्रति ओळ आहेत — 360dp वर प्रत्येक 154dp — आणि
   * त्यात 60dp चौकट घातली तर मजकुराला जेमतेम 50dp उरतात आणि प्रत्येक नाव
   * कापलं जातं. Sheet च्या स्वतःच्या mockup मध्येही tile चं चिन्ह ~44dp आहे.
   */
  iconBox: 60,
  /** Home tiles मधली लहान चौकट. */
  tileIconBox: 44,
  cardIconSize: 28,
  chipIconSize: 18,
} as const;

// ─── विषयांचे रंग ────────────────────────────────────────────────────────────

/**
 * Result आणि Analytics मध्ये एकाच विषयाचा रंग एकच राहावा — दोन screens वर दोन
 * रंग दिसले तर विद्यार्थ्याला ते वेगळे विषय वाटतात.
 */
export const subjectColors: Record<string, string> = {
  'Current Affairs': colors.success,
  'Indian Polity': colors.primary,
  Geography: colors.blue,
  Economy: colors.warning,
  History: colors.danger,
  'Science & Tech': '#14B8A6',
  'General Studies': colors.primary,
  Maths: colors.purple,
  Marathi: colors.danger,
  GK: colors.primary,
};

export const subjectColor = (name: string) => subjectColors[name] ?? colors.textSecondary;

// ─── कार्डांची रुंदी ─────────────────────────────────────────────────────────

/**
 * कार्डांची रुंदी **hook मधून**, स्थिर मूल्य म्हणून नाही.
 *
 * आधी ती `Dimensions.get('window').width` ने module load च्या वेळी एकदाच मोजली
 * जात होती. ते चुकीचं होतं: तेव्हाची रुंदी कायमची चिकटून बसायची, आणि पडदा फिरला
 * किंवा बदलला तरी बदलत नव्हती. परिणाम — दोन प्रति ओळ बसणारी कार्डं एक प्रति
 * ओळ दिसू लागली, कारण जुनी मोठी रुंदी वापरली जात होती.
 *
 * `useWindowDimensions` प्रत्येक बदलावर पुन्हा मोजतो, म्हणून हा प्रश्न मुळातून
 * जातो.
 */
export function useCardWidths() {
  const { width } = useWindowDimensions();
  return {
    /** पूर्ण रुंदीचं कार्ड — 360dp वर 320. */
    cardWidth: width - layout.screenPadding * 2,
    /** दोन प्रति ओळ, मधे 12dp फट — 360dp वर 154 प्रत्येकी. */
    halfCardWidth: (width - layout.screenPadding * 2 - spacing.md) / 2,
  };
}
