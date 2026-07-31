import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StudyMaterialType } from '@mahatest/db';
import { IsInt, Max, Min } from 'class-validator';

import type { AuthedRequest } from '../auth/jwt-auth.guard';

import { MaterialsService } from './materials.service';

/**
 * DTO controller च्या **वर** ठेवला आहे, खाली नाही.
 *
 * `@Body() dto: SaveProgressDto` हा decorator class तयार होतानाच त्याचा संदर्भ
 * वाचतो. Classes function सारखे hoist होत नाहीत, म्हणून खाली ठेवला तर
 * "Cannot access before initialization" म्हणून app boot होतच नाही — आणि
 * typecheck ते पकडत नाही.
 */
class SaveProgressDto {
  /** 0-100. 100 म्हणजे पूर्ण झालं. */
  @IsInt()
  @Min(0)
  @Max(100)
  percent!: number;
}

/**
 * सगळे मार्ग login लागणारे — `JwtAuthGuard` हा APP_GUARD आहे आणि इथे कुठेही
 * `@Public()` नाही. साहित्य विकत घ्यावं लागत नाही, पण ते app च्या आतलं आहे.
 */
@ApiTags('learn')
@ApiBearerAuth()
@Controller()
export class MaterialsController {
  constructor(private readonly materials: MaterialsService) {}

  @Get('learn')
  @ApiOperation({ summary: 'Learn चा पडदा — संख्या, विषय, प्रगती, पुढे सुरू ठेवा' })
  overview(@Req() req: AuthedRequest) {
    return this.materials.overview(req.user.id);
  }

  @Get('materials')
  @ApiQuery({ name: 'type', required: false, enum: StudyMaterialType })
  @ApiQuery({ name: 'subject', required: false, description: 'विषयाचा id' })
  @ApiOperation({ summary: 'साहित्याची यादी, प्रकार आणि विषयानुसार गाळता येते' })
  list(@Query('type') type?: string, @Query('subject') subject?: string) {
    // चुकीचा प्रकार आला तर गाळणीच लावत नाही — 500 देण्यापेक्षा सगळं दाखवणं बरं.
    const valid = Object.values(StudyMaterialType) as string[];
    const parsed = type && valid.includes(type) ? (type as StudyMaterialType) : undefined;

    return this.materials.list(parsed, subject && subject !== 'all' ? subject : undefined);
  }

  @Get('materials/:slug')
  @ApiOperation({ summary: 'एका साहित्याचा तपशील' })
  bySlug(@Param('slug') slug: string) {
    return this.materials.bySlug(slug);
  }

  @Post('materials/:id/progress')
  @ApiOperation({ summary: 'किती वाचलं/बघितलं ते नोंदवणे' })
  saveProgress(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: SaveProgressDto
  ) {
    return this.materials.saveProgress(req.user.id, id, dto.percent);
  }
}
