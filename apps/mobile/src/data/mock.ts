/**
 * सगळा नकली data — **फक्त इथेच.**
 *
 * Screens मध्ये आकडे किंवा नावं थेट लिहायची नाहीत. API आली की या file मधली प्रत्येक
 * निर्यात एका fetch ने बदलेल आणि screens ना हात लावावा लागणार नाही.
 *
 * आकार `src/types/` मधल्या types प्रमाणेच — तेच types API client पण वापरेल.
 */

import type {
  Article,
  Exam,
  Question,
  StudentProfile,
  Test,
  TestResult,
  TestSeries,
  TodayProgress,
} from '@/types';

export const student: StudentProfile = {
  id: 'stu_1',
  name: 'Sachin Patil',
  email: 'sachinpatil123@gmail.com',
  phone: '+91 98765 43210',
  studentId: 'MT2024157',
  memberSince: '15 Jan 2024',
  testsAttempted: 128,
  averageScorePercent: 78,
  dayStreak: 7,
  badgesEarned: 14,
};

export const todayProgress: TodayProgress = {
  questionsSolved: 32,
  questionsTarget: 100,
  accuracyPercent: 68,
  studyMinutes: 105,
  rank: 45,
  rankTopPercent: 12,
};

export const exams: Exam[] = [
  { id: 'ex_mpsc', name: 'MPSC', seriesCount: 12, icon: 'briefcase' },
  { id: 'ex_upsc', name: 'UPSC', seriesCount: 8, icon: 'trophy' },
  { id: 'ex_ssc', name: 'SSC', seriesCount: 15, icon: 'location' },
  { id: 'ex_bank', name: 'Banking', seriesCount: 10, icon: 'business' },
  { id: 'ex_rail', name: 'Railways', seriesCount: 8, icon: 'train' },
  { id: 'ex_police', name: 'Police Bharti', seriesCount: 6, icon: 'shield' },
  { id: 'ex_tet', name: 'TET / CTET', seriesCount: 5, icon: 'school' },
];

export const mySeries: TestSeries[] = [
  {
    id: 'ser_gk',
    title: 'GK Test Series',
    categoryName: 'GK',
    examName: 'MPSC',
    plannedTotalTests: 20,
    completedTests: 2,
    priceInPaise: 0,
    validityMonths: 12,
    language: 'Bilingual',
    owned: true,
  },
  {
    id: 'ser_maths',
    title: 'Maths Test Series',
    categoryName: 'Maths',
    examName: 'MPSC',
    plannedTotalTests: 15,
    completedTests: 1,
    priceInPaise: 49900,
    validityMonths: 12,
    language: 'Bilingual',
    owned: true,
  },
];

/** दुकानाच्या वरच्या पट्टीत — मोठ्या रंगीत कार्डांत. */
export const featuredSeries: TestSeries[] = [
  {
    id: 'ser_mpsc_raj',
    title: 'MPSC Rajyaseva',
    subtitle: 'Complete Test Series',
    categoryName: 'GK',
    examName: 'MPSC',
    plannedTotalTests: 45,
    completedTests: 0,
    priceInPaise: 79900,
    mrpInPaise: 119900,
    validityMonths: 12,
    language: 'Bilingual',
    owned: false,
    coverColor: '#1E40AF',
  },
  {
    id: 'ser_upsc_pre',
    title: 'UPSC Prelims 2025',
    subtitle: 'Test Series',
    categoryName: 'GK',
    examName: 'UPSC',
    plannedTotalTests: 30,
    completedTests: 0,
    priceInPaise: 99900,
    mrpInPaise: 149900,
    validityMonths: 12,
    language: 'English / Hindi',
    owned: false,
    coverColor: '#047857',
  },
  {
    id: 'ser_ssc_cgl',
    title: 'SSC CGL 2024-25',
    subtitle: 'Complete Series',
    categoryName: 'GK',
    examName: 'SSC',
    plannedTotalTests: 60,
    completedTests: 0,
    priceInPaise: 59900,
    mrpInPaise: 89900,
    validityMonths: 12,
    language: 'Bilingual',
    owned: false,
    coverColor: '#6D28D9',
  },
  {
    id: 'ser_bank_po',
    title: 'Banking PO',
    subtitle: 'Complete Series',
    categoryName: 'GK',
    examName: 'Banking',
    plannedTotalTests: 50,
    completedTests: 0,
    priceInPaise: 69900,
    mrpInPaise: 99900,
    validityMonths: 12,
    language: 'English / Hindi',
    owned: false,
    coverColor: '#C2410C',
  },
];

