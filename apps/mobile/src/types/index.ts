/**
 * App मध्ये फिरणाऱ्या गोष्टींचे आकार.
 *
 * हे मुद्दाम backend च्या Prisma models सारखेच ठेवले आहेत — आज dummy data यांच्या
 * आकारात बसतो, आणि उद्या API आली की तिचा प्रतिसाद तसाच बसेल. म्हणून screens ला
 * हात लावावा लागणार नाही, फक्त `src/data/mock.ts` जाईल.
 *
 * पैसे नेहमी **paise मध्ये Int** — रुपयांत float ठेवला की ₹99.99 चं 99.98999 होतं.
 */

export type TestState = 'UPCOMING' | 'OPEN' | 'CLOSED';
export type AttemptState = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Category {
  id: string;
  name: string;
}

/** MPSC, UPSC, SSC — series ज्या परीक्षेसाठी आहे. Category (GK/Maths) पेक्षा वरचा स्तर. */
export interface Exam {
  id: string;
  name: string;
  seriesCount: number;
  icon: string;
}

export interface TestSeries {
  id: string;
  title: string;
  /** दुकानातल्या कार्डावरची एका ओळीची ओळख. */
  subtitle?: string;
  description?: string;
  categoryName: string;
  examName: string;
  /** admin ने ठरवलेली एकूण संख्या — "2 / 20 Tests Completed" मधला 20. */
  plannedTotalTests: number;
  completedTests: number;
  /** 0 = मोफत. विकायची किंमत. */
  priceInPaise: number;
  /** छापील किंमत — सवलत दाखवायला. नसेल तर सवलत दाखवायची नाही. */
  mrpInPaise?: number;
  /**
   * खरेदीनंतर access किती महिने. ठरलं: **मुदत असेल** (कायमस्वरूपी नाही).
   * याचा अर्थ `TestSeriesAccess` ला `expiresAt` लागेल — बघा docs/PAID_TEST_SERIES_PLAN.md.
   */
  validityMonths: number;
  language: string;
  /** विद्यार्थ्याकडे access आहे का — नसेल तर store मध्ये "Buy" दिसतो. */
  owned: boolean;
  /** दुकानातल्या कार्डाचा रंग (admin ठरवेल). */
  coverColor?: string;
}

/** सवलतीचे टक्के — किंमत आणि MRP वरून. दोन्ही ठिकाणी सारखेच दिसावेत म्हणून इथे. */
export function discountPercent(series: TestSeries): number | null {
  if (!series.mrpInPaise || series.mrpInPaise <= series.priceInPaise) return null;
  return Math.round(((series.mrpInPaise - series.priceInPaise) / series.mrpInPaise) * 100);
}

/** paise → "₹799". भारतीय स्वल्पविरामासह. */
export function rupees(paise: number): string {
  return '₹' + Math.round(paise / 100).toLocaleString('en-IN');
}

export interface Test {
  id: string;
  slug: string;
  title: string;
  seriesTitle: string;
  categoryName: string;
  questionCount: number;
  durationMinutes: number;
  totalMarks: number;
  /** ISO string — API कडूनही असंच येईल. */
  releaseAt: string | null;
  state: TestState;
  attemptState: AttemptState;
  /** IN_PROGRESS असेल तर किती प्रश्न सुटले. */
  answeredCount?: number;
}

export interface Question {
  id: string;
  text: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  marks: number;
  /**
   * बरोबर उत्तर आणि खुलासा — हे **फक्त निकालाच्या वेळी** भरलेले येतात.
   * Test सुरू असताना API ने ते पाठवायचेच नाहीत, नाहीतर उत्तर उघड होतं.
   */
  correctAnswer?: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export interface SubjectScore {
  subject: string;
  questionCount: number;
  correct: number;
  score: number;
  maxScore: number;
}

export interface TestResult {
  attemptId: string;
  testTitle: string;
  /** मानवी ओळख क्रमांक — "#GK27124". */
  code: string;
  submittedAt: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  timeTakenSeconds: number;
  durationSeconds: number;
  /** किती टक्के विद्यार्थ्यांपेक्षा चांगलं. */
  percentile: number;
  subjects: SubjectScore[];
  /** शेवटच्या काही tests चे टक्के — accuracy trend साठी. */
  trend: { label: string; percentage: number }[];
}

export interface Article {
  id: string;
  title: string;
  categoryName: string;
  publishedAt: string;
  readMinutes: number;
  imageUrl?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentId: string;
  memberSince: string;
  testsAttempted: number;
  averageScorePercent: number;
  dayStreak: number;
  badgesEarned: number;
}

export interface TodayProgress {
  questionsSolved: number;
  questionsTarget: number;
  accuracyPercent: number;
  studyMinutes: number;
  rank: number;
  rankTopPercent: number;
}

/** घेतलेल्या series मधल्या एका test ची ओळ — "My Test Series" screen. */
export type SeriesTestStatus = 'COMPLETED' | 'IN_PROGRESS' | 'NOT_ATTEMPTED';

export interface SeriesTestRow {
  id: string;
  /** यादीत दिसणारा क्रमांक — 01, 02, 03. */
  order: number;
  title: string;
  questionCount: number;
  totalMarks: number;
  durationMinutes: number;
  status: SeriesTestStatus;
  /** COMPLETED / IN_PROGRESS असेल तरच. */
  scorePercent?: number;
}
