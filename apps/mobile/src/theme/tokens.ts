/**
 * Design tokens — MahaTest mockups मधून काढलेले.
 *
 * 19 screens मध्ये एकसारखं दिसण्यासाठी रंग/अंतर/आकार **इथेच** ठरतात. Screen files
 * मध्ये hex code किंवा सुटे आकडे लिहायचे नाहीत — नेहमी इथून घ्यायचे.
 *
 * NativeWind वापरलेलं नाही: Expo SDK 57 / RN 0.86 वर त्याचा support अजून confirmed
 * नाही (v4 जुना, v5 pre-release). StyleSheet + हे tokens तेवढंच control देतात.
 */

export const colors = {
  /** Primary actions: Login button, active tab, links, selected option. */
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primarySoft: '#EFF6FF',

  /** बरोबर उत्तर, पूर्ण झालेलं, वाढ. */
  success: '#10B981',
  successSoft: '#ECFDF5',

  /** Logo चा teal — Learn/Current Affairs चे accents. */
  teal: '#14B8A6',

  /** Maths/analytics accents. */
  purple: '#8B5CF6',
  purpleSoft: '#F5F3FF',

  /** Marked for review, streak, warning. */
  warning: '#F59E0B',
  warningSoft: '#FFFBEB',

  /** चुकीचं उत्तर, End Test, घसरण. */
  danger: '#EF4444',
  dangerSoft: '#FEF2F2',

  /** Screen background — शुभ्र पांढरा नाही, हलका निळसर करडा. */
  background: '#F5F7FA',
  surface: '#FFFFFF',
  border: '#E2E8F0',

  text: '#0F172A',
  textMuted: '#64748B',
  textFaint: '#94A3B8',
  textInverse: '#FFFFFF',
} as const;

/** 4-चा पट. Screen padding = `lg`, card च्या आत = `md`. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  /** Cards चा मानक आकार. */
  lg: 16,
  xl: 20,
  /** Chips आणि pills. */
  pill: 999,
} as const;

export const typography = {
  /** "Welcome Back!" */
  display: { fontSize: 32, fontWeight: '800' },
  /** Screen title. */
  h1: { fontSize: 24, fontWeight: '700' },
  /** Section heading — "Today's Progress". */
  h2: { fontSize: 19, fontWeight: '700' },
  /** Card title. */
  h3: { fontSize: 16, fontWeight: '600' },
  /** StatCard चा मोठा आकडा. */
  stat: { fontSize: 26, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyStrong: { fontSize: 15, fontWeight: '600' },
  caption: { fontSize: 13, fontWeight: '400' },
  /** Meta pills, tab labels. */
  micro: { fontSize: 11, fontWeight: '600' },
} as const;

/**
 * Cards ला हलकी सावली — mockups मध्ये सावली अगदी मंद आहे, ठळक नाही.
 *
 * जुने `shadowColor`/`shadowOffset` props वापरलेले नाहीत — RN 0.86 वर ते deprecated
 * आहेत आणि web bundler warning देतो. `boxShadow` तिन्ही platforms वर चालतो.
 */
export const shadow = {
  card: {
    boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.06)',
  },
  /** Bottom tab bar आणि raised center button. */
  raised: {
    boxShadow: '0px -2px 12px rgba(15, 23, 42, 0.12)',
  },
} as const;

/**
 * विषयाचा रंग — Result आणि Analytics मध्ये प्रत्येक subject ला ठरलेला रंग हवा,
 * नाहीतर दोन screens वर एकाच विषयाचे दोन रंग दिसतील.
 */
export const subjectColors: Record<string, string> = {
  'Current Affairs': colors.success,
  'Indian Polity': colors.purple,
  Geography: colors.primary,
  Economy: colors.warning,
  History: colors.danger,
  'Science & Tech': colors.teal,
  'General Studies': colors.primary,
  Maths: colors.purple,
  Marathi: colors.danger,
  GK: colors.primary,
};

export const subjectColor = (name: string) => subjectColors[name] ?? colors.textMuted;
