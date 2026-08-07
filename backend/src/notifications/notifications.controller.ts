import { Controller, Get, HttpCode, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { AuthedRequest } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'माझ्या सूचना — नवीन आधी' })
  list(@Req() req: AuthedRequest) {
    return this.notifications.list(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'घंटेवरचा आकडा — न वाचलेल्या' })
  unread(@Req() req: AuthedRequest) {
    return this.notifications.unreadCount(req.user.id);
  }

  @Patch('read-all')
  @HttpCode(200)
  @ApiOperation({ summary: 'सगळ्या वाचल्या म्हणून खुणणे' })
  readAll(@Req() req: AuthedRequest) {
    return this.notifications.markAllRead(req.user.id);
  }
}
