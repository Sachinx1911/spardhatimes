import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';

interface AuthedRequest {
  user: { id: string; role: string };
}

class CreateOrderDto {
  /**
   * कोणती series. **रक्कम मुद्दाम इथे नाही** — ती server किंमत database मधून
   * घेतो. Client कडून आलेली रक्कम कधीही वापरायची नाही.
   */
  @IsString()
  @IsNotEmpty()
  seriesId!: string;
}

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('orders')
  @ApiOperation({ summary: 'खरेदी सुरू करणे; मोफत series ला थेट access' })
  create(@Req() req: AuthedRequest, @Body() dto: CreateOrderDto) {
    return this.orders.createOrder(req.user.id, dto.seriesId);
  }

  @Get('orders')
  @ApiOperation({ summary: 'माझ्या खरेदी' })
  mine(@Req() req: AuthedRequest) {
    return this.orders.myOrders(req.user.id);
  }
}
