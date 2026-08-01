import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

/**
 * App ची सगळी मांडणी — **एकाच ठिकाणी**.
 *
 * दोन ठिकाणांहून app सुरू होतो: `main.ts` (लॅपटॉपवर, स्वतःचा server) आणि
 * `api/index.ts` (Vercel वर, serverless). दोन्हीकडे ही मांडणी हाताने लिहिली
 * असती तर ती हळूहळू वेगळी झाली असती — आणि इथे तो फरक **सुरक्षेचा** ठरतो:
 * खालचा `whitelist` + `forbidNonWhitelisted` हाच client ला `role: "ADMIN"`
 * सारखी नसलेली fields पाठवण्यापासून अडवतो. तो एका बाजूला राहिला असता तर
 * लॅपटॉपवर सगळं ठीक दिसलं असतं आणि production उघडं पडलं असतं.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.use(helmet());

  // App वेगळ्या origin वरून येतं (Expo dev server, नंतर native — तिथे origin
  // नसतोच). Cookies वापरत नाही, JWT header ने येतो, म्हणून credentials नकोत.
  app.enableCors({ origin: true, credentials: false });

  app.useGlobalPipes(
    new ValidationPipe({
      // DTO मध्ये नसलेली fields गाळून टाकायच्या — client ने `role: "ADMIN"` सारखं
      // काहीही पाठवलं तरी ते आत पोहोचू नये.
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle('MahaTest API')
    .setDescription('विद्यार्थी app साठी. Admin website यावर अवलंबून नाही.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
}
