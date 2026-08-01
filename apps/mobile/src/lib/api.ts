import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { tokens } from './tokens';

/**
 * API शी बोलणारा एकमेव थर.
 *
 * Screens ने कधीही थेट `fetch` करायचं नाही — नाहीतर token जोडणं, 401 वर refresh
 * करणं आणि चुकांचे संदेश प्रत्येक screen मध्ये वेगवेगळे होतील.
 */

/**
 * Dev मध्ये API कुठे आहे हे उपकरणानुसार बदलतं:
 * - web / iOS simulator → localhost चालतो
 * - खरा फोन (Expo Go) → localhost म्हणजे *फोन स्वतः*, म्हणून विकसकाच्या
 *   मशीनचा LAN पत्ता लागतो. Expo तो `hostUri` मध्ये देतो, त्यातून IP घेतो.
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && Platform.OS !== 'web') return `http://${host}:4000/api`;

  return 'http://localhost:4000/api';
}

export const API_BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

/** Server चा चुकीचा प्रतिसाद वाचनीय वाक्यात आणतो. */
async function toError(res: Response): Promise<ApiError> {
  let message = 'काहीतरी चुकलं. पुन्हा प्रयत्न करा.';
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) message = body.message[0] ?? message;
    else if (body.message) message = body.message;
  } catch {
    // JSON नसेल तर वरचंच सामान्य वाक्य.
  }
  return new ApiError(res.status, message);
}

/**
 * एकाच वेळी अनेक विनंत्या 401 झाल्या तर refresh **एकदाच** व्हावा — नाहीतर प्रत्येक
 * विनंती स्वतंत्र refresh पाठवते आणि server वर विनाकारण भार येतो.
 */
