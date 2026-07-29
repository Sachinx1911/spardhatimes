/**
 * Design tokens — दिलेल्या design system प्रमाणे तंतोतंत.
 *
 * इथले आकडे **डिझाइनमधून जसेच्या तसे** आहेत, अंदाजाने नाहीत. Screen files मध्ये
 * hex code किंवा सुटे आकडे लिहायचे नाहीत — नेहमी इथून घ्यायचे. एखादं मूल्य इथे
 * नसेल तर ते डिझाइनमध्येही नाही; आधी विचारून घ्यायचं, स्वतः ठरवायचं नाही.
 *
 * NativeWind वापरलेलं नाही: Expo SDK 57 / RN 0.86 वर त्याचा support अजून
 * confirmed नाही (v4 जुना, v5 pre-release).
 */

// ─── 1. COLOR PALETTE ────────────────────────────────────────────────────────

export const colors = {
  primary: '#4F46E5',
  primaryLight: '#EDE9FE',
  success: '#10B981',
  background: '#F8FAFC',
  surface: '#FFFFFF',

  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  error: '#EF4444',
  warning: '#F59E0B',

  textInverse: '#FFFFFF',

  // Palette मध्ये नाहीत, पण डिझाइनमध्ये दिसतात — फिकट छटा (tags, soft चौकोन).
  successLight: '#ECFDF5',
  errorLight: '#FEF2F2',
  warningLight: '#FFFBEB',
} as const;

// ─── 2. TYPOGRAPHY (Inter) ───────────────────────────────────────────────────

/**
 * Inter चे weights वेगवेगळ्या font families आहेत, `fontWeight` नाही — Android वर
 * `fontWeight: '600'` ने Inter चा SemiBold उचलला जात नाही, तो नेहमीचा Regular
 * ताणून दाखवतो. म्हणून प्रत्येक शैलीत `fontFamily` स्पष्ट दिलं आहे.
 */
export const fonts = {
  regular: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  headingXL: { fontSize: 32, fontFamily: fonts.bold, lineHeight: 40 },
  headingL: { fontSize: 26, fontFamily: fonts.semibold, lineHeight: 34 },
  titleL: { fontSize: 20, fontFamily: fonts.semibold, lineHeight: 28 },
  bodyL: { fontSize: 15, fontFamily: fonts.regular, lineHeight: 22 },
  bodyM: { fontSize: 14, fontFamily: fonts.regular, lineHeight: 20 },
  bodyS: { fontSize: 13, fontFamily: fonts.regular, lineHeight: 18 },
  caption: { fontSize: 12, fontFamily: fonts.regular, lineHeight: 16 },
} as const;

/** ठळक करायचं असेल तेव्हा — आकार तोच, फक्त family बदलते. */
export const strong = {
  semibold: { fontFamily: fonts.semibold },
  bold: { fontFamily: fonts.bold },
} as const;

// ─── 3. SPACING (8px grid) ───────────────────────────────────────────────────

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

// ─── 4. RADIUS & SHADOW ──────────────────────────────────────────────────────

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 50,
} as const;

/**
 * जुने `shadowColor`/`shadowOffset` props वापरलेले नाहीत — RN 0.86 वर ते
 * deprecated आहेत आणि web bundler warning देतो. `boxShadow` तिन्ही platforms वर.
 */
export const shadow = {
  card: { boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)' },
  button: { boxShadow: '0px 2px 6px rgba(79, 70, 229, 0.15)' },
} as const;

// ─── 5. LAYOUT (implementation guide मधली मापं) ──────────────────────────────

export const layout = {
  /** iPhone 13/14 — डिझाइनचा आधार. */
  baseWidth: 375,
  screenPadding: 16,
  headerHeight: 80,
  heroHeight: 170,
  chipHeight: 40,
  chipPaddingH: 18,
  featuredCard: { width: 280, height: 235 },
  /** दोन ओळीत: 375 − 16×2 padding − 12 gap ≈ 171 प्रत्येकी. */
  examCard: { width: 171, height: 82 },
  popularCardHeight: 150,
  bottomNavHeight: 72,
  buttonHeight: 44,
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
  History: colors.error,
  'Science & Tech': '#14B8A6',
  'General Studies': colors.primary,
  Maths: '#8B5CF6',
  Marathi: colors.error,
  GK: colors.primary,
};

export const subjectColor = (name: string) => subjectColors[name] ?? colors.textSecondary;