/** अजून विकत न घेतलेल्या — यादीच्या रूपात, प्रत्येकावर "Buy Now". */
export const popularSeries: TestSeries[] = [
  {
    id: 'ser_mpsc_bc',
    title: 'MPSC Combine Group B & C 2025',
    description: 'Complete test series for Prelims & Mains with full syllabus coverage.',
    categoryName: 'GK',
    examName: 'MPSC',
    plannedTotalTests: 70,
    completedTests: 0,
    priceInPaise: 99900,
    mrpInPaise: 149900,
    validityMonths: 12,
    language: 'Bilingual',
    owned: false,
    coverColor: '#1E40AF',
  },
  {
    id: 'ser_csat',
    title: 'UPSC CSAT Paper II 2025',
    description: 'Improve your qualifying skills with CSAT practice tests.',
    categoryName: 'GK',
    examName: 'UPSC',
    plannedTotalTests: 20,
    completedTests: 0,
    priceInPaise: 29900,
    mrpInPaise: 49900,
    validityMonths: 6,
    language: 'English / Hindi',
    owned: false,
    coverColor: '#047857',
  },
  {
    id: 'ser_chsl',
    title: 'SSC CHSL 2024-25',
    description: 'Tier I & II complete mock tests with section-wise tests.',
    categoryName: 'GK',
    examName: 'SSC',
    plannedTotalTests: 45,
    completedTests: 0,
    priceInPaise: 49900,
    mrpInPaise: 79900,
    validityMonths: 12,
    language: 'Bilingual',
    owned: false,
    coverColor: '#6D28D9',
  },
];

export const upcomingTests: Test[] = [
  {
    id: 'tst_gk28',
    slug: 'gk-28-july',
    title: 'GK 28 July Test',
    seriesTitle: 'GK Test Series',
    categoryName: 'GK',
    questionCount: 100,
    durationMinutes: 90,
    totalMarks: 100,
    releaseAt: '2026-07-28T20:00:00+05:30',
    state: 'UPCOMING',
    attemptState: 'NOT_STARTED',
  },
  {
    id: 'tst_maths1',
    slug: 'maths-test-1',
    title: 'Maths Test 1',
    seriesTitle: 'Maths Test Series',
    categoryName: 'Maths',
    questionCount: 100,
    durationMinutes: 90,
    totalMarks: 100,
    releaseAt: '2026-07-29T20:00:00+05:30',
    state: 'UPCOMING',
    attemptState: 'NOT_STARTED',
  },
  {
    id: 'tst_mar1',
    slug: 'marathi-vyakaran-1',
    title: 'मराठी व्याकरण चाचणी 1',
    seriesTitle: 'मराठी व्याकरण Test Series',
    categoryName: 'Marathi',
    questionCount: 100,
    durationMinutes: 90,
    totalMarks: 100,
    releaseAt: '2026-07-30T20:00:00+05:30',
    state: 'UPCOMING',
    attemptState: 'NOT_STARTED',
  },
];

/** Home वरचं "Continue Your Test" कार्ड. काहीच अर्धवट नसेल तर null. */
export const testInProgress: Test | null = {
  id: 'tst_gk27',
  slug: 'gk-27-july',
  title: 'GK 27 July Test',
  seriesTitle: 'GK Test Series',
  categoryName: 'GK',
  questionCount: 10,
  durationMinutes: 30,
  totalMarks: 100,
  releaseAt: '2026-07-27T20:00:00+05:30',
  state: 'OPEN',
  attemptState: 'IN_PROGRESS',
  answeredCount: 7,
};

/**
 * Attempt screen साठी प्रश्न.
 *
 * `correctAnswer` आणि `explanation` इथे **मुद्दाम नाहीत** — test सुरू असताना ते
 * app पर्यंत पोहोचताच कामा नयेत. Mockup च्या attempt screen वर खुलासा दाखवला आहे,
 * पण तसं केलं तर प्रत्येक विद्यार्थी पैकीच्या पैकी गुण मिळवेल. ते Result मध्येच.
 */
