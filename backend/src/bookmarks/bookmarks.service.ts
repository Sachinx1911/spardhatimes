import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

/**
 * बुकमार्क — विद्यार्थ्याने खुणा करून ठेवलेले प्रश्न.
 *
 * ## एकच नियम, आणि तो सुरक्षेचा आहे
 *
 * **सोडवलेल्या प्रश्नालाच bookmark करता येतो.** म्हणजे त्याच प्रश्नावर या
 * विद्यार्थ्याचा एक पूर्ण झालेला attempt असावा लागतो.
 *
 * हे नुसतं उत्पादनाचं वैशिष्ट्य नाही. या यादीत बरोबर उत्तर आणि खुलासा दोन्ही
 * जातात — आणि तेच `startTest` मधून मुद्दाम वगळलेले आहेत, नाहीतर test देतानाच
 * उत्तरं दिसतील. सोडवलेला प्रश्न ही रेषा नेमकी जुळवते: तो प्रश्न विद्यार्थ्याने
 * निकालाच्या पडद्यावर आधीच उत्तरासह पाहिला आहे, म्हणून तो पुन्हा दाखवणं नवीन
 * काहीच उघड करत नाही.
 *
 * नाहीतर कोणीही कुठल्याही `questionId` वर bookmark टाकून, विकत न घेतलेल्या
 * series मधल्या प्रश्नांची उत्तरं या endpoint मधून वाचू शकला असता.
 */
@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * माझे बुकमार्क — नवीन आधी.
   *
   * उत्तर आणि खुलासा इथे येतात; वरचं टिप्पण पाहा. Options सुद्धा पाठवतो, कारण
   * "बरोबर उत्तर C" एवढंच दाखवलं तर C काय होतं ते विद्यार्थ्याला कळत नाही.
   */
  async list(userId: string) {
    const rows = await this.prisma.client.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        quiz: {
          select: { id: true, title: true, testSeries: { select: { title: true } } },
        },
        question: {
          select: {
            id: true,
            type: true,
            text: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            correctAnswer: true,
            explanation: true,
            subject: { select: { name: true } },
          },
        },
      },
    });

    return rows.map((b) => ({
      id: b.id,
      questionId: b.question.id,
      quizId: b.quiz.id,
      testTitle: b.quiz.title,
      seriesTitle: b.quiz.testSeries?.title ?? null,
      // विषय न दिलेल्या प्रश्नांसाठी "इतर" — निकालाच्या पडद्यावरही तेच नाव आहे,
      // म्हणून दोन ठिकाणी दोन नावं दिसत नाहीत.
      subject: b.question.subject?.name ?? 'इतर',
      type: b.question.type,
      text: b.question.text,
      options: [
        { key: 'A' as const, text: b.question.optionA },
        { key: 'B' as const, text: b.question.optionB },
        { key: 'C' as const, text: b.question.optionC },
        { key: 'D' as const, text: b.question.optionD },
      ],
      correctAnswer: b.question.correctAnswer,
      explanation: b.question.explanation,
      createdAt: b.createdAt.toISOString(),
    }));
  }

  /**
   * खूण करणे.
   *
   * `quizId` client कडून घेत नाही — तो प्रश्नावरूनच काढतो. घेतला असता तर कोणी
   * दुसऱ्या quiz चा id पाठवून नोंद गोंधळात टाकू शकला असता.
   *
   * आधीच असेल तर चूक देत नाही; तीच नोंद परत करतो. App मध्ये हे एक toggle आहे
   * आणि दोनदा दाबणं ही चूक मानायची गरज नाही.
   */
  async add(userId: string, questionId: string) {
    const question = await this.prisma.client.question.findUnique({
      where: { id: questionId },
      select: { id: true, quizId: true },
    });
    if (!question) throw new NotFoundException('प्रश्न सापडला नाही.');

    const attempted = await this.prisma.client.questionResponse.findFirst({
      where: {
        questionId,
        attempt: { userId, status: 'COMPLETED' },
      },
      select: { id: true },
    });
    if (!attempted) {
      throw new ForbiddenException('हा प्रश्न तुम्ही सोडवलेला नाही.');
    }

    const bookmark = await this.prisma.client.bookmark.upsert({
      where: { userId_questionId: { userId, questionId } },
      // काहीच बदलायचं नाही — `upsert` फक्त "असेल तर तसंच ठेव" साठी वापरला आहे.
      // `create` वापरला असता तर दुसऱ्या वेळी unique constraint फुटला असता.
      update: {},
      create: { userId, questionId, quizId: question.quizId },
      select: { id: true, createdAt: true },
    });

    return { id: bookmark.id, questionId, createdAt: bookmark.createdAt.toISOString() };
  }

  /**
   * खूण काढणे.
   *
   * `deleteMany` मुद्दाम — नोंद नसेल तरी चूक येत नाही. Toggle बंद करताना
   * "आधीच काढलेलं आहे" हा error दाखवण्यात अर्थ नाही.
   */
  async remove(userId: string, questionId: string) {
    await this.prisma.client.bookmark.deleteMany({ where: { userId, questionId } });
  }

  /**
   * निकालाच्या पडद्यासाठी — या quiz मधले कोणते प्रश्न आधीच खुणलेले आहेत.
   *
   * प्रत्येक प्रश्नासाठी वेगळी विनंती करण्यापेक्षा एकदाच यादी; app त्यातून
   * प्रत्येक ओळीचं चिन्ह ठरवतो.
   */
  async questionIdsForQuiz(userId: string, quizId: string) {
    const rows = await this.prisma.client.bookmark.findMany({
      where: { userId, quizId },
      select: { questionId: true },
    });
    return rows.map((r) => r.questionId);
  }
}
