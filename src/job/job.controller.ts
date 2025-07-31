import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserRole } from 'generated/prisma';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { JobService } from './job.service';
import { JobAssignDto } from './dto/job.dto';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('get')
  async getJobs(@CurrentUser('id') userId: string) {
    return await this.jobService.get(userId);
  }

  @Auth(UserRole.ADMIN)
  @HttpCode(200)
  @Post('assign')
  async assignJob(@Body() dto: JobAssignDto) {
    return await this.jobService.assign(dto);
  }
}
