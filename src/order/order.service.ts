import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrderGateway } from './order.gateway';
import { OrderStatus } from 'generated/prisma';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private orderGateway: OrderGateway,
  ) {}

  async create(data: CreateOrderDto, userId: string) {
    const order = await this.prisma.order.create({
      data: {
        playerUuid: data.playerUuid,
        userId,
        items: {
          create: data.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    this.orderGateway.sendOrderUpdate(order.id, order.status);
    return order;
  }

  async updateStatus(dto: UpdateOrderStatusDto) {
    const updatedOrder = await this.prisma.order.update({
      data: { status: dto.status },
      where: { id: dto.orderId },
    });

    this.orderGateway.sendOrderUpdate(dto.orderId, dto.status);

    return updatedOrder;
  }

  async getAll(userId: string) {
    return this.prisma.order.findMany({
      include: { items: true },
    });
  }
}
