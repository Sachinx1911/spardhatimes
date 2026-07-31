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
  chosenOption: string | null;
  correctAnswer: string;
  explanation: string | null;
  isCorrect: boolean;
}

export interface ApiResult {
  attemptId: string;
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

  catalog: () => request<ApiCatalogSeries[]>('/catalog'),

  exams: () => request<ApiExam[]>('/exams'),

  mySeries: () => request<ApiSeries[]>('/series'),

  seriesTests: (seriesId: string) => request<ApiSeriesDetail>(`/series/${seriesId}`),

  startTest: (quizId: string) => request<ApiQuiz>(`/tests/${quizId}`),

  submitTest: (quizId: string, answers: ApiSubmitAnswer[], timeTakenSeconds: number) =>
    request<{ attemptId: string }>(`/tests/${quizId}/submit`, {
      method: 'POST',
      body: { answers, timeTakenSeconds },
    }),

  attemptResult: (attemptId: string) => request<ApiResult>(`/attempts/${attemptId}`),
};
