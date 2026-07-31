import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentGateway } from '@mahatest/db';

import { PrismaService } from '../prisma/prisma.service';

/**
 * खरेदी.
 *
 * इथला सर्वात महत्त्वाचा नियम: **किंमत नेहमी database मधून.** App कधीच रक्कम
 * पाठवत नाही आणि पाठवली तरी वापरली जात नाही — नाहीतर ₹799 ची series ₹1 ला
 * विकली जाईल. App फक्त "कोणती series" एवढंच सांगतो.
 */
@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * मुदत मोजणे — आजपासून `validityMonths` महिने.
   *
   * `0` म्हणजे कायमस्वरूपी, तेव्हा `null` (entitlement तपासणी null ला
   * "कधीच संपत नाही" असं वाचते).
   *
   * `setMonth` महिन्याचे दिवस स्वतः सांभाळतो: 31 जानेवारीला एक महिना जोडला की
   * JavaScript 3 मार्च करतो. विद्यार्थ्याच्या बाजूने तो एक दिवस जास्त आहे,
   * कमी नाही — म्हणून तो चालेल.
   */
  private expiryFor(validityMonths: number, from = new Date()): Date | null {
    if (validityMonths <= 0) return null;
    const d = new Date(from);
    d.setMonth(d.getMonth() + validityMonths);
    return d;
  }

  /**
   * विद्यार्थ्याला series चा access देणे.
   *
   * `upsert` मुद्दाम — webhook तोच event दोनदा पाठवू शकतो, आणि दोनदा access
   * बनवण्याचा प्रयत्न झाला तर unique बांध तुटून चूक येईल. दुसऱ्यांदा आल्यावर
   * फक्त मुदत ताजी होते.
   */
  private async grantAccess(
    userId: string,
    testSeriesId: string,
    validityMonths: number,
    orderId: string | null
  ) {
    const expiresAt = this.expiryFor(validityMonths);
    await this.prisma.client.testSeriesAccess.upsert({
      where: { userId_testSeriesId: { userId, testSeriesId } },
      update: { expiresAt, orderId },
      create: { userId, testSeriesId, expiresAt, orderId },
    });
    return expiresAt;
  }

  /**
   * खरेदी सुरू करणे.
   *
   * मोफत series ला order बनवत नाही — gateway ला ₹0 पाठवण्यात अर्थ नाही आणि
   * तो नाकारतोही. तिथे थेट access देतो.
   */
  async createOrder(userId: string, testSeriesId: string) {
    const series = await this.prisma.client.testSeries.findUnique({
      where: { id: testSeriesId },
      select: {
        id: true,
        title: true,
        published: true,
        priceInPaise: true,
        validityMonths: true,
      },
    });

    if (!series || !series.published) {
      throw new NotFoundException('ही test series उपलब्ध नाही.');
    }

    // आधीच चालू access असेल तर पुन्हा पैसे घ्यायचे नाहीत.
    const existing = await this.prisma.client.testSeriesAccess.findUnique({
      where: { userId_testSeriesId: { userId, testSeriesId } },
      select: { expiresAt: true },
    });
    if (existing && (existing.expiresAt === null || existing.expiresAt > new Date())) {
      throw new BadRequestException('ही series तुमच्याकडे आधीच आहे.');
    }

    if (series.priceInPaise === 0) {
      const expiresAt = await this.grantAccess(
        userId,
        series.id,
        series.validityMonths,
        null
      );
      return { free: true as const, expiresAt: expiresAt?.toISOString() ?? null };
    }

    // पैसे घ्यायचे आहेत — पण gateway अजून जोडलेला नाही. Order ची नोंद ठेवणं
    // इथेच शक्य आहे; checkout ची URL gateway आल्यावर.
    throw new BadRequestException(
      'ऑनलाइन खरेदी अजून सुरू झालेली नाही. तोपर्यंत ही series मिळवण्यासाठी संपर्क साधा.'
    );
  }

  /** माझ्या खरेदी — Profile मधल्या "My Purchases" साठी. */
  async myOrders(userId: string) {
    const orders = await this.prisma.client.order.findMany({
      where: { userId },
      select: {
        id: true,
        amountInPaise: true,
        status: true,
        gateway: true,
        createdAt: true,
        paidAt: true,
        testSeries: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => ({
      id: o.id,
      seriesId: o.testSeries.id,
      seriesTitle: o.testSeries.title,
      amountInPaise: o.amountInPaise,
      status: o.status,
      gateway: o.gateway,
      createdAt: o.createdAt.toISOString(),
      paidAt: o.paidAt?.toISOString() ?? null,
    }));
  }

  /**
   * पैसे आल्याची नोंद आणि access देणे.
   *
   * हे **फक्त पडताळलेल्या webhook मधून** बोलावलं जातं. App चा "payment
   * success" callback कधीच इथे पोहोचत नाही — तो सहज खोटा बनवता येतो.
   *
   * पूर्ण क्रिया एका transaction मध्ये: order `PAID` होणं आणि access मिळणं
   * एकत्रच घडलं पाहिजे. मधेच तुटलं तर विद्यार्थ्याचे पैसे गेले आणि access
   * नाही — तीच सर्वात वाईट स्थिती.
   */
  async markPaid(gatewayOrderId: string, gatewayPaymentId: string, amountInPaise: number) {
    const order = await this.prisma.client.order.findUnique({
      where: { gatewayOrderId },
      select: {
        id: true,
        userId: true,
        testSeriesId: true,
        amountInPaise: true,
        status: true,
        testSeries: { select: { validityMonths: true } },
      },
    });

    if (!order) {
      // Gateway ला ठीक सांगायचं — नाहीतर तो हाच event पुन्हा पुन्हा पाठवत राहील.
      return { ok: false as const, reason: 'unknown-order' as const };
    }

    // आधीच नोंदलेलं असेल तर काहीच करायचं नाही. Razorpay/Instamojo तोच event
    // पुन्हा पाठवतात, आणि दुसऱ्यांदा मुदत वाढवली तर फुकट दुप्पट access मिळेल.
    if (order.status === OrderStatus.PAID) {
      return { ok: true as const, reason: 'already-paid' as const };
    }

    // Gateway ने घेतलेली रक्कम आपल्या नोंदीशी जुळली पाहिजे. जुळली नाही तर
    // access द्यायचा नाही — कमी पैसे भरून पूर्ण series मिळवण्याचा मार्ग बंद.
    if (amountInPaise !== order.amountInPaise) {
      await this.prisma.client.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.FAILED, gatewayPaymentId },
      });
      return { ok: false as const, reason: 'amount-mismatch' as const };
    }

    await this.prisma.client.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID, gatewayPaymentId, paidAt: new Date() },
      });

      const expiresAt = this.expiryFor(order.testSeries.validityMonths);
      await tx.testSeriesAccess.upsert({
        where: {
          userId_testSeriesId: { userId: order.userId, testSeriesId: order.testSeriesId },
        },
        update: { expiresAt, orderId: order.id },
        create: {
          userId: order.userId,
          testSeriesId: order.testSeriesId,
          expiresAt,
          orderId: order.id,
        },
      });
    });

    return { ok: true as const, reason: 'granted' as const };
  }
}
