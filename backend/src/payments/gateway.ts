import { PaymentGateway } from '@mahatest/db';

/**
 * Payment gateway ची जागा.
 *
 * Razorpay आणि Instamojo दोन्ही चालावेत असं ठरलं आहे. दोघांचे API वेगळे आहेत,
 * पण आपल्याला त्यांच्याकडून लागतात फक्त दोन गोष्टी: पैसे भरण्याची एक URL, आणि
 * "पैसे आले" हे खात्रीने सांगणारा webhook. म्हणून तेवढंच इथे ठरवलं आहे.
 *
 * बाकी सगळं code या interface शीच बोलतो — कुठल्याही service मध्ये gateway चं
 * नाव येत नाही. त्यामुळे gateway बदलणं म्हणजे एक नवीन file लिहिणं, बाकी
 * कशालाही हात न लावता.
 */

export interface CreatePaymentInput {
  /** आपल्या Order चा id — gateway कडे संदर्भ म्हणून पाठवतो. */
  orderId: string;
  amountInPaise: number;
  /** विद्यार्थ्याला checkout वर काय घेतोय ते दिसावं म्हणून. */
  description: string;
  buyer: { name: string | null; phone: string | null; email: string | null };
}

export interface CreatePaymentResult {
  /** Gateway ने दिलेला id — `Order.gatewayOrderId` मध्ये साठवायचा. */
  gatewayOrderId: string;
  /**
   * विद्यार्थ्याला जिथे पाठवायचं ती URL.
   *
   * ही **बाहेरच्या browser मध्ये** उघडायची, app च्या WebView मध्ये नाही —
   * WebView मध्ये उघडली तर ती "in-app purchase" ठरते आणि Play Billing चा
   * हिस्सा लागतो.
   */
  checkoutUrl: string;
}

/** Webhook मधून जे कळतं तेवढंच. */
export interface VerifiedPayment {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  /** Gateway ने प्रत्यक्ष घेतलेली रक्कम — आपल्या order शी ताडून बघायची. */
  amountInPaise: number;
  paid: boolean;
}

export interface PaymentProvider {
  readonly name: PaymentGateway;

  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;

  /**
   * Webhook ची सही तपासून आतला मजकूर परत करते.
   *
   * सही जुळली नाही तर **null** — तेव्हा request नाकारायची. कोणीही आपल्या
   * webhook वर "पैसे आले" असं पाठवू शकतो; सही हाच एकमेव पुरावा.
   *
   * `rawBody` हा न बदललेला byte-साठा हवा. JSON parse करून पुन्हा stringify
   * केलेला चालत नाही — चावी-क्रम किंवा एखादी जागा बदलली तरी सही चुकते.
   */
  verifyWebhook(rawBody: Buffer, headers: Record<string, string | undefined>): VerifiedPayment | null;
}

/**
 * Gateway ची चावी नसताना फेकायची चूक.
 *
 * गप्प बसून `null` परत करण्यापेक्षा स्पष्ट ओरडणं बरं — नाहीतर "Buy दाबलं,
 * काहीच झालं नाही" अशी तक्रार येते आणि कारण शोधावं लागतं.
 */
export class GatewayNotConfiguredError extends Error {
  constructor(gateway: string, missing: string[]) {
    super(
      `${gateway} चालू नाही — ${missing.join(', ')} env मध्ये नाहीत. ` +
        `त्या टाकल्याशिवाय खरेदी करता येणार नाही.`
    );
    this.name = 'GatewayNotConfiguredError';
  }
}
