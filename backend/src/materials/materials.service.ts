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

  /** Learn चा पहिला पडदा — प्रत्येक प्रकाराची संख्या आणि विषयांची यादी. */
  async overview() {
    const [counts, pyqCount, subjects] = await Promise.all([
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
    ]);

    const countFor = (t: StudyMaterialType) =>
      counts.find((c) => c.type === t)?._count ?? 0;

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
        .map((s) => ({
          id: s.id,
          name: s.name,
          materialCount: s._count.materials,
        })),
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
}
