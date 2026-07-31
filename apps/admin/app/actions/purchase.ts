"use server";

import { revalidatePath } from "next/cache";
import { accessExpiryFor, isAccessLive } from "@mahatest/core";
import { db } from "@mahatest/db";

import { getSession } from "@/lib/session";

/**
 * Dashboard वरून test series विकत घेणे.
 *
 * ## दोन नियम, दोन्ही सुरक्षेचे
 *
 * **१. किंमत नेहमी database मधून.** Client कधीच रक्कम पाठवत नाही, आणि पाठवली
 * तरी वाचली जात नाही — नाहीतर ₹799 ची series ₹1 ला विकली जाईल. फक्त "कोणती
 * series" एवढंच client सांगतो.
 *
 * **२. auth इथेच तपासायचं.** Server Actions हे फक्त UI मधूनच नाही, थेट POST
 * विनंतीनेही चालवता येतात (Next.js च्या docs मध्ये तशी स्पष्ट सूचना आहे).
 * म्हणून "पान उघडायला login लागतो" एवढं पुरेसं नाही; तपासणी इथे आहे.
 *
 * हेच तर्क mobile app साठी `backend/src/payments/orders.service.ts` मध्ये आहे.
 * मुदतीचं आणि सवलतीचं गणित दोन्हीकडे एकच — `@mahatest/core` मधून. पैशाशी
 * संबंधित गणित दोन ठिकाणी वेगळं लिहिलं की ते हळूहळू वेगळं वागायला लागतं.
 */
export async function startPurchase(seriesId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "खरेदी करण्यासाठी login करा." };
  }
  const userId = session.user.id;

  const series = await db.testSeries.findUnique({
    where: { id: seriesId },
    select: {
      id: true,
      title: true,
      published: true,
      priceInPaise: true,
      validityMonths: true,
    },
  });

  // अप्रकाशित series ला सुद्धा "उपलब्ध नाही" — "तुम्हाला घेता येणार नाही" म्हटलं
  // तर ती अस्तित्वात आहे हेच सांगून होतं.
  if (!series || !series.published) {
    return { error: "ही test series उपलब्ध नाही." };
  }

  // आधीच चालू access असेल तर पुन्हा पैसे घ्यायचे नाहीत. मुदत संपलेली असेल तर
  // मात्र पुन्हा घेता येते — म्हणून `isAccessLive`, नुसतं "नोंद आहे का" नाही.
  const existing = await db.testSeriesAccess.findUnique({
    where: { userId_testSeriesId: { userId, testSeriesId: series.id } },
    select: { expiresAt: true },
  });
  if (existing && isAccessLive(existing.expiresAt)) {
    return { error: "ही series तुमच्याकडे आधीच आहे." };
  }

  // मोफत series ला order बनवत नाही — gateway ला ₹0 पाठवण्यात अर्थ नाही आणि तो
  // नाकारतोही. थेट access.
  if (series.priceInPaise === 0) {
    const expiresAt = accessExpiryFor(series.validityMonths);

    // `upsert` — मुदत संपलेली नोंद आधीच असेल तर तीच ताजी करायची, नवीन बनवायची
    // नाही (unique बांध तुटेल).
    await db.testSeriesAccess.upsert({
      where: { userId_testSeriesId: { userId, testSeriesId: series.id } },
      update: { expiresAt, orderId: null },
      create: { userId, testSeriesId: series.id, expiresAt, orderId: null },
    });

    revalidatePath("/dashboard");
    return { ok: true as const, free: true as const, title: series.title };
  }

  /**
   * पैसे घ्यायची series — gateway अजून जोडलेला नाही (plan doc चा टप्पा ३).
   *
   * इथे `Order` ची नोंद ठेवून पुढे जाता येईल, पण checkout ची URL देता येत नाही,
   * म्हणून अर्धवट `CREATED` order मागे राहिली असती आणि "मी पैसे भरले का?" असा
   * प्रश्न पडला असता. Gateway आल्यावर हा भाग तेवढाच बदलायचा आहे.
   */
  return {
    error:
      "ऑनलाइन खरेदी अजून सुरू झालेली नाही. ही series मिळवण्यासाठी संपर्क साधा.",
  };
}
