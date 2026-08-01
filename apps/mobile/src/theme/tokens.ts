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
  primary: '#EF4444',
  primaryDark: '#DC2626',
  primaryLight: '#FFECEC',

  background: '#F8F9FD',
  surface: '#FFFFFF',

  blue: '#3B82F6',
  /** ONLINE TEST sheet मधलं Info — blue सारखाच, पण नावाने वेगळा वापर. */
  info: '#3B82F6',
  green: '#22C55E',
  orange: '#F59E0B',
  purple: '#7C3AED',
  teal: '#14B8A6',
  pink: '#DB2777',

  text: '#111827',
  textSecondary: '#64748B',
  border: '#E5E7EB',
  /** याद्यांमधली फिकट रेघ — sheet मध्ये कडेपेक्षा फिकट. */
  divider: '#F1F5F9',

  success: '#22C55E',
  /**
   * ⚠️ `error` आणि `primary` **एकच रंग आहेत** — sheet मध्ये दोन्ही #EF4444.
   * म्हणून: **भरीव लाल = पुढे जा** (CTA, active tab). चूक कधीच भरीव बटण म्हणून
   * दाखवायची नाही — चिन्ह + मजकूर + फिकट पार्श्वभूमी, एवढंच.
   */
  error: '#EF4444',
  danger: '#EF4444',
  warning: '#F59E0B',

  textInverse: '#FFFFFF',
  /** Bottom nav मधला निष्क्रिय रंग — sheet मध्ये वेगळा दिलेला आहे. */
  navInactive: '#6B7280',
  /** Logo मधला गडद निळा ("TIMES"). Palette मध्ये सुटा नाही, पण logo शिवाय
   *  दुसरीकडे वापरायचा नाही. */
  navy: '#12277D',

  // फिकट छटा — status chips आणि चिन्हांच्या मागे.
  successLight: '#F0FDF4',
  dangerLight: '#FFECEC',
  errorLight: '#FFECEC',
  warningLight: '#FFFBEB',
  primarySoft: '#FFF5F5',
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
export const screenAccent = {
  /** ONLINE TEST — PDF Notes सारखाच जांभळा संच. */
  onlineTest: {
    primary: '#5B3DF5',
    primaryDark: '#4427D6',
    primaryLight: '#F3F0FF',
  },
  /** Home — Home design sheet मधून. */
  home: {
    primary: '#EF4444',
    primaryDark: '#DC2626',
    primaryLight: '#FFECEC',
  },
  /** PDF Notes — त्याच्या sheet मधून. */
  pdfNotes: {
    primary: '#5B3DF5',
    primaryDark: '#4427D6',
    primaryLight: '#F3F0FF',
  },
} as const;

export const gradients = {
  /** Home च्या banner ची पार्श्वभूमी. */
  banner: ['#FFECEC', '#FFF5F5'] as const,
  /** PDF Notes च्या banner ची — त्याच्या sheet मधून. */
  notesBanner: ['#F5F0FF', '#FFFFFF'] as const,
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

/** Sheet मधल्या सहा शैली, जशाच्या तशा. */
export const typography = {
  /** Screen title — 34 / ExtraBold */
  headingXL: { fontSize: 34, fontFamily: fonts.extrabold, lineHeight: 44 },
  /** Section title — 22 / SemiBold */
  headingL: { fontSize: 22, fontFamily: fonts.semibold, lineHeight: 30 },
  /** Card title — 18 / Bold */
  titleL: { fontSize: 18, fontFamily: fonts.bold, lineHeight: 26 },
  /** Body — 16 / Regular */
  bodyL: { fontSize: 16, fontFamily: fonts.regular, lineHeight: 24 },
  bodyM: { fontSize: 16, fontFamily: fonts.regular, lineHeight: 24 },
  /** Caption — 14 / Regular */
  bodyS: { fontSize: 14, fontFamily: fonts.regular, lineHeight: 20 },
  caption: { fontSize: 14, fontFamily: fonts.regular, lineHeight: 20 },
} as const;

export const componentType = {
  cardTitle: { fontSize: 18, fontFamily: fonts.bold, lineHeight: 26 },
  cardDescription: { fontSize: 14, fontFamily: fonts.regular, lineHeight: 20 },
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
