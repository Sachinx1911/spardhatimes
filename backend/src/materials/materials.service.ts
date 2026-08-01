import { Injectable, NotFoundException } from '@nestjs/common';
import { StudyMaterialType } from '@mahatest/db';

import { PrismaService } from '../prisma/prisma.service';

/**
 * अभ्यास साहित्य — Learn tab मागचं सगळं.
 *
 * "मागील वर्षांचे प्रश्न" इथे नाहीत: ते `Quiz` आहेत (`type = PYQ`), कारण ते
 * वाचायचे नसून **सोडवायचे** असतात. दोन्ही एकाच यादीत कोंबले असते तर एकाला
 * "उघडा" आणि दुसऱ्याला "सोडवा" असे दोन वेगळे अर्थ एकाच आकारात बसवावे लागले
 * असते.
 */
@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Learn चा पहिला पडदा.
   *
   * एका फेरीत सगळं: संख्या, विषय (प्रगतीसह), पुढे सुरू ठेवायचं साहित्य, आणि
   * शिफारशी. वेगवेगळ्या requests केल्या असत्या तर पडदा तुकड्या-तुकड्याने भरला
   * असता.
   */
/**
   * PDF Notes चा पडदा — **विषयानुसार टिपणांची संख्या.**
   *
   * `overview` सगळ्या प्रकारांची संख्या देतो (व्हिडिओ, पुस्तकं धरून). इथे
   * फक्त `NOTE` हवेत, म्हणून वेगळी मोजणी — नाहीतर "इतिहास 18 नोट्स" च्या
   * जागी व्हिडिओसुद्धा मोजले जातील आणि आकडा खोटा ठरेल.
   */
  async notesBySubject() {
    const subjects = await this.prisma.client.subject.findMany({
      select: {
        id: true,
        name: true,
        orderIndex: true,
        _count: { select: { materials: { where: { published: true, type: 'NOTE' } } } },
      },
      orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
    });

    // टिपण नसलेला विषय दाखवण्यात अर्थ नाही — तो दाबल्यावर रिकामी यादीच उघडेल.
    const withNotes = subjects.filter((s) => s._count.materials > 0);

    return {
      totalNotes: withNotes.reduce((n, s) => n + s._count.materials, 0),
      subjects: withNotes.map((s) => ({
        id: s.id,
        name: s.name,
        noteCount: s._count.materials,
      })),
    };
  }

  async overview(userId: string) {
    const [counts, pyqCount, subjects, progress] = await Promise.all([
      this.prisma.client.studyMaterial.groupBy({
        by: ['type'],
        where: { published: true },
        _count: true,
      }),
      this.prisma.client.quiz.count({ where: { type: 'PYQ', status: 'PUBLISHED' } }),
      this.prisma.client.subject.findMany({
        select: {
          id: true,
          name: true,
          orderIndex: true,
          _count: { select: { materials: { where: { published: true } } } },
        },
        orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.client.studyMaterialProgress.findMany({
        where: { userId, material: { published: true } },
        select: {
          percent: true,
          lastOpenedAt: true,
          completedAt: true,
          material: {
            select: {
              id: true,
              title: true,
              slug: true,
              type: true,
              url: true,
              durationSeconds: true,
              pageCount: true,
              subjectId: true,
              subject: { select: { name: true } },
            },
          },
        },
        orderBy: { lastOpenedAt: 'desc' },
      }),
    ]);

    const countFor = (t: StudyMaterialType) =>
      counts.find((c) => c.type === t)?._count ?? 0;

    // विषयाची प्रगती = त्या विषयातलं किती साहित्य पूर्ण झालं.
    const doneBySubject = new Map<string, number>();
    for (const p of progress) {
      if (!p.completedAt || !p.material.subjectId) continue;
      doneBySubject.set(
        p.material.subjectId,
        (doneBySubject.get(p.material.subjectId) ?? 0) + 1
      );
    }

    /**
     * "पुढे सुरू ठेवा" — सुरू केलेलं पण **पूर्ण न झालेलं**, अलीकडे उघडलेलं आधी.
     * पूर्ण झालेलं इथे दाखवलं तर ती यादी कधीच रिकामी होणार नाही आणि
     * विद्यार्थ्याला पुढे काय करायचं ते कळणार नाही.
     */
    const continueLearning = progress
      .filter((p) => !p.completedAt)
      .slice(0, 3)
      .map((p) => ({
        id: p.material.id,
        title: p.material.title,
        slug: p.material.slug,
        type: p.material.type,
        url: p.material.url,
        subjectName: p.material.subject?.name ?? null,
        percent: p.percent,
        durationSeconds: p.material.durationSeconds,
        pageCount: p.material.pageCount,
      }));

    return {
      counts: {
        notes: countFor('NOTE'),
        videos: countFor('VIDEO'),
        books: countFor('BOOK'),
        shorts: countFor('SHORT'),
        // PYQ `Quiz` मधून येतो, `StudyMaterial` मधून नाही.
        pyqs: pyqCount,
      },
      subjects: subjects
        // साहित्य नसलेला विषय Learn मध्ये दाखवण्यात अर्थ नाही — तो दाबल्यावर
        // रिकामी यादीच उघडेल.
        .filter((s) => s._count.materials > 0)
        .map((s) => {
          const done = doneBySubject.get(s.id) ?? 0;
          return {
            id: s.id,
            name: s.name,
            materialCount: s._count.materials,
            completedCount: done,
            percent: Math.round((done / s._count.materials) * 100),
          };
        }),
      continueLearning,
    };
  }

  /** एका प्रकाराची यादी, हवं असल्यास विषयानुसार गाळलेली. */
  async list(type?: StudyMaterialType, subjectId?: string) {
    const materials = await this.prisma.client.studyMaterial.findMany({
      where: {
        published: true,
        ...(type ? { type } : {}),
        ...(subjectId ? { subjectId } : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        type: true,
        url: true,
        thumbnailUrl: true,
        durationSeconds: true,
        pageCount: true,
        publishedAt: true,
        subject: { select: { id: true, name: true } },
      },
      // `orderIndex` ने admin ला क्रम ठरवता येतो; बाकीचे नव्याने-जुन्याकडे.
      orderBy: [{ orderIndex: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return materials.map((m) => ({
      id: m.id,
      title: m.title,
      slug: m.slug,
      description: m.description,
      type: m.type,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      durationSeconds: m.durationSeconds,
      pageCount: m.pageCount,
      subjectId: m.subject?.id ?? null,
      subjectName: m.subject?.name ?? null,
      publishedAt: m.publishedAt?.toISOString() ?? null,
    }));
  }

  async bySlug(slug: string) {
    const m = await this.prisma.client.studyMaterial.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        url: true,
        thumbnailUrl: true,
        durationSeconds: true,
        pageCount: true,
        publishedAt: true,
        published: true,
        subject: { select: { id: true, name: true } },
      },
    });

    // अप्रकाशित साहित्य "नाही" म्हणूनच नाकारायचं — "आहे पण बंद आहे" सांगितलं
    // तर काय तयार होतंय ते बाहेर कळतं.
    if (!m || !m.published) throw new NotFoundException('हे साहित्य उपलब्ध नाही.');

    return {
      id: m.id,
      title: m.title,
      description: m.description,
      type: m.type,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      durationSeconds: m.durationSeconds,
      pageCount: m.pageCount,
      subjectId: m.subject?.id ?? null,
      subjectName: m.subject?.name ?? null,
      publishedAt: m.publishedAt?.toISOString() ?? null,
    };
  }

  /**
   * किती वाचलं/बघितलं ते नोंदवणे.
   *
   * `upsert` — विद्यार्थी तेच साहित्य पुन्हा उघडतो, आणि प्रत्येक वेळी नवी ओळ
   * बनली असती तर प्रगती दुभंगली असती (`@@unique([userId, materialId])` तसं
   * होऊही देत नाही).
   *
   * प्रगती **मागे नेत नाही**: विद्यार्थ्याने अर्धा व्हिडिओ बघून सुरुवातीपासून
   * पुन्हा उघडला तर 50% चं 5% होऊ नये.
   */
  async saveProgress(userId: string, materialId: string, percent: number) {
    const material = await this.prisma.client.studyMaterial.findUnique({
      where: { id: materialId },
      select: { id: true, published: true },
    });
    if (!material || !material.published) {
      throw new NotFoundException('हे साहित्य उपलब्ध नाही.');
    }

    const existing = await this.prisma.client.studyMaterialProgress.findUnique({
      where: { userId_materialId: { userId, materialId } },
      select: { percent: true, completedAt: true },
    });

    const next = Math.max(percent, existing?.percent ?? 0);
    const now = new Date();
    // एकदा पूर्ण झालं की पूर्णच — पूर्ण होण्याची वेळ पुन्हा लिहीत नाही.
    const completedAt = existing?.completedAt ?? (next >= 100 ? now : null);

    const saved = await this.prisma.client.studyMaterialProgress.upsert({
      where: { userId_materialId: { userId, materialId } },
      update: { percent: next, lastOpenedAt: now, completedAt },
      create: { userId, materialId, percent: next, lastOpenedAt: now, completedAt },
      select: { percent: true, completedAt: true },
    });

    return {
      percent: saved.percent,
      completed: saved.completedAt !== null,
    };
  }
}
