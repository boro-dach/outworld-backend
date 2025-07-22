import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCardDto, SendToCardDto } from './dto/bank.dto';

@Injectable()
export class BankService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCardDto, userId: string) {
    const card = await this.prisma.card.create({
      data: {
        title: dto.title,
        cardNumber: dto.cardNumber,
        userId,
      },
    });

    return card;
  }

  async send(dto: SendToCardDto, userId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const fromCard = await tx.card.findUnique({
        where: {
          cardNumber: dto.fromCard,
          userId: userId,
        },
      });

      if (!fromCard) {
        throw new NotFoundException(
          'Карта отправителя не найдена или не принадлежит вам.',
        );
      }

      const toCard = await tx.card.findUnique({
        where: {
          cardNumber: dto.toCard,
        },
      });

      if (!toCard) {
        throw new NotFoundException('Карта получателя не найдена.');
      }

      if (fromCard.id === toCard.id) {
        throw new BadRequestException(
          'Нельзя перевести средства на ту же самую карту.',
        );
      }

      if (fromCard.credits < dto.amount) {
        throw new BadRequestException('Недостаточно средств на счету');
      }

      const updatedFromCard = await tx.card.update({
        where: {
          id: fromCard.id,
        },
        data: {
          credits: {
            decrement: dto.amount,
          },
        },
      });

      await tx.card.update({
        where: {
          id: toCard.id,
        },
        data: {
          credits: {
            increment: dto.amount,
          },
        },
      });

      return updatedFromCard;
    });

    return result;
  }

  async getAll(userId: string) {
    const cards = await this.prisma.card.findMany({
      where: {
        userId,
      },
    });

    return cards;
  }
}
