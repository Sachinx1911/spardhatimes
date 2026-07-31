import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  attemptAccessInclude,
  decideAttemptAccess,
  gradeAttempt,
  messageForReason,
  testState,
  type SubmittedAnswer,
} from '@mahatest/core';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Home dashboard साठी लागणारं सगळं, **एका फेरीत**.
   *
   * Design मध्ये नाव, परीक्षा, चालू series, आणि चार आकडे — सगळं एका पडद्यावर
   * आहे. प्रत्येकासाठी वेगळी request केली असती तर मोबाइल जाळ्यावर पाच फेऱ्या
   * झाल्या असत्या आणि पडदा तुकड्या-तुकड्याने भरला असता. म्हणून एकच endpoint.
   */
  async dashboard(userId: string) {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const [user, access, attempts] = await Promise.all([
      this.prisma.client.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
      this.prisma.client.testSeriesAccess.findMany({
        where: { userId, testSeries: { published: true } },
        select: {
          expiresAt: true,
          testSeries: {
            select: {
              id: true,
              title: true,
              plannedTotalTests: true,
              priceInPaise: true,
              mrpInPaise: true,
              category: { select: { name: true } },
              exam: { select: { name: true } },
              _count: { select: { quizzes: true } },
            },
          },
        },
      }),
      this.prisma.client.quizAttempt.findMany({
        where: { userId, status: 'COMPLETED' },
        select: { percentage: true },
      }),
    ]);

    // मुदत संपलेल्या series dashboard वर "चालू" म्हणून दाखवायच्या नाहीत.
    const live = access.filter((a) => a.expiresAt === null || a.expiresAt > now);

    // आजचे tests — चालू series मधले, आज प्रकाशित होणारे.
    const todaysTests = live.length
      ? await this.prisma.client.quiz.count({
          where: {
            testSeriesId: { in: live.map((a) => a.testSeries.id) },
            status: 'PUBLISHED',
            releaseAt: { gte: dayStart, lt: dayEnd },
          },
        })
      : 0;

    const attempted = attempts.length;
    const averageScore = attempted
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempted)
      : 0;

    /**
     * सदस्यत्व कधीपर्यंत — सगळ्यात लांबची मुदत.
     *
     * एखादी series कायमस्वरूपी (null) असेल तर मुदतच नाही, म्हणून null परत
     * करतो आणि app "आजीवन" दाखवतो.
     */
    const hasPermanent = live.some((a) => a.expiresAt === null);
    const validTill = hasPermanent
      ? null
      : live.reduce<Date | null>(
          (max, a) => (a.expiresAt && (!max || a.expiresAt > max) ? a.expiresAt : max),
          null
        );

    return {
      name: user?.name ?? null,
      /**
       * "MPSC Aspirant" — विद्यार्थ्याने निवडलेली परीक्षा schema मध्ये नाही,
       * म्हणून त्याच्या series वरून काढतो. एकाहून जास्त परीक्षा असतील तर
       * काहीच दाखवत नाही, कारण कुठली निवडायची हे ठरवता येत नाही.
       */
      examName:
        new Set(live.map((a) => a.testSeries.exam?.name).filter(Boolean)).size === 1
          ? (live.find((a) => a.testSeries.exam)?.testSeries.exam?.name ?? null)
          : null,
      activeSeries: live.map((a) => ({
        id: a.testSeries.id,
        title: a.testSeries.title,
        categoryName: a.testSeries.category.name,
        examName: a.testSeries.exam?.name ?? null,
        totalTests: a.testSeries._count.quizzes,
        plannedTotalTests: a.testSeries.plannedTotalTests,
        priceInPaise: a.testSeries.priceInPaise,
        mrpInPaise: a.testSeries.mrpInPaise,
        expiresAt: a.expiresAt?.toISOString() ?? null,
      })),
      stats: {
        todaysTests,
        testsAttempted: attempted,
        averageScore,
        validTill: validTill?.toISOString() ?? null,
      },
    };
  }

  /**
   * दुकान — विकत घेता येणाऱ्या सगळ्या प्रकाशित series.
   *
   * `mySeries` पेक्षा वेगळं: तो फक्त **घेतलेल्या** देतो, हा **सगळ्या** देतो आणि
   * प्रत्येकीवर `owned` सांगतो, म्हणजे app "Buy" की "Start" हे ठरवू शकतो.
   *
   * मुदत संपलेली access म्हणजे `owned: false` — तिथे पुन्हा "Buy" च दिसलं पाहिजे.
   */
  async catalog(userId: string) {
    const now = new Date();

    const [series, myAccess] = await Promise.all([
      this.prisma.client.testSeries.findMany({
        where: { published: true },
        select: {
          id: true,
          title: true,
          description: true,
          plannedTotalTests: true,
          priceInPaise: true,
          mrpInPaise: true,
          validityMonths: true,
          category: { select: { name: true } },
          exam: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.testSeriesAccess.findMany({
        where: { userId },
        select: { testSeriesId: true, expiresAt: true },
      }),
    ]);

    const ownedIds = new Set(
      myAccess
        .filter((a) => a.expiresAt === null || a.expiresAt > now)
        .map((a) => a.testSeriesId)
    );

    return series.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      categoryName: s.category.name,
      examId: s.exam?.id ?? null,
      examName: s.exam?.name ?? null,
      plannedTotalTests: s.plannedTotalTests,
      priceInPaise: s.priceInPaise,
      mrpInPaise: s.mrpInPaise,
      validityMonths: s.validityMonths,
      owned: ownedIds.has(s.id),
    }));
  }

  /**
   * दुकानातली परीक्षांची जाळी.
   *
   * आकडा **प्रकाशित** series चाच मोजतो — नाहीतर "12 Test Series" दिसेल आणि
   * आत गेल्यावर तीनच सापडतील.
   */
  async exams() {
    const exams = await this.prisma.client.exam.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
        _count: { select: { testSeries: { where: { published: true } } } },
      },
      orderBy: { orderIndex: 'asc' },
    });

    return exams.map((e) => ({
      id: e.id,
      name: e.name,
      icon: e.icon,
      seriesCount: e._count.testSeries,
    }));
  }

  /** विद्यार्थ्याला दिलेल्या series, प्रत्येकीची प्रगती सह. */
  async mySeries(userId: string) {
    const access = await this.prisma.client.testSeriesAccess.findMany({
      where: { userId, testSeries: { published: true } },
      select: {
        testSeries: {
          select: {
            id: true,
            title: true,
            plannedTotalTests: true,
            timingMode: true,
            category: { select: { name: true } },
            quizzes: {
              where: { status: 'PUBLISHED' },
              select: { id: true, releaseAt: true, closeAt: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const seriesIds = access.map((a) => a.testSeries.id);
    if (seriesIds.length === 0) return [];

    // प्रत्येक series साठी वेगळी query न मारता एकाच फेरीत पूर्ण झालेले attempts.
    // Supabase ~170ms दूर आहे; loop मध्ये query मारली की ते लगेच जाणवतं.
    const done = await this.prisma.client.quizAttempt.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        quiz: { testSeriesId: { in: seriesIds } },
      },
      select: { quizId: true, quiz: { select: { testSeriesId: true } } },
    });

    const completedBySeries = new Map<string, Set<string>>();
    for (const a of done) {
      const sid = a.quiz.testSeriesId!;
      if (!completedBySeries.has(sid)) completedBySeries.set(sid, new Set());
      completedBySeries.get(sid)!.add(a.quizId);
    }

    return access.map(({ testSeries: s }) => ({
      id: s.id,
      title: s.title,
      categoryName: s.category.name,
      plannedTotalTests: s.plannedTotalTests,
      completedTests: completedBySeries.get(s.id)?.size ?? 0,
      releasedTests: s.quizzes.filter(
        (q) => testState(q, s.timingMode) !== 'UPCOMING'
      ).length,
      owned: true,
    }));
  }

  /** एका series मधले tests, प्रत्येकाची सध्याची अवस्था सह. */
  async seriesTests(userId: string, seriesId: string) {
    const series = await this.prisma.client.testSeries.findUnique({
      where: { id: seriesId },
      select: {
        id: true,
        title: true,
        published: true,
        timingMode: true,
        category: { select: { name: true } },
        access: { where: { userId }, select: { id: true } },
        quizzes: {
          where: { status: 'PUBLISHED' },
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            slug: true,
            title: true,
            duration: true,
            marks: true,
            releaseAt: true,
            closeAt: true,
            _count: { select: { questions: true } },
          },
        },
      },
    });

    if (!series || !series.published) throw new NotFoundException('Test series सापडली नाही.');
    if (series.access.length === 0) {
      throw new ForbiddenException('ही test series तुमच्या खात्याला दिलेली नाही.');
    }

    // `percentage` सुद्धा इथेच घेतो — यादीत प्रत्येक test शेजारी "Score 82%"
    // दाखवायचा आहे. वेगळी query केली असती तर तेवढ्यासाठी आणखी एक फेरी झाली असती,
    // आणि DB ~170ms दूर आहे.
    const attempts = await this.prisma.client.quizAttempt.findMany({
      where: { userId, quizId: { in: series.quizzes.map((q) => q.id) } },
      select: { quizId: true, status: true, percentage: true },
      orderBy: { createdAt: 'desc' },
    });

    // एकाच test चे अनेक attempts असू शकतात; `orderBy` मुळे पहिला तोच सर्वात
    // अलीकडचा, आणि Map मध्ये तोच टिकतो.
    const attemptByQuiz = new Map<string, { status: string; percentage: number }>();
    for (const a of attempts) {
      if (!attemptByQuiz.has(a.quizId)) {
        attemptByQuiz.set(a.quizId, { status: a.status, percentage: a.percentage });
      }
    }

    return {
      id: series.id,
      title: series.title,
      categoryName: series.category.name,
      tests: series.quizzes.map((q) => ({
        id: q.id,
        slug: q.slug,
        title: q.title,
        seriesTitle: series.title,
        categoryName: series.category.name,
        questionCount: q._count.questions,
        durationMinutes: q.duration,
        totalMarks: q.marks,
        releaseAt: q.releaseAt?.toISOString() ?? null,
        state: testState(q, series.timingMode),
        attemptState:
          attemptByQuiz.get(q.id)?.status === 'COMPLETED'
            ? 'COMPLETED'
            : attemptByQuiz.has(q.id)
              ? 'IN_PROGRESS'
              : 'NOT_STARTED',
        /** सोडवलेला नसेल तर null — तेव्हा यादीत गुण दाखवायचे नाहीत. */
        scorePercent: attemptByQuiz.get(q.id)?.percentage ?? null,
      })),
    };
  }

  /**
   * Test सोडवायला उघडणे.
   *
   * ⚠️ `correctAnswer` आणि `explanation` **मुद्दाम select केलेले नाहीत.** ते इथे
   * पाठवले तर app मध्ये न दाखवताही ते network मध्ये दिसतात आणि test निरर्थक होतो.
   * ती दोन्ही फक्त निकालाच्या वेळी (`attemptResult`) जातात.
   */
  async startTest(userId: string, role: string, quizId: string) {
    const quiz = await this.prisma.client.quiz.findUnique({
      where: { id: quizId },
      include: {
        ...attemptAccessInclude(userId),
        questions: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            type: true,
            text: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            marks: true,
          },
        },
      },
    });

    if (!quiz) throw new NotFoundException('Test सापडला नाही.');

    const decision = decideAttemptAccess(quiz, role);
    if (!decision.allowed) throw new ForbiddenException(messageForReason(decision.reason));

    return {
      id: quiz.id,
      slug: quiz.slug,
      title: quiz.title,
      durationMinutes: quiz.duration,
      totalMarks: quiz.marks,
      negativeMarks: quiz.negativeMarks,
      instructions: quiz.instructions,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        type: q.type,
        text: q.text,
        marks: q.marks,
        options: [
          { key: 'A' as const, text: q.optionA },
          { key: 'B' as const, text: q.optionB },
          { key: 'C' as const, text: q.optionC },
          { key: 'D' as const, text: q.optionD },
        ],
      })),
    };
  }

  /**
   * उत्तरं तपासून attempt साठवणे.
   *
   * Access तपासणी **लिहिण्याआधी** — quizId client कडून येतो, त्यामुळे login असणं
   * पुरेसं नाही. गुण `@mahatest/core` मधल्या `gradeAttempt` नेच मोजले जातात, तेच
   * admin website वापरते; दोन ठिकाणी वेगळी गणना असू नये.
   */
  async submit(
    userId: string,
    role: string,
    quizId: string,
    answers: SubmittedAnswer[],
    timeTakenSeconds: number
  ) {
    const quiz = await this.prisma.client.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true, ...attemptAccessInclude(userId) },
    });

    if (!quiz) throw new NotFoundException('Test सापडला नाही.');

    const decision = decideAttemptAccess(quiz, role);
    if (!decision.allowed) throw new ForbiddenException(messageForReason(decision.reason));

    const graded = gradeAttempt(quiz.questions, answers, quiz.negativeMarks, quiz.marks);

    const attempt = await this.prisma.client.$transaction(
      async (tx) => {
        const created = await tx.quizAttempt.create({
          data: {
            userId,
            quizId,
            score: graded.score,
            percentage: graded.percentage,
            correctAnswers: graded.correctAnswers,
            wrongAnswers: graded.wrongAnswers,
            skippedQuestions: graded.skippedQuestions,
            timeTaken: timeTakenSeconds,
            status: 'COMPLETED',
          },
          select: { id: true },
        });

        if (graded.responses.length > 0) {
          // एकच createMany — प्रति-प्रश्न insert केला तर 100 प्रश्नांच्या test वर
          // transaction चा वेळ संपतो (हे आधी Excel import मध्ये भोगलं आहे).
          await tx.questionResponse.createMany({
            data: graded.responses.map((r) => ({
              attemptId: created.id,
              questionId: r.questionId,
              chosenOption: r.chosenOption,
              isCorrect: r.isCorrect,
              timeSpent: r.timeSpent,
            })),
          });
        }

        return created;
      },
      { timeout: 15000 }
    );

    return { attemptId: attempt.id };
  }

  /** निकाल — इथेच बरोबर उत्तरं आणि खुलासा जातात. */
  async attemptResult(userId: string, attemptId: string) {
    const attempt = await this.prisma.client.quizAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        userId: true,
        score: true,
        percentage: true,
        correctAnswers: true,
        wrongAnswers: true,
        skippedQuestions: true,
        timeTaken: true,
        percentile: true,
        createdAt: true,
        quiz: { select: { id: true, title: true, marks: true, duration: true } },
        responses: {
          select: {
            chosenOption: true,
            isCorrect: true,
            timeSpent: true,
            question: {
              select: {
                id: true,
                text: true,
                marks: true,
                // Options इथे लागतात कारण उजळणीत "बरोबर उत्तर C" एवढंच दाखवलं तर
                // C काय होतं ते विद्यार्थ्याला कळत नाही. `startTest` मध्ये ती
                // मुद्दाम पाठवली जातात, पण तिथे `correctAnswer` नसतो — इथे
                // दोन्ही चालतं, कारण test संपलेला आहे.
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                correctAnswer: true,
                explanation: true,
                subject: { select: { id: true, name: true, orderIndex: true } },
              },
            },
          },
        },
      },
    });

    if (!attempt) throw new NotFoundException('निकाल सापडला नाही.');
    // दुसऱ्याचा निकाल उघडता येऊ नये.
    if (attempt.userId !== userId) throw new ForbiddenException('हा निकाल तुमचा नाही.');

    // विषयवार बेरीज. विषय न दिलेले प्रश्न एका गटात — गाळून टाकले तर बेरीज
    // एकूण गुणांशी जुळत नाही आणि विद्यार्थ्याला आकडे चुकीचे वाटतात.
    const bySubject = new Map<
      string,
      { subject: string; orderIndex: number; questionCount: number; correct: number; score: number; maxScore: number }
    >();

    for (const r of attempt.responses) {
      const s = r.question.subject;
      const key = s?.id ?? '__none__';
      const entry = bySubject.get(key) ?? {
        subject: s?.name ?? 'इतर',
        orderIndex: s?.orderIndex ?? 999,
        questionCount: 0,
        correct: 0,
        score: 0,
        maxScore: 0,
      };
      entry.questionCount += 1;
      entry.maxScore += r.question.marks;
      if (r.isCorrect) {
        entry.correct += 1;
        entry.score += r.question.marks;
      }
      bySubject.set(key, entry);
    }

    return {
      attemptId: attempt.id,
      // App ला हा लागतो — या test मधले खुणलेले प्रश्न मागवायला (`/bookmarks/quiz/:id`).
      // Attempt id आणि quiz id वेगळे आहेत; एकाच test चे अनेक attempts असतात.
      quizId: attempt.quiz.id,
      testTitle: attempt.quiz.title,
      submittedAt: attempt.createdAt.toISOString(),
      score: attempt.score,
      totalMarks: attempt.quiz.marks,
      percentage: attempt.percentage,
      correct: attempt.correctAnswers,
      incorrect: attempt.wrongAnswers,
      unattempted: attempt.skippedQuestions,
      timeTakenSeconds: attempt.timeTaken,
      durationSeconds: attempt.quiz.duration * 60,
      percentile: attempt.percentile,
      subjects: [...bySubject.values()].sort((a, b) => a.orderIndex - b.orderIndex),
      answers: attempt.responses.map((r) => ({
        questionId: r.question.id,
        text: r.question.text,
        options: [
          { key: 'A' as const, text: r.question.optionA },
          { key: 'B' as const, text: r.question.optionB },
          { key: 'C' as const, text: r.question.optionC },
          { key: 'D' as const, text: r.question.optionD },
        ],
        chosenOption: r.chosenOption,
        correctAnswer: r.question.correctAnswer,
        explanation: r.question.explanation,
        isCorrect: r.isCorrect,
        // उजळणीत विषय दाखवायला — bookmark कार्डावर तोच दिसतो, म्हणून दोन
        // ठिकाणी सारखं.
        subject: r.question.subject?.name ?? 'इतर',
      })),
    };
  }
}
