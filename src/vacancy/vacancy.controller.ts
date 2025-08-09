import { Body, Controller, Get, HttpCode, Patch, Post } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { Jobs, UserRole } from 'generated/prisma';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Job } from 'src/job/decorators/job.decorator';
import {
  AcceptApplyDto,
  ApplyToVacancyDto,
  CreateVacancyDto,
  GetAppliesByVacancyDto,
  getByCompanyDto,
  RejectApplyDto,
} from './dto/vacancy.dto';
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
  @HttpCode(200)
  @Post('get-by-company')
  async getByCompany(@Body() dto: getByCompanyDto) {
    const vacancies = await this.vacancyService.getByCompany(dto);

    return vacancies;
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @HttpCode(200)
  @Post('get-applies-by-vacancy')
  async getAppliesByVacancy(@Body() dto: GetAppliesByVacancyDto) {
    const vacancies = await this.vacancyService.getAppliesByVacancy(dto);

    return vacancies;
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @HttpCode(200)
  @Get('get-applies-by-user')
  async getAppliesByUser(@CurrentUser('id') userId: string) {
    const vacancies = await this.vacancyService.getAppliesByUser(userId);

    return vacancies;
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @HttpCode(200)
  @Post('apply')
  async apply(
    @Body() dto: ApplyToVacancyDto,
    @CurrentUser('id') userId: string,
  ) {
    const apply = await this.vacancyService.apply(dto, userId);

    return apply;
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @HttpCode(200)
  @Post('accept-apply')
  async acceptApply(
    @Body() dto: AcceptApplyDto,
    @CurrentUser('id') userId: string,
  ) {
    const apply = await this.vacancyService.acceptApply(dto, userId);

    return apply;
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @HttpCode(200)
  @Post('reject-apply')
  async rejectApply(@Body() dto: RejectApplyDto) {
    const apply = await this.vacancyService.rejectApply(dto);

    return apply;
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
