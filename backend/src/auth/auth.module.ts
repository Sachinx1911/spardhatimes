import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    // `register` (sync) नाही तर `registerAsync` — sync रूप हा object हे module
    // import होताच बनवतं, म्हणजे ConfigModule ने `.env` वाचण्याआधी. तेव्हा
    // process.env रिकामा असतो, secret undefined राहतो, आणि login बरोबर असूनही
    // token बनवताना 500 येतो. Factory ConfigService तयार झाल्यावरच चालते.
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // next-auth v5 हेच नाव वापरतो आणि admin website तेच गुपित वापरते.
        // वेगळं ठेवायचं असेल तर `.env` मध्ये JWT_SECRET टाका — ते आधी बघितलं जातं.
        const secret = config.get<string>('JWT_SECRET') ?? config.get<string>('AUTH_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET किंवा AUTH_SECRET .env मध्ये हवा — त्याशिवाय token बनत नाहीत.');
        }
        return { secret };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // प्रत्येक मार्ग आपोआप बंद; उघडा हवा असेल तर `@Public()`.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
