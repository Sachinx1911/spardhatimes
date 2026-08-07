import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

/**
 * सूचना (notifications).
 *
 * या नोंदी grading, certificate आणि release यंत्रणा **आधीच बनवतात** —
 * `submitQuizAttempt` निकालाची सूचना टाकतो, certificate मिळाल्यावर वेगळी, आणि
 * नवीन test उघडल्यावर release sweep एक. इथे फक्त त्या वाचायच्या, मोजायच्या आणि
 * वाचल्या म्हणून खुणायच्या — बनवायच्या नाहीत.
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** माझ्या सूचना — नवीन आधी. */
  async list(userId: string) {
    const rows = await this.prisma.client.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      // वीसच — घंटा उघडल्यावर विद्यार्थी वरच्या काही बघतो; जुन्या शेकडो
      // सूचना मोबाइल जाळ्यावर वाहून नेण्यात अर्थ नाही.
      take: 50,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        read: true,
        createdAt: true,
      },
    });

    return rows.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));
  }

  /** घंटेवरचा आकडा — फक्त न वाचलेल्या. */
  async unreadCount(userId: string) {
    const count = await this.prisma.client.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }

  /**
   * सगळ्या वाचल्या म्हणून खुणणे. घंटा उघडली की एकदाच — प्रत्येक सूचना वेगळी
   * खुणण्यापेक्षा हे सोपं आणि विद्यार्थ्याला अपेक्षित.
   *
   * `updateMany` एका फेरीत; per-row केलं असतं तर Supabase ~170ms दूर असल्याने
   * रेंगाळलं असतं.
   */
  async markAllRead(userId: string) {
    const r = await this.prisma.client.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { updated: r.count };
  }
}
