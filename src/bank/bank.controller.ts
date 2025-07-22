import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { BankService } from './bank.service';
import { UserRole } from 'generated/prisma';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { CreateCardDto, SendToCardDto } from './dto/bank.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('create-card')
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateCardDto) {
    const card = await this.bankService.create(dto, userId);

    return card;
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('send-to-card')
  async sendToCard(
    @CurrentUser('id') userId: string,
    @Body() dto: SendToCardDto,
  ) {
    const fromCard = await this.bankService.send(dto, userId);

    return fromCard;
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('get-all')
  async getAll(@CurrentUser('id') userId: string) {
    const cards = await this.bankService.getAll(userId);

    return cards;
  }
}
