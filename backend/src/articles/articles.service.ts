import { Injectable, NotFoundException } from '@nestjs/common';
import { articleExcerpt, readingMinutes } from '@mahatest/core';

import { PrismaService } from '../prisma/prisma.service';

/**
 * चालू घडामोडी.
 *
 * ## हे test series सारखं "विकत घेतलेलं" नाही
 *
 * लेख **सगळ्या** login केलेल्या विद्यार्थ्यांना दिसतात — entitlement तपासणी इथे
 * नाही, आणि ती मुद्दाम नाही. चालू घडामोडी हे रोज परत आणणारं आकर्षण आहे; ते
 * पैशाच्या भिंतीमागे ठेवलं तर app उघडायचं कारणच उरत नाही. पुढे "premium लेख"
 * ठरवलं तर `Article` वर एक field आणि इथे एक तपासणी — तेवढंच.
 *
 * `published: false` असलेले लेख कधीच बाहेर जात नाहीत, म्हणून admin अर्धवट लेख
 * बिनधास्त लिहून ठेवू शकतो.
 */
@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  /** यादीत आणि carousel मध्ये लागणारी fields — एकाच ठिकाणी ठरवली. */
  private static readonly listSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    body: true,
    imageUrl: true,
    publishedAt: true,
    isTopNews: true,
    category: {
      select: { id: true, name: true, nameEn: true, slug: true, icon: true, color: true },
    },
  } as const;

  /**
   * यादीची एक ओळ.
   *
   * `body` पूर्ण पाठवत नाही — यादीत तो लागत नाही आणि दहा लेखांचा पूर्ण मजकूर
   * मोबाइल जाळ्यावर उगीच वाहून नेण्यात अर्थ नाही. सारांश आणि वाचनाचा वेळ
   * इथेच काढतो.
   */
  private toListItem(a: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    body: string;
    imageUrl: string | null;
    publishedAt: Date | null;
    isTopNews: boolean;
    category: {
      id: string;
      name: string;
      nameEn: string | null;
      slug: string;
      icon: string | null;
      color: string | null;
    };
  }) {
    return {
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: articleExcerpt(a.excerpt, a.body),
      imageUrl: a.imageUrl,
      readMinutes: readingMinutes(a.body),
      isTopNews: a.isTopNews,
      publishedAt: a.publishedAt?.toISOString() ?? null,
      categoryId: a.category.id,
      categoryName: a.category.name,
      categorySlug: a.category.slug,
      categoryNameEn: a.category.nameEn,
      categoryIcon: a.category.icon,
      categoryColor: a.category.color,
    };
  }

  /**
   * पडदा उघडताना लागणारं सगळं **एका फेरीत** — carousel, यादी, आणि गट.
   *
   * `dashboard` सारखंच: तीन वेगळ्या requests केल्या असत्या तर पडदा तुकड्या-
   * तुकड्याने भरला असता.
   */
  async screen(userId: string) {
    const [topNews, latest, categories, marked] = await Promise.all([
      this.prisma.client.article.findMany({
        where: { published: true, isTopNews: true },
        orderBy: { publishedAt: 'desc' },
        // Carousel मध्ये पाचहून जास्त सरकवणारं कोणी नाही.
        take: 5,
        select: ArticlesService.listSelect,
      }),
      this.prisma.client.article.findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        take: 20,
        select: ArticlesService.listSelect,
      }),
      this.prisma.client.articleCategory.findMany({
        orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          nameEn: true,
          slug: true,
          icon: true,
          color: true,
          // आकडा **प्रकाशित** लेखांचाच — admin च्या draft नी विद्यार्थ्याला
          // "128 Articles" दाखवून फसवू नये.
          _count: { select: { articles: { where: { published: true } } } },
        },
      }),
      this.prisma.client.articleBookmark.findMany({
        where: { userId },
        select: { articleId: true },
      }),
    ]);

    const markedIds = new Set(marked.map((m) => m.articleId));
    const withMark = (a: (typeof latest)[number]) => ({
      ...this.toListItem(a),
      bookmarked: markedIds.has(a.id),
    });

    return {
      topNews: topNews.map(withMark),
      latest: latest.map(withMark),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        /** Chips साठी. null असेल तर app मराठी नाव वापरतो. */
        nameEn: c.nameEn,
        slug: c.slug,
        icon: c.icon,
        color: c.color,
        articleCount: c._count.articles,
      })),
    };
  }

  /**
   * एका गटातले लेख.
   *
   * `categorySlug` न दिला तर सगळे — म्हणजे app मधल्या "सर्व" chip ला वेगळा मार्ग
   * लागत नाही.
   */
  async list(userId: string, categorySlug?: string) {
    const [rows, marked] = await Promise.all([
      this.prisma.client.article.findMany({
        where: {
          published: true,
          ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        },
        orderBy: { publishedAt: 'desc' },
        take: 50,
        select: ArticlesService.listSelect,
      }),
      this.prisma.client.articleBookmark.findMany({
        where: { userId },
        select: { articleId: true },
      }),
    ]);

    const markedIds = new Set(marked.map((m) => m.articleId));
    return rows.map((a) => ({ ...this.toListItem(a), bookmarked: markedIds.has(a.id) }));
  }

  /**
   * एक पूर्ण लेख.
   *
   * `slug` ने शोधतो, id ने नाही — तोच पत्ता पुढे website वर आणि share केलेल्या
   * दुव्यात वापरता येईल.
   */
  async one(userId: string, slug: string) {
    /**
     * `findFirst` वापरला आहे, `findUnique` नाही — `slug` unique असला तरी त्यासोबत
     * `published` ची अट घालायची आहे आणि `findUnique` ला फक्त unique fields चालतात.
     *
     * अप्रकाशित लेखाला सुद्धा "सापडला नाही" — "तुम्हाला बघता येणार नाही" म्हटलं
     * तर तो अस्तित्वात आहे हेच सांगून होतं.
     */
    const a = await this.prisma.client.article.findFirst({
      where: { slug, published: true },
      select: { ...ArticlesService.listSelect, updatedAt: true },
    });
    if (!a) throw new NotFoundException('लेख सापडला नाही.');

    const [mark, reactions, mine, source, prev, next] = await Promise.all([
      this.prisma.client.articleBookmark.findUnique({
        where: { userId_articleId: { userId, articleId: a.id } },
        select: { id: true },
      }),
      this.prisma.client.articleReaction.groupBy({
        by: ['type'],
        where: { articleId: a.id },
        _count: true,
      }),
      this.prisma.client.articleReaction.findUnique({
        where: { userId_articleId: { userId, articleId: a.id } },
        select: { type: true },
      }),
      this.prisma.client.article.findUnique({
        where: { id: a.id },
        select: { sourceName: true, sourceUrl: true, viewCount: true, publishedAt: true },
      }),
      // मागील / पुढील — प्रकाशनाच्या क्रमाने शेजारचा लेख.
      this.prisma.client.article.findFirst({
        where: { published: true, publishedAt: { lt: a.publishedAt ?? new Date() } },
        orderBy: { publishedAt: 'desc' },
        select: { slug: true, title: true },
      }),
      this.prisma.client.article.findFirst({
        where: { published: true, publishedAt: { gt: a.publishedAt ?? new Date() } },
        orderBy: { publishedAt: 'asc' },
        select: { slug: true, title: true },
      }),
    ]);

    // वाचकसंख्या वाढवणे — निकालाची वाट बघत नाही. ती एका आकड्याने चुकली तरी
    // चालेल, पण त्यासाठी लेख उघडायला उशीर होणं चालणार नाही.
    this.prisma.client.article
      .update({ where: { id: a.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});

    const countOf = (t: 'LIKE' | 'DISLIKE') =>
      reactions.find((r) => r.type === t)?._count ?? 0;

    return {
      ...this.toListItem(a),
      // पूर्ण मजकूर **फक्त इथे** — यादीत तो नसतो.
      body: a.body,
      updatedAt: a.updatedAt.toISOString(),
      bookmarked: !!mark,
      sourceName: source?.sourceName ?? null,
      sourceUrl: source?.sourceUrl ?? null,
      // वाढवलेली संख्या लगेच दिसावी म्हणून +1 — वरचं update मागे चालू आहे.
      viewCount: (source?.viewCount ?? 0) + 1,
      likes: countOf('LIKE'),
      dislikes: countOf('DISLIKE'),
      myReaction: mine?.type ?? null,
      prev: prev ? { slug: prev.slug, title: prev.title } : null,
      next: next ? { slug: next.slug, title: next.title } : null,
    };
  }

  /**
   * आवडलं / आवडलं नाही.
   *
   * तेच बटण पुन्हा दाबलं तर पसंती **मागे घेतली** जाते; दुसरं दाबलं तर बदलते.
   * एका विद्यार्थ्याची एकच नोंद असते, म्हणून आकडा फुगवता येत नाही.
   */
  async react(userId: string, articleId: string, type: 'LIKE' | 'DISLIKE') {
    const exists = await this.prisma.client.article.findFirst({
      where: { id: articleId, published: true },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('लेख सापडला नाही.');

    const current = await this.prisma.client.articleReaction.findUnique({
      where: { userId_articleId: { userId, articleId } },
      select: { type: true },
    });

    if (current?.type === type) {
      await this.prisma.client.articleReaction.delete({
        where: { userId_articleId: { userId, articleId } },
      });
    } else {
      await this.prisma.client.articleReaction.upsert({
        where: { userId_articleId: { userId, articleId } },
        update: { type },
        create: { userId, articleId, type },
      });
    }

    const counts = await this.prisma.client.articleReaction.groupBy({
      by: ['type'],
      where: { articleId },
      _count: true,
    });

    return {
      likes: counts.find((c) => c.type === 'LIKE')?._count ?? 0,
      dislikes: counts.find((c) => c.type === 'DISLIKE')?._count ?? 0,
      myReaction: current?.type === type ? null : type,
    };
  }

  /**
   * खुणलेले लेख — नवीन खूण आधी.
   *
   * क्रम `ArticleBookmark.createdAt` वरून, लेखाच्या तारखेवरून नाही: विद्यार्थ्याने
   * आत्ता खूण केलेला जुना लेख त्याला वरतीच अपेक्षित असतो.
   */
  async bookmarked(userId: string) {
    const rows = await this.prisma.client.articleBookmark.findMany({
      where: { userId, article: { published: true } },
      orderBy: { createdAt: 'desc' },
      select: { article: { select: ArticlesService.listSelect } },
    });

    return rows.map((r) => ({ ...this.toListItem(r.article), bookmarked: true }));
  }

  /** खूण करणे. आधीच असेल तरी चूक देत नाही — app मध्ये हे toggle आहे. */
  async bookmark(userId: string, articleId: string) {
    const exists = await this.prisma.client.article.findFirst({
      where: { id: articleId, published: true },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('लेख सापडला नाही.');

    await this.prisma.client.articleBookmark.upsert({
      where: { userId_articleId: { userId, articleId } },
      update: {},
      create: { userId, articleId },
      select: { id: true },
    });
  }

  /** खूण काढणे. नोंद नसेल तरी चूक येत नाही. */
  async unbookmark(userId: string, articleId: string) {
    await this.prisma.client.articleBookmark.deleteMany({ where: { userId, articleId } });
  }
}
