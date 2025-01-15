import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NewService } from './new.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { NewDto } from './dto/new.dto';

@Controller('news')
export class NewController {
  constructor(private readonly newService: NewService) {}

  @Auth(Role.ADMIN)
  @Post('create')
  async createNew(
    @Body() dto: NewDto
  ) {
    return this.newService.createNew(dto)
  }

  @Get('get')
  async getNews() {
    return this.newService.getNews()
  }

    @Post('delete/:id')
    async deleteNew(
      @Param('id') id: number,
    ) {
      return this.newService.deleteNew(id);
    }
}
