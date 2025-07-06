import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { OrderStatus } from 'generated/prisma';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrderGateway {
  @WebSocketServer()
  server: Server;
  orderService: any;

  @SubscribeMessage('createOrder')
  handleCreateOrder(@MessageBody() data: any) {
    console.log('Received order:', data);
    this.server.emit('orderCreated', {
      status: 'PENDING',
      ...data,
    });
  }

  sendOrderUpdate(orderId: string, status: string) {
    this.server.emit('orderUpdate', { orderId, status });
  }

  @SubscribeMessage('updateOrderStatus')
  async handleUpdateOrderStatus(
    @MessageBody() data: { orderId: string; status: OrderStatus },
  ) {
    const updated = await this.orderService.updateStatus(
      data.orderId,
      data.status,
    );
    this.server.emit('orderStatusUpdated', updated);
  }
}
