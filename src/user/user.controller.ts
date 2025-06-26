import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserRole } from 'generated/prisma';
import { UpdateIsVerifiedDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth(UserRole.ADMIN)
  @HttpCode(200)
  @Post('verify')
  async updateIsVerified(@Body() dto: UpdateIsVerifiedDto) {
    const user = await this.userService.updateIsVerified(dto);
  }
}
