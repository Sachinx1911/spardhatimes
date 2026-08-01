import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configureApp } from './configure-app';

/**
 * लॅपटॉपवर चालवण्याचा मार्ग — स्वतःचा server, स्वतःचा port.
 *
 * Vercel वर हा वापरला जात नाही; तिथे `api/index.ts` आहे. दोन्हीकडची मांडणी
 * `configureApp` मधून येते, म्हणून ती एकाच ठिकाणी बदलते.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const port = Number(process.env.PORT ?? 4000);
  // पत्ता स्पष्ट लिहिला आहे. Nest ची चूक टाळण्यासाठी नाही — तो आधीच सगळ्या
  // जाळ्यांवर ऐकतो — तर हे **मुद्दाम** आहे हे दिसावं म्हणून: APK चाचणीच्या
  // वेळी त्याच wifi वरचा फोन इथे येतो, आणि कोणीतरी हे localhost पुरतं
  // बांधून टाकलं तर ती चाचणी गपचूप तुटेल.
  await app.listen(port, '0.0.0.0');
  console.log(`API चालू आहे: http://localhost:${port}/api  (docs: /api/docs)`);
}

void bootstrap();
