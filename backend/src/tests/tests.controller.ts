import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { AuthedRequest } from '../auth/jwt-auth.guard';
import { SubmitAttemptDto } from './dto/submit.dto';
import { TestsService } from './tests.service';

/**
 * सगळे मार्ग login लागणारे — `JwtAuthGuard` हा APP_GUARD आहे आणि इथे कुठेही
 * `@Public()` नाही.
 */
@ApiTags('tests')
@ApiBearerAuth()
@Controller()
export class TestsController {
  constructor(private readonly tests: TestsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Home dashboard — नाव, चालू series, आकडे' })
  dashboard(@Req() req: AuthedRequest) {
    return this.tests.dashboard(req.user.id);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'कामगिरीचं विश्लेषण — सगळं एका फेरीत' })
  analytics(@Req() req: AuthedRequest) {
    return this.tests.analytics(req.user.id);
  }

  @Get('catalog')
  @ApiOperation({ summary: 'दुकान — विकत घेता येणाऱ्या सगळ्या series' })
  catalog(@Req() req: AuthedRequest) {
    return this.tests.catalog(req.user.id);
  }

  @Get('exams')
  @ApiOperation({ summary: 'परीक्षांची यादी, प्रत्येकीचा series आकडा' })
  exams() {
    return this.tests.exams();
  }

  @Get('exams/:id')
  @ApiOperation({ summary: 'एका परीक्षेखालच्या test series' })
  examDetail(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.tests.examDetail(req.user.id, id);
  }

  @Get('syllabus/:id')
  @ApiOperation({ summary: 'एका अभ्यासक्रमाचे विषय' })
  syllabus(@Param('id') id: string) {
    return this.tests.syllabusDetail(id);
  }

  @Get('syllabus-section/:id')
  @ApiOperation({ summary: 'एका विषयाचे मुद्दे' })
  syllabusSection(@Param('id') id: string) {
    return this.tests.syllabusSection(id);
  }

  @Get('online-tests')
  @ApiOperation({ summary: 'ONLINE TEST — मोफत आणि पैसे घेणारे tests, आकडेवारीसह' })
  onlineTests(@Req() req: AuthedRequest) {
    return this.tests.onlineTests(req.user.id);
  }

  @Get('series')
  @ApiOperation({ summary: 'माझ्या test series, प्रगती सह' })
  mySeries(@Req() req: AuthedRequest) {
    return this.tests.mySeries(req.user.id);
  }

  @Get('series/:id')
  @ApiOperation({ summary: 'एका series मधले tests' })
  seriesTests(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.tests.seriesTests(req.user.id, id);
  }

  @Get('tests/:id')
  @ApiOperation({ summary: 'Test सोडवायला उघडणे — बरोबर उत्तरं यात नसतात' })
  startTest(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.tests.startTest(req.user.id, req.user.role, id);
  }

  @Post('tests/:id/submit')
  @ApiOperation({ summary: 'उत्तरं पाठवून निकाल तयार करणे' })
  submit(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: SubmitAttemptDto
  ) {
    return this.tests.submit(
      req.user.id,
      req.user.role,
      id,
      dto.answers,
      dto.timeTakenSeconds
    );
  }

  @Get('attempts/:id')
  @ApiOperation({ summary: 'निकाल — विषयवार कामगिरी आणि खुलाशांसह' })
  result(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.tests.attemptResult(req.user.id, id);
  }
}