export const attemptQuestions: Question[] = [
  {
    id: 'q1',
    marks: 1,
    text: 'भारताने G20 शिखर परिषद यशस्वीरित्या प्रथम कधी आयोजित केली?',
    options: [
      { key: 'A', text: 'सप्टेंबर 2023' },
      { key: 'B', text: 'डिसेंबर 2022' },
      { key: 'C', text: 'नोव्हेंबर 2021' },
      { key: 'D', text: 'ऑक्टोबर 2020' },
    ],
  },
  {
    id: 'q2',
    marks: 1,
    text: 'भारतीय राज्यघटनेतील मूलभूत अधिकार कोणत्या भागात येतात?',
    options: [
      { key: 'A', text: 'भाग २' },
      { key: 'B', text: 'भाग ३' },
      { key: 'C', text: 'भाग ४' },
      { key: 'D', text: 'भाग ५' },
    ],
  },
  {
    id: 'q3',
    marks: 1,
    text: 'ISRO चं नवीन उपग्रह EOS-08 कोणत्या वाहनातून प्रक्षेपित करण्यात आलं?',
    options: [
      { key: 'A', text: 'PSLV-C57' },
      { key: 'B', text: 'GSLV Mk III' },
      { key: 'C', text: 'SSLV-D3' },
      { key: 'D', text: 'LVM3' },
    ],
  },
  {
    id: 'q4',
    marks: 1,
    text: 'RBI ची रेपो दर ठरवणारी समिती कोणती?',
    options: [
      { key: 'A', text: 'MPC' },
      { key: 'B', text: 'NITI Aayog' },
      { key: 'C', text: 'SEBI Board' },
      { key: 'D', text: 'Finance Commission' },
    ],
  },
  {
    id: 'q5',
    marks: 1,
    text: 'शाश्वत विकास ध्येये (SDGs) एकूण किती आहेत?',
    options: [
      { key: 'A', text: '15' },
      { key: 'B', text: '17' },
      { key: 'C', text: '20' },
      { key: 'D', text: '12' },
    ],
  },
];

export const testResult: TestResult = {
  attemptId: 'att_1',
  testTitle: 'GK 27 July Test',
  code: '#GK27124',
  submittedAt: '2026-07-28T20:00:00+05:30',
  score: 78,
  totalMarks: 100,
  percentage: 78,
  correct: 78,
  incorrect: 18,
  unattempted: 4,
  timeTakenSeconds: 58 * 60 + 24,
  durationSeconds: 90 * 60,
  percentile: 72,
  subjects: [
    { subject: 'Current Affairs', questionCount: 25, correct: 20, score: 20, maxScore: 25 },
    { subject: 'Indian Polity', questionCount: 25, correct: 18, score: 18, maxScore: 25 },
    { subject: 'Geography', questionCount: 25, correct: 22, score: 22, maxScore: 25 },
    { subject: 'Economy', questionCount: 25, correct: 18, score: 18, maxScore: 25 },
  ],
  trend: [
    { label: 'Test 1', percentage: 62 },
    { label: 'Test 2', percentage: 71 },
    { label: 'Test 3', percentage: 64 },
    { label: 'Test 4', percentage: 74 },
    { label: 'Test 5', percentage: 78 },
  ],
};

export const latestArticles: Article[] = [
  {
    id: 'art_1',
    title: 'भारताची G20 शिखर परिषद यशस्वीरित्या संपन्न',
    categoryName: 'राष्ट्रीय',
    publishedAt: '2026-07-18T09:00:00+05:30',
    readMinutes: 5,
  },
  {
    id: 'art_2',
    title: 'केंद्र सरकारने नवीन शिक्षण धोरण 2024 ला मंजुरी दिली',
    categoryName: 'राष्ट्रीय',
    publishedAt: '2026-07-18T08:00:00+05:30',
    readMinutes: 3,
  },
  {
    id: 'art_3',
    title: "चीनमध्ये नवीन कृत्रिम बुद्धिमत्ता चिप 'Dragon AI' लाँच",
    categoryName: 'आंतरराष्ट्रीय',
    publishedAt: '2026-07-18T07:00:00+05:30',
    readMinutes: 4,
  },
];

/** विषयवार अभ्यासाची प्रगती — Profile screen. */
export const studyProgress = {
  syllabusCompletedPercent: 65,
  examName: 'MPSC Combined',
  subjects: [
    { subject: 'General Studies', percent: 72 },
    { subject: 'Indian Polity', percent: 68 },
    { subject: 'Economy', percent: 54 },
    { subject: 'Science & Tech', percent: 61 },
    { subject: 'History', percent: 48 },
  ],
};

export const achievements = [
  { id: 'ach_1', label: 'Consistent Learner', note: '7 Days Streak', icon: 'flame' as const },
  { id: 'ach_2', label: 'Test Master', note: 'Attempted 100 Tests', icon: 'clipboard' as const },
  { id: 'ach_3', label: 'High Scorer', note: 'Scored 80%+', icon: 'star' as const },
  { id: 'ach_4', label: 'Dedicated', note: '30 Days Active', icon: 'calendar' as const },
  { id: 'ach_5', label: 'Top Performer', note: 'In Top 10%', icon: 'trophy' as const },
];
