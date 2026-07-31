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

    const mark = await this.prisma.client.articleBookmark.findUnique({
      where: { userId_articleId: { userId, articleId: a.id } },
      select: { id: true },
    });

    return {
      ...this.toListItem(a),
      // पूर्ण मजकूर **फक्त इथे** — यादीत तो नसतो.
      body: a.body,
      updatedAt: a.updatedAt.toISOString(),
      bookmarked: !!mark,
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
