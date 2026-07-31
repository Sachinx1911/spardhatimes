import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StudyMaterialType } from '@mahatest/db';

import { MaterialsService } from './materials.service';

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
  @ApiOperation({ summary: 'Learn चा पडदा — प्रत्येक प्रकाराची संख्या आणि विषय' })
  overview() {
    return this.materials.overview();
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
}
