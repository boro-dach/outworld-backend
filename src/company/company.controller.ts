import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Jobs, UserRole } from 'generated/prisma';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateCompanyDto } from './dto/company.dto';
import { Job } from 'src/job/decorators/job.decorator';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Get('get-my')
  async getMy(@CurrentUser('id') userId: string) {
    const companies = await this.companyService.getMy(userId);

    return companies;
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('create')
  async create(
    @Body() dto: CreateCompanyDto,
    @CurrentUser('id') userId: string,
  ) {
    const company = await this.companyService.create(dto, userId);

    return company;
  }
}
