import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`API चालू आहे: http://localhost:${port}/api  (docs: /api/docs)`);
}

void bootstrap();
