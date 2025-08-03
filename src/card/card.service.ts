import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCardDto, SendToCardDto } from './dto/card.dto';
import { Prisma, TransactionStatus, TransactionType } from 'generated/prisma';

@Injectable()
export class CardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCardDto, userId: string) {
    const existingCard = await this.prisma.card.findUnique({
      where: { cardNumber: dto.cardNumber, userId: userId },
    });
    if (existingCard) {
      throw new BadRequestException('Карта с таким номером уже существует.');
    }
    const userCardsCount = await this.prisma.card.count({ where: { userId } });
    if (userCardsCount >= 5) {
      throw new BadRequestException('Вы не можете иметь больше 5 карт.');
    }
    return this.prisma.card.create({
      data: { title: dto.title, cardNumber: dto.cardNumber, userId },
    });
  }

  async send(dto: SendToCardDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      return this._performSend(dto, userId, tx);
    });
  }

  async _performSend(
    dto: SendToCardDto,
    userId: string,
    tx: Prisma.TransactionClient,
  ) {
    const fromCard = await tx.card.findUnique({
      where: { cardNumber: dto.fromCard, userId: userId },
    });
    if (!fromCard)
      throw new NotFoundException(
        'Карта отправителя не найдена или не принадлежит вам.',
      );

    const toCard = await tx.card.findUnique({
      where: { cardNumber: dto.toCard },
    });
    if (!toCard) throw new NotFoundException('Карта получателя не найдена.');

    if (fromCard.id === toCard.id)
      throw new BadRequestException(
        'Нельзя перевести средства на ту же самую карту.',
      );
    if (fromCard.credits < dto.amount)
      throw new BadRequestException('Недостаточно средств на счету');

    await tx.card.update({
      where: { id: fromCard.id },
      data: { credits: { decrement: dto.amount } },
    });
    await tx.card.update({
      where: { id: toCard.id },
      data: { credits: { increment: dto.amount } },
    });

    await tx.transaction.create({
      data: {
        amount: dto.amount,
        type: TransactionType.TRANSFER_OUT,
        status: TransactionStatus.COMPLETED,
        card: { connect: { id: fromCard.id } },
        relatedCard: { connect: { id: toCard.id } },
        user: { connect: { id: userId } },
      },
    });
    await tx.transaction.create({
      data: {
        amount: dto.amount,
        type: TransactionType.TRANSFER_IN,
        status: TransactionStatus.COMPLETED,
        card: { connect: { id: toCard.id } },
        relatedCard: { connect: { id: fromCard.id } },
        user: { connect: { id: toCard.userId } },
      },
    });

    return tx.card.findUnique({ where: { id: fromCard.id } });
  }

  async getAll(userId: string) {
    return this.prisma.card.findMany({ where: { userId } });
  }
}
