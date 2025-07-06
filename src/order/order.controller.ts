import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { OrderStatus, UserRole } from 'generated/prisma';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { CurrentUser } from 'src/user/decorators/user.decorator';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('create')
  async create(@Body() dto: CreateOrderDto, @CurrentUser('id') userId: string) {
    const order = await this.orderService.create(dto, userId);

    return order;
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @Patch('status')
  @HttpCode(200)
  updateStatus(@Body() dto: UpdateOrderStatusDto) {
    const order = this.orderService.updateStatus(dto);

    return order;
  }
}
