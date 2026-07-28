/**
 * `@mahatest/db` — एकच Prisma schema आणि एकच client, तिन्ही apps साठी.
 *
 * Schema `packages/db/prisma/schema.prisma` मध्ये आहे. Admin (Next.js) आणि API
 * (NestJS) दोघांनी इथूनच client घ्यायचा — प्रत्येकाने स्वतःची प्रत ठेवली तर दोन
 * schema एकमेकांपासून वेगळे होतील.
 */

export { default as db } from './db';
export * from '@prisma/client';
