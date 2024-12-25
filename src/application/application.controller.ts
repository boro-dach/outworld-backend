import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { CreateApplicationDto } from './dto/create-application.dto';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Auth()
  @HttpCode(200)
  @Post('create')
  async createApplication(
    @Body() dto: CreateApplicationDto,
    @CurrentUser() user: {id: number}
  ) {
    return this.applicationService.createApplication(dto, user.id);
  }

  @Auth()
  @HttpCode(200)
  @Post('update/:id')
  async updateApplication(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationDto
  ) {
    return this.applicationService.updateApplication(id, dto);
  }

  @Auth()
  @Get('get')
  async getApplications() {
    return this.applicationService.getApplications();
  }
}
