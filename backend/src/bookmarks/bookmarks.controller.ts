import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { AuthedRequest } from '../auth/jwt-auth.guard';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

/**
 * सगळे मार्ग login लागणारे — `JwtAuthGuard` हा APP_GUARD आहे आणि इथे कुठेही
 * `@Public()` नाही.
 */
@ApiTags('bookmarks')
@ApiBearerAuth()
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarks: BookmarksService) {}

  @Get()
  @ApiOperation({ summary: 'माझे बुकमार्क — उत्तर आणि खुलाशासह' })
  list(@Req() req: AuthedRequest) {
    return this.bookmarks.list(req.user.id);
  }

  @Get('quiz/:quizId')
  @ApiOperation({ summary: 'या test मधले खुणलेले प्रश्न — निकालाच्या पडद्यासाठी' })
  forQuiz(@Req() req: AuthedRequest, @Param('quizId') quizId: string) {
    return this.bookmarks.questionIdsForQuiz(req.user.id, quizId);
  }

  @Post()
  @ApiOperation({ summary: 'प्रश्नाला खूण करणे — सोडवलेला असेल तरच' })
  add(@Req() req: AuthedRequest, @Body() dto: CreateBookmarkDto) {
    return this.bookmarks.add(req.user.id, dto.questionId);
  }

  @Delete(':questionId')
  // 204 — काढल्यावर परत पाठवण्यासारखं काही नाही, आणि नोंद नसेल तरी हेच येतं.
  @HttpCode(204)
  @ApiOperation({ summary: 'खूण काढणे' })
  async remove(@Req() req: AuthedRequest, @Param('questionId') questionId: string) {
    await this.bookmarks.remove(req.user.id, questionId);
  }
}
