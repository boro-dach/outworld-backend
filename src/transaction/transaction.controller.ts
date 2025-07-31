import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Jobs, UserRole } from 'generated/prisma';
import {
  ConfirmDepositDto,
  DepositDto,
  WithdrawDto,
} from './dto/transaction.dto';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { Job } from 'src/job/decorators/job.decorator';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('get')
  async get(@CurrentUser('id') userId: string) {
    const transactions = await this.transactionService.get(userId);

    return transactions;
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('deposit')
  async deposit(@Body() dto: DepositDto, @CurrentUser('id') userId: string) {
    return await this.transactionService.deposit(dto, userId);
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @Job(Jobs.BANKER)
  @HttpCode(200)
  @Post('confirm-deposit')
  async confirmDeposit(
    @Body() dto: ConfirmDepositDto,
    @CurrentUser('id') userId: string,
  ) {
    return await this.transactionService.confirmDeposit(dto, userId);
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('withdraw')
  async withdraw(@Body() dto: WithdrawDto, @CurrentUser('id') userId: string) {
    return await this.transactionService.withdraw(dto, userId);
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @Job(Jobs.BANKER)
  @HttpCode(200)
  @Post('confirm-withdraw')
  async confirmWithdraw(
    @Body() dto: ConfirmDepositDto,
    @CurrentUser('id') userId: string,
  ) {
    return await this.transactionService.confirmWithdraw(dto, userId);
  }
}
