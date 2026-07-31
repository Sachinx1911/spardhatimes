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
  /** Brand लाल — logo आणि CTA मधला. */
  primary: '#E11B22',
  primaryDark: '#B4141A',
  primaryLight: '#FDECEC',
  /** Logo मधला गडद निळा — "TIMES" आणि काही चिन्हं. */
  navy: '#12277D',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',

  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E5E7EB',
  background: '#F8F9FD',
  surface: '#FFFFFF',

  textInverse: '#FFFFFF',
  /** `danger` चं जुनं नाव — जुन्या screens साठी. */
  error: '#EF4444',

  // Sheets मध्ये सुटे नाहीत, पण chips/tags/कार्डांत दिसतात — फिकट छटा.
  successLight: '#F0FDF4',
  dangerLight: '#FEF2F2',
  errorLight: '#FEF2F2',
  warningLight: '#FFFBEB',
  /**
   * `primaryLight` पेक्षाही फिकट — पांढऱ्या कार्डांमध्ये वेगळं उठून दिसणारं कार्ड
   * (उदा. "Continue Your Test"). `primaryLight` तिथे वापरला तर तो chips आणि
   * tags शी गोंधळतो.
   */
  primarySoft: '#F3F0FF',

  /**
   * Home वरच्या tile जाळीत आठ चौकोन आहेत आणि पाच मुख्य रंग पुरत नाहीत — दोन
   * tiles ला शेजारचाच रंग मिळाला असता आणि ते एकाच गटातले वाटले असते. म्हणून हे
   * दोन. सुटे hex म्हणून screen मध्ये लिहिलेले होते; नियम १ प्रमाणे token केले.
   *
   * हेच दोन रंग `subjectColors` मध्ये Maths आणि Geography ला आहेत — तेही आता
   * इथूनच घेतात, म्हणून एकच जागा.
   */
  accentViolet: '#8B5CF6',
  accentSky: '#0EA5E9',
  /** Spec मधले सुटे रंग — tiles आणि चिन्हांसाठी. */
  blue: '#2C7BE5',
  pink: '#D6217F',
  /** Home tiles चे रंग — design मधून तंतोतंत. */
  tileRed: '#E8232A',
  tileGreen: '#1DA750',
  tileOrange: '#F5911E',
  tileViolet: '#7C4DFF',
  tileTeal: '#12B5A5',
  tileAmber: '#FDB913',
} as const;

/**
 * वरची पट्टी spec मध्ये gradient आहे. दोन टोकं इथे ठेवली आहेत म्हणजे
 * `LinearGradient` ला देताना प्रत्येक screen मध्ये hex लिहावे लागत नाहीत.
 */
export const gradients = {
  /** Banner ची क्रीम पार्श्वभूमी — design मधल्या कार्डासारखी. */
  banner: ['#FFF7F0', '#FDE9EC'] as const,
} as const;

// ─── 2. TYPOGRAPHY (Poppins + Mukta) ─────────────────────────────────────────

/**
 * Poppins चे weights वेगवेगळ्या font families आहेत, `fontWeight` नाही — Android वर
 * `fontWeight: '600'` ने Poppins चा SemiBold उचलला जात नाही, तो Regular ताणून
 * दाखवतो. म्हणून प्रत्येक शैलीत `fontFamily` स्पष्ट दिलं आहे.
 */
export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

/**
 * मराठीसाठी Mukta — **हे मुद्दाम वेगळं आहे.**
 *
 * Poppins मध्ये देवनागरी अक्षरं नाहीत; मराठी मजकूर त्यात दिला की OS स्वतःचा
 * पर्यायी font घालतो आणि तो प्रत्येक फोनवर वेगळा दिसतो. Mukta देवनागरीसाठीच
 * बनवलेला आहे, म्हणून मराठी ओळी याने द्यायच्या.
 *
 * वापर: `{...typography.titleL, ...marathi.semibold}` — आकार तोच, फक्त family
 * बदलते.
 */
export const marathiFonts = {
  regular: 'Mukta_400Regular',
  medium: 'Mukta_500Medium',
  semibold: 'Mukta_600SemiBold',
  bold: 'Mukta_700Bold',
} as const;

export const marathi = {
  regular: { fontFamily: marathiFonts.regular },
  medium: { fontFamily: marathiFonts.medium },
  semibold: { fontFamily: marathiFonts.semibold },
  bold: { fontFamily: marathiFonts.bold },
} as const;

