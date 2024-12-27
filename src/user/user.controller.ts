import { Body, Controller, Param, Post, Put, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from './decorators/user.decorator';
import { Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth()
  @Post('profile')
  async getProfile(@CurrentUser('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Put(':id/user')
  @Auth(Role.ADMIN)
  async updateUserRole(
    @Request() req,
    @Param('id') userId: number,
    @Body('role') UpdateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUserRole(req.user, userId, UpdateUserDto);
  }
}