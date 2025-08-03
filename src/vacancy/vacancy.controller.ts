import { Body, Controller, Get, HttpCode, Patch, Post } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { Jobs, UserRole } from 'generated/prisma';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Job } from 'src/job/decorators/job.decorator';
import { CreateVacancyDto } from './dto/vacancy.dto';
import { CurrentUser } from 'src/user/decorators/user.decorator';

@Controller('vacancy')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) {}

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Get('get-all')
  async getAll() {
    const vacancies = await this.vacancyService.getAll();

    return vacancies;
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @Job(Jobs.BUSINESSMAN)
  @HttpCode(200)
  @Post('create')
  async create(@Body() dto: CreateVacancyDto) {
    const vacancy = await this.vacancyService.create(dto);

    return vacancy;
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @Job(Jobs.BUSINESSMAN)
  @HttpCode(200)
  @Patch('update')
  async update(
    @Body() dto: CreateVacancyDto,
    @CurrentUser('id') userId: string,
  ) {
    const vacancy = await this.vacancyService.update(dto, userId);

    return vacancy;
  }
}
