import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { TransactionStatus, TransactionType } from 'generated/prisma';
import {
  MinecraftItem,
  MinecraftService,
} from 'src/minecraft/minecraft.service';
import { PrismaService } from 'src/prisma.service';
import {
  ConfirmDepositDto,
  ConfirmWithdrawDto,
  DepositDto,
  WithdrawDto,
} from './dto/transaction.dto';

interface CommandAction {
  execute: { command: string; expectedAmount: number };
  compensate: { command: string };
}

@Injectable()
export class TransactionService {
  private readonly itemTypeToCommandId: Record<string, string> = {
    DIAMOND_ORE: 'minecraft:diamond_ore',
    DEEPSLATE_DIAMOND_ORE: 'minecraft:deepslate_diamond_ore',
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly minecraft: MinecraftService,
  ) {}

  generateDepositCode(): string {
    const length = 6;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = randomInt(chars.length);
      result += chars[randomIndex];
    }
    return result;
  }

  async get(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        card: {
          select: { id: true, title: true, cardNumber: true },
        },
        user: {
          select: { login: true },
        },
      },
    });

    return transactions;
  }

  async deposit(
    dto: DepositDto,
    userId: string,
  ): Promise<{ depositCode: string }> {
    const card = await this.prisma.card.findUnique({
      where: { cardNumber: dto.cardNumber, userId: userId },
    });
    if (!card)
      throw new NotFoundException('Карта не найдена или не принадлежит вам.');

    const depositCode = this.generateDepositCode();
    await this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
        confirmationCode: depositCode,
        card: { connect: { id: card.id } },
        user: { connect: { id: userId } },
      },
    });
    return { depositCode };
  }

  async confirmDeposit(dto: ConfirmDepositDto, bankerId: string) {
    const targetTransaction = await this.prisma.transaction.findFirst({
      where: {
        confirmationCode: dto.confirmationCode,
        status: TransactionStatus.PENDING,
      },
    });
    if (!targetTransaction)
      throw new NotFoundException(
        'Транзакция с таким кодом не найдена или уже обработана.',
      );

    const banker = await this.prisma.user.findUnique({
      where: { id: bankerId },
    });
    if (!banker) throw new NotFoundException('Банкир не найден.');

    const amountToClear = targetTransaction.amount;
    const inventory = await this.minecraft.getPlayerInventory(banker.login);
    const { totalOres, oreStacks } = this.countOres(inventory);

    if (totalOres < amountToClear) {
      throw new BadRequestException(
        `У банкира недостаточно алмазной руды. Требуется: ${amountToClear}, Найдено: ${totalOres}`,
      );
    }

    const actions = this.planClearActions(
      banker.login,
      amountToClear,
      oreStacks,
    );

    try {
      await this.executeActionsWithCompensation(actions);
    } catch (error) {
      await this.prisma.transaction.update({
        where: { id: targetTransaction.id },
        data: { status: TransactionStatus.FAILED },
      });
      throw new InternalServerErrorException(
        `Операция не удалась и была отменена: ${error.message}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.card.update({
        where: { id: targetTransaction.cardId },
        data: { credits: { increment: amountToClear } },
      });
      return tx.transaction.update({
        where: { id: targetTransaction.id },
        data: {
          status: TransactionStatus.COMPLETED,
          confirmedByBankerId: bankerId,
          confirmationCode: null,
        },
      });
    });
  }

  async withdraw(
    dto: WithdrawDto,
    userId: string,
  ): Promise<{ withdrawCode: string }> {
    const card = await this.prisma.card.findUnique({
      where: { cardNumber: dto.cardNumber, userId },
    });

    if (!card) {
      throw new NotFoundException('Карта не найдена или не принадлежит вам.');
    }

    if (card.credits < dto.amount) {
      throw new BadRequestException(
        'Недостаточно средств на карте для вывода.',
      );
    }

    const existingPendingTransaction = await this.prisma.transaction.findFirst({
      where: { cardId: card.id, status: TransactionStatus.PENDING },
    });

    if (existingPendingTransaction) {
      throw new ConflictException(
        'У вас уже есть активная операция для этой карты. Завершите ее или подождите.',
      );
    }

    const withdrawCode = this.generateDepositCode();

    await this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        type: TransactionType.WITHDRAW,
        status: TransactionStatus.PENDING,
        confirmationCode: withdrawCode,
        card: { connect: { id: card.id } },
        user: { connect: { id: userId } },
      },
    });

    return { withdrawCode };
  }

  async confirmWithdraw(dto: ConfirmWithdrawDto, bankerId: string) {
    const targetTransaction = await this.prisma.transaction.findFirst({
      where: {
        confirmationCode: dto.confirmationCode,
        status: TransactionStatus.PENDING,
        type: TransactionType.WITHDRAW,
      },
    });

    if (!targetTransaction) {
      throw new NotFoundException(
        'Заявка на вывод с таким кодом не найдена или уже обработана.',
      );
    }

    const banker = await this.prisma.user.findUnique({
      where: { id: bankerId },
    });
    if (!banker) throw new NotFoundException('Банкир не найден.');

    const cardToWithdraw = await this.prisma.card.findUnique({
      where: { id: targetTransaction.cardId },
    });
    if (cardToWithdraw.credits < targetTransaction.amount) {
      await this.prisma.transaction.update({
        where: { id: targetTransaction.id },
        data: { status: TransactionStatus.FAILED },
      });
      throw new ConflictException(
        'На карте клиента недостаточно средств для завершения вывода.',
      );
    }

    const amountToGive = targetTransaction.amount;

    const actions = this.planGiveActions(banker.login, amountToGive);

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.card.update({
          where: { id: targetTransaction.cardId },
          data: { credits: { decrement: amountToGive } },
        });
      });
    } catch (dbError) {
      await this.prisma.transaction.update({
        where: { id: targetTransaction.id },
        data: { status: TransactionStatus.FAILED },
      });
      throw new InternalServerErrorException(
        'Ошибка базы данных при списании средств.',
      );
    }

    try {
      await this.executeGiveActionsWithCompensation(
        actions,
        targetTransaction.cardId,
      );
    } catch (minecraftError) {
      await this.prisma.card.update({
        where: { id: targetTransaction.cardId },
        data: { credits: { increment: amountToGive } },
      });
      await this.prisma.transaction.update({
        where: { id: targetTransaction.id },
        data: { status: TransactionStatus.FAILED },
      });
      throw new InternalServerErrorException(
        `Операция не удалась и была отменена: ${minecraftError.message}`,
      );
    }

    return this.prisma.transaction.update({
      where: { id: targetTransaction.id },
      data: {
        status: TransactionStatus.COMPLETED,
        confirmedByBankerId: bankerId,
        confirmationCode: null,
      },
    });
  }

  private planClearActions(
    playerName: string,
    amountToRemove: number,
    oreStacks: MinecraftItem[],
  ): CommandAction[] {
    const actions: CommandAction[] = [];
    let remainingAmount = amountToRemove;
    const oreTypesPriority = Object.keys(this.itemTypeToCommandId);

    for (const oreType of oreTypesPriority) {
      if (remainingAmount <= 0) break;
      const stack = oreStacks.find((item) => item.type === oreType);
      if (stack) {
        const amountFromStack = Math.min(stack.amount, remainingAmount);
        const minecraftItemId = this.itemTypeToCommandId[oreType];
        if (!minecraftItemId) continue;

        actions.push({
          execute: {
            command: `clear ${playerName} ${minecraftItemId} ${amountFromStack}`,
            expectedAmount: amountFromStack,
          },
          compensate: {
            command: `give ${playerName} ${minecraftItemId} ${amountFromStack}`,
          },
        });
        remainingAmount -= amountFromStack;
      }
    }
    return actions;
  }

  private planGiveActions(
    playerName: string,
    amountToGive: number,
  ): CommandAction[] {
    const actions: CommandAction[] = [];
    let remainingAmount = amountToGive;

    const oreTypesPriority = ['DIAMOND_ORE', 'DEEPSLATE_DIAMOND_ORE'];

    const preferredOreType = oreTypesPriority[0];
    const minecraftItemId = this.itemTypeToCommandId[preferredOreType];

    if (!minecraftItemId) {
      console.error(
        'FATAL: Preferred ore type for giving not found in item map!',
      );
      return [];
    }

    while (remainingAmount > 0) {
      const amountFromStack = Math.min(remainingAmount, 64);

      actions.push({
        execute: {
          command: `give ${playerName} ${minecraftItemId} ${amountFromStack}`,
          expectedAmount: amountFromStack,
        },
        compensate: {
          command: `clear ${playerName} ${minecraftItemId} ${amountFromStack}`,
        },
      });
      remainingAmount -= amountFromStack;
    }
    return actions;
  }

  private async executeActionsWithCompensation(actions: CommandAction[]) {
    const successfulCompensations: CommandAction['compensate'][] = [];

    for (const action of actions) {
      try {
        await this.minecraft.executeCommand(action.execute.command);

        successfulCompensations.push(action.compensate);
      } catch (error) {
        console.error(
          `Ошибка при выполнении "${action.execute.command}". Запуск отката...`,
        );
        for (const compensateAction of successfulCompensations.reverse()) {
          try {
            await this.minecraft.executeCommand(compensateAction.command);
          } catch (compError) {
            console.error(
              `FATAL: КОМПЕНСАЦИЯ НЕ УДАЛАСЬ! Команда: "${compensateAction.command}"`,
            );
          }
        }
        throw error;
      }
    }
  }

  private async executeGiveActionsWithCompensation(
    actions: CommandAction[],
    cardIdToRefund: string,
  ) {
    const successfulCompensations: CommandAction['compensate'][] = [];

    for (const action of actions) {
      try {
        await this.minecraft.executeCommand(action.execute.command);

        successfulCompensations.push(action.compensate);
      } catch (error) {
        console.error(
          `Ошибка при выполнении "${action.execute.command}". Запуск отката...`,
        );
        for (const compensateAction of successfulCompensations.reverse()) {
          try {
            await this.minecraft.executeCommand(compensateAction.command);
          } catch (compError) {
            console.error(`FATAL: КОМПЕНСАЦИЯ (clear) НЕ УДАЛАСЬ!`);
          }
        }
        throw error;
      }
    }
  }

  private countOres(inventory: MinecraftItem[]): {
    totalOres: number;
    oreStacks: MinecraftItem[];
  } {
    const allowedOreTypes = Object.keys(this.itemTypeToCommandId);
    const oreStacks = inventory.filter(
      (item) => item && allowedOreTypes.includes(item.type),
    );
    const totalOres = oreStacks.reduce((sum, item) => sum + item.amount, 0);
    return { totalOres, oreStacks };
  }
}
