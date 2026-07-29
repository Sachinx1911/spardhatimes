import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TestsModule } from './tests/tests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // `.env` repo च्या मुळाशी एकच आहे; `backend/.env` हा त्याचा symlink आहे.
      // Prisma Client स्वतः .env वाचत नाही, म्हणून हे इथे लागतंच.
      envFilePath: ['.env'],
    }),

    // Login वर brute force टाळण्यासाठी. AuthController वर याहून कडक मर्यादा आहे.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    PrismaModule,
    AuthModule,
    TestsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
