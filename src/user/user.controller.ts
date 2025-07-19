import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserRole } from 'generated/prisma';
import { UpdateIsVerifiedDto } from './dto/user.dto';
import { CurrentUser } from './decorators/user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('get-login')
  async getUserLogin(@CurrentUser('login') login: string) {
    return await this.userService.getLogin(login);
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('is-verified')
  async getIsVerified(@CurrentUser('id') id: string) {
    const isVerified = await this.userService.getIsVerified(id);

    return { isVerified };
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('get-role')
  async getRole(@CurrentUser('role') role: UserRole) {
    return await this.userService.getRole(role);
  }

  @Auth(UserRole.ADMIN)
  @HttpCode(200)
  @Post('update-is-verified')
  async updateIsVerified(@Body() dto: UpdateIsVerifiedDto) {
    return await this.userService.updateIsVerified(dto);
  }
}
