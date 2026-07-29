import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { db } from '@mahatest/db';

/**
 * Prisma client चं NestJS वेष्टन.
 *
 * स्वतःचा `new PrismaClient()` बनवत नाही — `@mahatest/db` मधलाच singleton
 * वापरतो, म्हणजे admin (Next.js) आणि हा API एकाच schema वर आणि एकाच connection
 * pool धोरणावर राहतात. Supabase ~170ms दूर आहे; प्रत्येक ठिकाणी वेगळा client
 * काढला तर connections लवकर संपतात.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client = db;

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