let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const refreshToken = await tokens.refresh;
      if (!refreshToken) return false;

      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        await tokens.clear();
        return false;
      }

      await tokens.save(await res.json());
      return true;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Login/refresh साठी — यांना token जोडायचा नाही. */
  auth?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}, retried = false): Promise<T> {
  const { method = 'GET', body, auth = true } = opts;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const access = await tokens.access;
    if (access) headers.Authorization = `Bearer ${access}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // Access token 15 मिनिटांचा आहे, त्यामुळे 401 नेहमीचंच. एकदा refresh करून पुन्हा
  // प्रयत्न; `retried` मुळे तो फेरा एकदाच होतो, अनंत लूप नाही.
  if (res.status === 401 && auth && !retried) {
    if (await refreshTokens()) return request<T>(path, opts, true);
  }

  if (!res.ok) throw await toError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Me {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

/**
 * खालचे आकार backend च्या `TestsService` मधून जसेच्या तसे. ते बदलले तर हे
 * बदलावेच लागतील — म्हणून तिथे बदल करताना इथे बघा.
 */

/**
 * `GET /catalog` — दुकानातल्या सगळ्या series.
 *
 * `owned` म्हणजे **चालू** access. मुदत संपलेली असेल तर तो false येतो, म्हणजे
 * तिथे पुन्हा "Buy" दिसतं.
 *
 * ⚠️ Designs मध्ये दिसणारे "Bilingual" (भाषा) आणि परीक्षेचं वेगळं नाव अजून
 * schema मध्ये नाहीत. तोपर्यंत परीक्षेच्या जागी category वापरतो आणि भाषेचा
 * tag दाखवत नाही — खोटी माहिती दाखवण्यापेक्षा न दाखवणं बरं.
 */
/**
 * `GET /dashboard` — Home साठी लागणारं सगळं एका फेरीत.
 *
 * `examName` schema मधून येत नाही; घेतलेल्या series वरून काढलेला आहे आणि
 * एकाहून जास्त परीक्षा असतील तर null येतो.
 */
export interface ApiDashboard {
  name: string | null;
  examName: string | null;
  /** Admin ने ठरवलेल्या जाहिराती. रिकामं असेल तर app स्वतःची पट्टी दाखवतो. */
  banners: {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string | null;
  }[];
  /** नुकतेच **उघडलेले** tests — पुढे येणारे इथे येत नाहीत. */
  latestTests: {
    id: string;
    title: string;
    seriesTitle: string | null;
    questionCount: number;
    durationMinutes: number;
    marks: number;
    releaseAt: string | null;
  }[];
  activeSeries: {
    id: string;
    title: string;
    categoryName: string;
    examName: string | null;
    totalTests: number;
    plannedTotalTests: number;
    priceInPaise: number;
    mrpInPaise: number | null;
    /** null = कायमस्वरूपी. */
    expiresAt: string | null;
  }[];
  stats: {
    todaysTests: number;
    testsAttempted: number;
    averageScore: number;
    /** null = कुठलीही मुदत नाही (आजीवन access). */
    validTill: string | null;
  };
}

/**
 * `GET /analytics` — कामगिरीचं विश्लेषण.
 *
 * सगळे आकडे attempts मधून काढलेले आहेत, वेगळं साठवलेले नाहीत.
 * एकही test सोडवला नसेल तर आकार तोच राहतो पण याद्या रिकाम्या येतात.
 */
export interface ApiAnalyticsSubject {
  id: string;
  name: string;
  orderIndex: number;
  questionCount: number;
  correct: number;
  accuracy: number;
}

export interface ApiAnalytics {
  testsAttempted: number;
  averageScore: number;
  bestScore: number;
  hoursStudied: number;
  /** पहिलाच attempt असेल तर null — तुलना करायला दुसरं कोणी नसतं. */
  betterThanPercent: number | null;
  trend: {
    attemptId: string;
    title: string;
    percentage: number;
    at: string;
  }[];
  subjects: ApiAnalyticsSubject[];
  /** किमान ३ प्रश्न सोडवलेले विषयच इथे येतात. */
  strengths: ApiAnalyticsSubject[];
  weaknesses: ApiAnalyticsSubject[];
}

/**
 * `GET /learn` — Learn चा पहिला पडदा.
 *
 * PYQ चा आकडा `Quiz` मधून येतो, `StudyMaterial` मधून नाही — मागील वर्षांचे
 * पेपर वाचायचे नसून **सोडवायचे** असतात, म्हणून ते tests आहेत.
 */
export interface ApiLearnOverview {
  counts: {
    notes: number;
    videos: number;
    books: number;
    shorts: number;
    pyqs: number;
  };
  /** साहित्य असलेले विषयच येतात — रिकामे गाळलेले असतात. */
  subjects: {
    id: string;
    name: string;
    materialCount: number;
    completedCount: number;
    percent: number;
  }[];
  /** सुरू केलेलं पण पूर्ण न झालेलं, अलीकडे उघडलेलं आधी. जास्तीत जास्त ३. */
  continueLearning: {
    id: string;
    title: string;
    slug: string;
    type: ApiMaterialType;
    url: string;
    subjectName: string | null;
    percent: number;
    durationSeconds: number | null;
    pageCount: number | null;
  }[];
}

/**
 * `GET /online-tests` — ONLINE TEST चा पडदा.
 *
 * मोफत आणि पैसे घेणारे **वेगळे** येतात कारण design मध्ये त्यांचा switcher आहे.
 * `owned` म्हणजे चालू access — पैसे घेणाऱ्यावर तो false असेल तर "Buy".
 */
export interface ApiOnlineTest {
  id: string;
  title: string;
  questionCount: number;
  marks: number;
  durationMinutes: number;
  /** किती विद्यार्थ्यांनी दिला. */
  attemptCount: number;
  seriesId: string | null;
  owned: boolean;
}

export interface ApiOnlineTests {
  stats: {
    availableTests: number;
    attemptedTests: number;
    averageScore: number;
    /** एकही test सोडवला नसेल तर null. */
    overallRank: number | null;
  };
  free: ApiOnlineTest[];
  paid: ApiOnlineTest[];
}

/**
 * `GET /exams/:id` — एका परीक्षेखालच्या series.
 *
 * ⚠️ Design मधला **अभ्यासक्रम** विभाग इथे नाही — त्याचं schema मध्ये model
 * नाही. तो बांधल्यावर इथे `syllabus` जोडायचा.
 */
export interface ApiExamDetail {
  id: string;
  name: string;
  syllabi: {
    id: string;
    title: string;
    subjectCount: number;
    topicCount: number;
  }[];
  series: {
    id: string;
    title: string;
    description: string | null;
    totalTests: number;
    priceInPaise: number;
    owned: boolean;
  }[];
}

/** `GET /syllabus/:id` — अभ्यासक्रमातले विषय. */
export interface ApiSyllabus {
  id: string;
  title: string;
  description: string | null;
  /** नसेल तर "PDF डाउनलोड" बटण दाखवायचं नाही. */
  pdfUrl: string | null;
  examId: string;
  examName: string;
  totalTopics: number;
  sections: {
    id: string;
    subjectId: string;
    subjectName: string;
    topicCount: number;
    /** 0 = वेळ ठरवलेली नाही; तेव्हा दाखवायची नाही. */
    estimatedMinutes: number;
  }[];
}

/** `GET /syllabus-section/:id` — एका विषयाचे मुद्दे. */
export interface ApiSyllabusSection {
  id: string;
  subjectName: string;
  syllabusId: string;
  syllabusTitle: string;
  estimatedMinutes: number;
  topics: { id: string; title: string; note: string | null }[];
}

export type ApiMaterialType = 'NOTE' | 'VIDEO' | 'BOOK' | 'SHORT';

/**
 * `GET /notes` — PDF Notes चा पडदा.
 *
 * `learn` सगळ्या प्रकारांची संख्या देतो; इथे **फक्त `NOTE`** मोजले आहेत,
 * नाहीतर "इतिहास 18 नोट्स" मध्ये व्हिडिओसुद्धा धरले जातील.
 */
export interface ApiNotes {
  totalNotes: number;
  /** टिपण असलेले विषयच येतात — रिकामे गाळलेले. */
  subjects: { id: string; name: string; noteCount: number }[];
}

/** `GET /materials` — प्रकार आणि विषयानुसार गाळता येते. */
export interface ApiMaterial {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: ApiMaterialType;
  url: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  pageCount: number | null;
  subjectId: string | null;
  subjectName: string | null;
  publishedAt: string | null;
}

/** `GET /orders` — माझ्या खरेदी. Profile मधल्या "My Purchases" साठी. */
export interface ApiOrder {
  id: string;
  seriesId: string;
  seriesTitle: string;
  amountInPaise: number;
  status: 'CREATED' | 'PAID' | 'FAILED';
  gateway: 'RAZORPAY' | 'INSTAMOJO';
  createdAt: string;
  paidAt: string | null;
}

/** `GET /exams` — दुकानातली परीक्षांची जाळी. आकडा प्रकाशित series चाच. */
export interface ApiExam {
  id: string;
  name: string;
  /** Ionicons चं नाव, admin ने ठरवलेलं. null असेल तर सामान्य चिन्ह वापरायचं. */
  icon: string | null;
  seriesCount: number;
}

export interface ApiCatalogSeries {
  id: string;
  title: string;
  description: string | null;
  categoryName: string;
  examId: string | null;
  examName: string | null;
  plannedTotalTests: number;
  priceInPaise: number;
  mrpInPaise: number | null;
  validityMonths: number;
  owned: boolean;
}

/** `GET /series` — घेतलेल्या series, प्रगतीसह. */
export interface ApiSeries {
  id: string;
  title: string;
  categoryName: string;
  plannedTotalTests: number;
  completedTests: number;
  releasedTests: number;
  owned: boolean;
}

export type ApiTestState = 'UPCOMING' | 'OPEN' | 'CLOSED';
export type ApiAttemptState = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface ApiSeriesTest {
  id: string;
  slug: string;
  title: string;
  seriesTitle: string;
  categoryName: string;
  questionCount: number;
  durationMinutes: number;
  totalMarks: number;
  releaseAt: string | null;
  state: ApiTestState;
  attemptState: ApiAttemptState;
  /** सोडवलेला नसेल तर null. */
  scorePercent: number | null;
}

/** `GET /series/:id` */
export interface ApiSeriesDetail {
  id: string;
  title: string;
  categoryName: string;
  tests: ApiSeriesTest[];
}

/** `GET /tests/:id` — बरोबर उत्तरं आणि खुलासे यात **नसतात**. */
export interface ApiQuizQuestion {
  id: string;
  type: string;
  text: string;
  marks: number;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
}

export interface ApiQuiz {
  id: string;
  slug: string;
  title: string;
  durationMinutes: number;
  totalMarks: number;
  negativeMarks: number;
  instructions: string | null;
  questions: ApiQuizQuestion[];
}

export interface ApiSubmitAnswer {
  questionId: string;
  chosenOption: string | null;
  timeSpent: number;
}

/** `GET /attempts/:id` — बरोबर उत्तरं आणि खुलासे **फक्त इथे** येतात. */
export interface ApiResultSubject {
  /** विषयाचं नाव. विषय न दिलेल्या प्रश्नांसाठी backend "इतर" पाठवतो. */
  subject: string;
  orderIndex: number;
  questionCount: number;
  correct: number;
  score: number;
  maxScore: number;
}

export interface ApiResultAnswer {
  questionId: string;
  text: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  /** न सोडवलेला असेल तर null. MULTIPLE_CHOICE ला "A,C". */
  chosenOption: string | null;
  correctAnswer: string;
  explanation: string | null;
  isCorrect: boolean;
  /** विषय न दिलेल्या प्रश्नांसाठी "इतर". */
  subject: string;
}

export interface ApiResult {
  attemptId: string;
  /** Attempt id पेक्षा वेगळा — बुकमार्क या id वर मागवतात. */
  quizId: string;
  testTitle: string;
  submittedAt: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  timeTakenSeconds: number;
  durationSeconds: number;
  /** पहिलाच attempt असेल तर null असू शकतो. */
  percentile: number | null;
  subjects: ApiResultSubject[];
  answers: ApiResultAnswer[];
}

/**
 * `GET /bookmarks` — खुणलेले प्रश्न.
 *
 * बरोबर उत्तर आणि खुलासा **यात येतात** — इतर endpoints मध्ये ते मुद्दाम नसतात.
 * इथे चालतं कारण bookmark फक्त सोडवलेल्या प्रश्नाला करता येतो, म्हणजे तो प्रश्न
 * विद्यार्थ्याने निकालाच्या पडद्यावर उत्तरासह आधीच पाहिला आहे.
 */
export interface ApiBookmark {
  id: string;
  questionId: string;
  quizId: string;
  testTitle: string;
  /** Standalone quiz असेल तर null. */
  seriesTitle: string | null;
  /** विषय न दिलेल्या प्रश्नांसाठी "इतर". */
  subject: string;
  type: string;
  text: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  /** SINGLE_CHOICE: "A".."D"; MULTIPLE_CHOICE: "A,C". */
  correctAnswer: string;
  explanation: string | null;
  createdAt: string;
}

/**
 * `GET /current-affairs` मधली एक ओळ.
 *
 * `body` यात **नाही** — यादीत तो लागत नाही आणि वीस लेखांचा पूर्ण मजकूर मोबाइल
 * जाळ्यावर वाहून नेण्यात अर्थ नाही. पूर्ण मजकूर `article(slug)` मध्ये येतो.
 */
export interface ApiArticleListItem {
  id: string;
  title: string;
  slug: string;
  /** आधीच कापलेला — शब्दाच्या मधोमध तुटत नाही. */
  excerpt: string;
  imageUrl: string | null;
  /** मजकुरावरून मोजलेला, साठवलेला नाही. */
  readMinutes: number;
  isTopNews: boolean;
  publishedAt: string | null;
  categoryId: string;
  /** मराठी — card वरचा tag आणि वर्तुळं. */
  categoryName: string;
  /** इंग्रजी — वरचे chips. null असेल तर मराठी वापरायचं. */
  categoryNameEn: string | null;
  categorySlug: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  bookmarked: boolean;
}

export interface ApiArticleCategory {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  icon: string | null;
  color: string | null;
  /** **प्रकाशित** लेखांचाच आकडा — draft मोजलेले नाहीत. */
  articleCount: number;
}

/** `GET /current-affairs` — पडद्याला लागणारं सगळं एका फेरीत. */
export interface ApiCurrentAffairs {
  topNews: ApiArticleListItem[];
  latest: ApiArticleListItem[];
  categories: ApiArticleCategory[];
}

/** `GET /articles/:slug` — पूर्ण मजकुरासह. */
export interface ApiArticle extends ApiArticleListItem {
  body: string;
  updatedAt: string;
  /** बातमीचा स्रोत — नाव नसेल तर तो भाग दाखवायचाच नाही. */
  sourceName: string | null;
  sourceUrl: string | null;
  viewCount: number;
  likes: number;
  dislikes: number;
  /** माझी पसंती — null म्हणजे काहीच दिलेलं नाही. */
  myReaction: 'LIKE' | 'DISLIKE' | null;
  /** प्रकाशनाच्या क्रमाने शेजारचे लेख; टोकाला असेल तर null. */
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

export const api = {
  async login(phone: string, password: string): Promise<Me> {
    const pair = await request<AuthTokens>(
      '/auth/login',
      { method: 'POST', body: { phone, password }, auth: false }
    );
    await tokens.save(pair);
    return api.me();
  },

  me: () => request<Me>('/auth/me'),

  async logout() {
    await tokens.clear();
  },

  /** App सुरू होताना — साठवलेला token अजून चालतो का. */
  async restoreSession(): Promise<Me | null> {
    if (!(await tokens.access)) return null;
    try {
      return await api.me();
    } catch {
      await tokens.clear();
      return null;
    }
  },

  // ── tests ──

  dashboard: () => request<ApiDashboard>('/dashboard'),

  catalog: () => request<ApiCatalogSeries[]>('/catalog'),

  exams: () => request<ApiExam[]>('/exams'),

  /**
   * खरेदी सुरू करणे. **रक्कम पाठवत नाही** — किंमत server database मधून घेतो.
   *
   * मोफत series ला `{ free: true }` येतं आणि access लगेच मिळालेला असतो.
   * पैसे घ्यायच्या series साठी gateway जोडेपर्यंत हा चूक देतो.
   */
  createOrder: (seriesId: string) =>
    request<{ free: true; expiresAt: string | null }>('/orders', {
      method: 'POST',
      body: JSON.stringify({ seriesId }),
    }),

  myOrders: () => request<ApiOrder[]>('/orders'),

  analytics: () => request<ApiAnalytics>('/analytics'),

  /** `GET /notes` — PDF Notes चा पडदा. */
  notes: () => request<ApiNotes>('/notes'),

  onlineTests: () => request<ApiOnlineTests>('/online-tests'),

  examDetail: (id: string) => request<ApiExamDetail>(`/exams/${id}`),

  syllabus: (id: string) => request<ApiSyllabus>(`/syllabus/${id}`),

  syllabusSection: (id: string) => request<ApiSyllabusSection>(`/syllabus-section/${id}`),

  learn: () => request<ApiLearnOverview>('/learn'),

  /**
   * किती वाचलं/बघितलं ते नोंदवणे. Server प्रगती **मागे नेत नाही**, म्हणून
   * कमी आकडा पाठवला तरी आधीची प्रगती टिकते.
   */
  saveMaterialProgress: (materialId: string, percent: number) =>
    request<{ percent: number; completed: boolean }>(`/materials/${materialId}/progress`, {
      method: 'POST',
      body: { percent },
    }),

  materials: (opts: { type?: ApiMaterialType; subjectId?: string } = {}) => {
    const q = new URLSearchParams();
    if (opts.type) q.set('type', opts.type);
    if (opts.subjectId) q.set('subject', opts.subjectId);
    const qs = q.toString();
    return request<ApiMaterial[]>(`/materials${qs ? `?${qs}` : ''}`);
  },

  mySeries: () => request<ApiSeries[]>('/series'),

  seriesTests: (seriesId: string) => request<ApiSeriesDetail>(`/series/${seriesId}`),

  startTest: (quizId: string) => request<ApiQuiz>(`/tests/${quizId}`),

  submitTest: (quizId: string, answers: ApiSubmitAnswer[], timeTakenSeconds: number) =>
    request<{ attemptId: string }>(`/tests/${quizId}/submit`, {
      method: 'POST',
      body: { answers, timeTakenSeconds },
    }),

  attemptResult: (attemptId: string) => request<ApiResult>(`/attempts/${attemptId}`),

  // ── बुकमार्क ──

  bookmarks: () => request<ApiBookmark[]>('/bookmarks'),

  /**
   * या test मधले कोणते प्रश्न आधीच खुणलेले आहेत — निकालाच्या पडद्यासाठी.
   * प्रत्येक प्रश्नाला वेगळी विनंती करण्यापेक्षा एकदाच यादी.
   */
  bookmarkedInQuiz: (quizId: string) => request<string[]>(`/bookmarks/quiz/${quizId}`),

  /** आधीच खुणलेला असेल तरी चूक देत नाही — तीच नोंद परत येते. */
  addBookmark: (questionId: string) =>
    request<{ id: string; questionId: string; createdAt: string }>('/bookmarks', {
      method: 'POST',
      body: { questionId },
    }),

  /** नोंद नसेल तरी चूक येत नाही. */
  removeBookmark: (questionId: string) =>
    request<void>(`/bookmarks/${questionId}`, { method: 'DELETE' }),

  // ── चालू घडामोडी ──

  currentAffairs: () => request<ApiCurrentAffairs>('/current-affairs'),

  /** `category` न दिला (किंवा 'all') तर सगळे लेख. */
  articles: (categorySlug?: string) =>
    request<ApiArticleListItem[]>(
      categorySlug && categorySlug !== 'all'
        ? `/articles?category=${encodeURIComponent(categorySlug)}`
        : '/articles'
    ),

  article: (slug: string) => request<ApiArticle>(`/articles/${encodeURIComponent(slug)}`),

  bookmarkedArticles: () => request<ApiArticleListItem[]>('/articles/bookmarked'),

  /** आवडलं / आवडलं नाही. तेच पुन्हा पाठवलं तर पसंती मागे घेतली जाते. */
  reactToArticle: (articleId: string, type: 'LIKE' | 'DISLIKE') =>
    request<{ likes: number; dislikes: number; myReaction: 'LIKE' | 'DISLIKE' | null }>(
      `/articles/${articleId}/react`,
      { method: 'POST', body: { type } }
    ),

  addArticleBookmark: (articleId: string) =>
    request<void>(`/articles/${articleId}/bookmark`, { method: 'POST' }),

  removeArticleBookmark: (articleId: string) =>
    request<void>(`/articles/${articleId}/bookmark`, { method: 'DELETE' }),
};
