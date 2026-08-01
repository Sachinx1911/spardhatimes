import {  Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import { IsIn } from 'class-validator';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import type { AuthedRequest } from '../auth/jwt-auth.guard';
import { ArticlesService } from './articles.service';

/** आवडलं / आवडलं नाही — यापैकी एकच चालतं. */
class ReactDto {
  @IsIn(['LIKE', 'DISLIKE'])
  type!: 'LIKE' | 'DISLIKE';
}

/**
 * सगळे मार्ग login लागणारे — `JwtAuthGuard` हा APP_GUARD आहे आणि इथे कुठेही
 * `@Public()` नाही. लेख विकत घ्यावे लागत नाहीत, पण ते app च्या आतले आहेत.
 */
@ApiTags('current-affairs')
@ApiBearerAuth()
@Controller()
export class ArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get('current-affairs')
  @ApiOperation({ summary: 'चालू घडामोडींचा पडदा — Top News, यादी आणि गट एकत्र' })
  screen(@Req() req: AuthedRequest) {
    return this.articles.screen(req.user.id);
  }

  @Get('articles')
  @ApiQuery({ name: 'category', required: false, description: 'गटाचा slug' })
  @ApiOperation({ summary: 'लेखांची यादी, गटानुसार गाळता येते' })
  list(@Req() req: AuthedRequest, @Query('category') category?: string) {
    // रिकामा किंवा "all" म्हणजे गाळणी नाही — app ला वेगळा मार्ग लागत नाही.
    const slug = category && category !== 'all' ? category : undefined;
    return this.articles.list(req.user.id, slug);
  }

  /**
   * ⚠️ हा `articles/:slug` च्या **वर** ठेवला आहे. खाली ठेवला असता तर
   * "bookmarks" हाच slug समजला गेला असता आणि हा मार्ग कधीच लागला नसता.
   */
  @Get('articles/bookmarked')
  @ApiOperation({ summary: 'खुणलेले लेख' })
  bookmarked(@Req() req: AuthedRequest) {
    return this.articles.bookmarked(req.user.id);
  }

  @Get('articles/:slug')
  @ApiOperation({ summary: 'एक पूर्ण लेख' })
  one(@Req() req: AuthedRequest, @Param('slug') slug: string) {
    return this.articles.one(req.user.id, slug);
  }

  @Post('articles/:id/react')
  @ApiOperation({ summary: 'आवडलं / आवडलं नाही (पुन्हा दाबल्यास मागे घेतं)' })
  react(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: ReactDto
  ) {
    return this.articles.react(req.user.id, id, dto.type);
  }

  @Post('articles/:id/bookmark')
  @HttpCode(204)
  @ApiOperation({ summary: 'लेखाला खूण करणे' })
  async bookmark(@Req() req: AuthedRequest, @Param('id') id: string) {
    await this.articles.bookmark(req.user.id, id);
  }

  @Delete('articles/:id/bookmark')
  @HttpCode(204)
  @ApiOperation({ summary: 'लेखाची खूण काढणे' })
  async unbookmark(@Req() req: AuthedRequest, @Param('id') id: string) {
    await this.articles.unbookmark(req.user.id, id);
  }
}
