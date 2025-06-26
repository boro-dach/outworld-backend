import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserRole } from 'generated/prisma';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import {
  CreateApplicationDto,
  DeleteApplicationDto,
  UpdateApplicationStatusDto,
} from './dto/application.dto';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('create')
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    const application = await this.applicationService.create(dto, userId);

    return application;
  }

  @Auth(UserRole.ADMIN)
  @HttpCode(200)
  @Post('update-status')
  async updateStatus(@Body() dto: UpdateApplicationStatusDto) {
    const application = await this.applicationService.updateStatus(dto);

    return application;
  }

  @Auth(UserRole.ADMIN)
  @HttpCode(200)
  @Post('delete')
  async delete(@Body() dto: DeleteApplicationDto) {
    const application = await this.applicationService.delete(dto);

    return application;
  }
}
