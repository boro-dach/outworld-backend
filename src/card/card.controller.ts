import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CardService } from './card.service';
import { UserRole } from 'generated/prisma';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateCardDto, SendToCardDto } from './dto/card.dto';
import { CurrentUser } from 'src/user/decorators/user.decorator';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('create')
  async create(@Body() dto: CreateCardDto, @CurrentUser('id') userId: string) {
    const card = await this.cardService.create(dto, userId);

    return card;
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('send')
  async send(@Body() dto: SendToCardDto, @CurrentUser('id') userId: string) {
    const transaction = await this.cardService.send(dto, userId);

    return transaction;
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('get-all')
  async getAll(@CurrentUser('id') userId: string) {
    const cards = await this.cardService.getAll(userId);

    return cards;
  }
}
