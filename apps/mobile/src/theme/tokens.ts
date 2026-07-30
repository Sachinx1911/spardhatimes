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
import { Dimensions } from 'react-native';

// ─── 1. COLOR PALETTE ────────────────────────────────────────────────────────

export const colors = {
  primary: '#4F46E5',
  primaryLight: '#EDE9FE',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',

  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  background: '#F8FAFC',
  surface: '#FFFFFF',

  textInverse: '#FFFFFF',
  /** `danger` चं जुनं नाव — जुन्या screens साठी. */
  error: '#EF4444',

  // Sheets मध्ये सुटे नाहीत, पण chips/tags/कार्डांत दिसतात — फिकट छटा.
  successLight: '#ECFDF5',
  dangerLight: '#FEF2F2',
  errorLight: '#FEF2F2',
  warningLight: '#FFFBEB',
  /**
   * `primaryLight` पेक्षाही फिकट — पांढऱ्या कार्डांमध्ये वेगळं उठून दिसणारं कार्ड
   * (उदा. "Continue Your Test"). `primaryLight` तिथे वापरला तर तो chips आणि
   * tags शी गोंधळतो.
   */
  primarySoft: '#EEF2FF',
} as const;

// ─── 2. TYPOGRAPHY (Poppins) ─────────────────────────────────────────────────

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

/** Screen-पातळीवरचा scale (Android 360dp sheet). */
export const typography = {
  /** Screen title */
  headingXL: { fontSize: 28, fontFamily: fonts.bold, lineHeight: 36 },
  /** Section title */
  headingL: { fontSize: 22, fontFamily: fonts.semibold, lineHeight: 30 },
  /** Card title */
  titleL: { fontSize: 18, fontFamily: fonts.semibold, lineHeight: 26 },
  bodyL: { fontSize: 15, fontFamily: fonts.regular, lineHeight: 22 },
  bodyM: { fontSize: 14, fontFamily: fonts.regular, lineHeight: 20 },
  /** Body S / meta */
  bodyS: { fontSize: 12, fontFamily: fonts.regular, lineHeight: 18 },
  /** Caption / small */
  caption: { fontSize: 11, fontFamily: fonts.regular, lineHeight: 16 },
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
  lg: 16,
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
  /** Elevation 1 — यादीतली कार्डं. */
  card: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)' },
  /** Elevation 2 — उचललेली कार्डं, banner. */
  cardRaised: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)' },
  button: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.10)' },
} as const;

// ─── 6. LAYOUT ───────────────────────────────────────────────────────────────

const screenWidth = Dimensions.get('window').width;

/**
 * रुंदी खऱ्या पडद्यावरून मोजायची, 360 गृहीत धरायची नाही — sheet चा implementation
 * guide सुद्धा हेच सांगतो (`SCREEN_WIDTH - M_PADDING * 2`). 360 हा फक्त आधार आहे.
 */
export const layout = {
  screenWidth,
  screenPadding: 16,
  /** पूर्ण रुंदीचं कार्ड: 360dp वर 328. */
  cardWidth: screenWidth - 32,
  /** दोन प्रति ओळ: 360dp वर 160 प्रत्येकी (12dp फट). */
  halfCardWidth: (screenWidth - 16 * 2 - 12) / 2,

  headerHeight: 80,
  safeAreaTop: 24,
  safeAreaBottom: 16,

  topBannerHeight: 140,
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

  buttonHeight: 44,
  buttonSecondaryHeight: 40,
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
  Geography: '#0EA5E9',
  Economy: colors.warning,
  History: colors.danger,
  'Science & Tech': '#14B8A6',
  'General Studies': colors.primary,
  Maths: '#8B5CF6',
  Marathi: colors.danger,
  GK: colors.primary,
};

export const subjectColor = (name: string) => subjectColors[name] ?? colors.textSecondary;
