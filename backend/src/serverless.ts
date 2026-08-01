import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Express } from 'express';

import { AppModule } from './app.module';
import { configureApp } from './configure-app';

/**
 * Serverless वर चालणारा app.
 *
 * इथे `app.listen()` नाही — Vercel स्वतः विनंत्या आणून देतो, म्हणून Nest ला
 * express वर उभा करून तोच handler परत करतो.
 *
 * **सर्वात महत्त्वाचा भाग खालचं `cached` आहे.** Nest उभा करणं म्हणजे सगळे
 * modules, Prisma client आणि database ची जोडणी. ते प्रत्येक विनंतीला केलं
 * असतं तर प्रत्येक उत्तर एक-दोन सेकंदांनी उशिरा आलं असतं, आणि त्याहून वाईट
 * म्हणजे प्रत्येक विनंती नवी database जोडणी उघडून Postgres च्या मर्यादेला
 * भिडली असती. Fluid Compute एकच instance अनेक विनंत्यांना वापरतो, म्हणून
 * एकदा उभा केलेला app पुढच्यांना तसाच मिळतो.
 */
let cached: Express | null = null;

export async function getServer(): Promise<Express> {
  if (cached) return cached;

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // लॅपटॉपवर आणि इथे — मांडणी एकच. (`configure-app.ts` बघा.)
  configureApp(app);

  // `listen` नाही, `init` — Nest ला तयार करायचं आहे, port धरायचा नाही.
  await app.init();

  cached = server;
  return server;
}