/** Screen-पातळीवरचा scale (Android 360dp sheet). */
export const typography = {
  /** Screen title */
  headingXL: { fontSize: 30, fontFamily: fonts.bold, lineHeight: 38 },
  /** Section title */
  headingL: { fontSize: 24, fontFamily: fonts.semibold, lineHeight: 32 },
  /** Card title */
  titleL: { fontSize: 20, fontFamily: fonts.semibold, lineHeight: 28 },
  /** Body */
  bodyL: { fontSize: 16, fontFamily: fonts.regular, lineHeight: 24 },
  bodyM: { fontSize: 15, fontFamily: fonts.regular, lineHeight: 22 },
  /** Caption */
  bodyS: { fontSize: 14, fontFamily: fonts.regular, lineHeight: 20 },
  caption: { fontSize: 13, fontFamily: fonts.regular, lineHeight: 18 },
} as const;

/**
 * Component-पातळीवरची मापं, "Buy Test Series" sheet मधून जशीच्या तशी.
 * किंमत आणि सवलत यांचा आकार global scale मध्ये बसत नाही — तो मुद्दाम मोठा आहे.
 */
export const componentType = {
  cardTitle: { fontSize: 16, fontFamily: fonts.semibold, lineHeight: 22 },
  cardDescription: { fontSize: 13, fontFamily: fonts.regular, lineHeight: 20 },
  badge: { fontSize: 11, fontFamily: fonts.medium, lineHeight: 16 },
  priceCurrent: { fontSize: 22, fontFamily: fonts.bold, lineHeight: 28 },
  priceOld: { fontSize: 14, fontFamily: fonts.medium, lineHeight: 20 },
  discount: { fontSize: 12, fontFamily: fonts.semibold, lineHeight: 16 },
  buttonText: { fontSize: 16, fontFamily: fonts.semibold, lineHeight: 22 },
  smallLabel: { fontSize: 11, fontFamily: fonts.regular, lineHeight: 16 },
  /** Bottom nav चं label */
  navLabel: { fontSize: 11, fontFamily: fonts.medium, lineHeight: 16 },
} as const;

/** ठळक करायचं असेल तेव्हा — आकार तोच, फक्त family बदलते. */
export const strong = {
  medium: { fontFamily: fonts.medium },
  semibold: { fontFamily: fonts.semibold },
  bold: { fontFamily: fonts.bold },
} as const;

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
  xs: 4,
  sm: 8,
  /** Button (small) — sheet मध्ये 10dp, grid वर नाही पण दिलेलं आहे. */
  buttonSmall: 10,
  md: 12,
  /** Chip / status — sheet मध्ये 14dp. */
  chip: 14,
  /** Button — spec: 14dp. */
  button: 14,
  lg: 16,
  /** Card — spec: 18dp. हाच कार्डांचा नेहमीचा radius. */
  card: 18,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

// ─── 5. SHADOW (elevation) ───────────────────────────────────────────────────

/**
 * जुने `shadowColor`/`shadowOffset` props वापरलेले नाहीत — RN 0.86 वर ते
 * deprecated आहेत आणि web bundler warning देतो. `boxShadow` तिन्ही platforms वर.
 */
export const shadow = {
  /** Spec चं soft shadow — blur 24, 8% अपारदर्शकता. कार्डांचं नेहमीचं. */
  card: { boxShadow: '0px 4px 24px rgba(30, 41, 59, 0.08)' },
  /** थोडं जास्त उचललेलं — banner, तरंगती कार्डं. */
  cardRaised: { boxShadow: '0px 8px 24px rgba(30, 41, 59, 0.10)' },
  /** Primary बटणाखाली त्याच रंगाची मऊ छटा. */
  button: { boxShadow: '0px 4px 12px rgba(91, 61, 245, 0.24)' },
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
  buttonSecondaryHeight: 44,
  buttonSmall: { width: 120, height: 40 },
  buyButton: { width: 96, height: 40 },

  bottomNavHeight: 56,
  navIconSize: 24,
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
  Geography: colors.accentSky,
  Economy: colors.warning,
  History: colors.danger,
  'Science & Tech': '#14B8A6',
  'General Studies': colors.primary,
  Maths: colors.accentViolet,
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
