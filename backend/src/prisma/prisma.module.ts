import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

/**
 * Global — प्रत्येक module मध्ये पुन्हा import करावा लागू नये म्हणून. Database
 * connection एकच असते, ती सगळीकडे तीच वापरायची.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
