import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { RegisterDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import { UpdateIsVerifiedDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getByLogin(login: string) {
    const user = await this.prisma.user.findFirst({
      where: { login },
    });

    return user;
  }

  async getByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    return user;
  }

  async create(dto: RegisterDto) {
    return this.prisma.user.create({
      data: {
        login: dto.login,
        email: dto.email,
        password: await hash(dto.password),
      },
    });
  }

  async updateIsVerified(dto: UpdateIsVerifiedDto) {
    const user = await this.prisma.user.update({
      where: { id: dto.id },
      data: { isVerified: dto.isVerified },
    });

    return user;
  }
}
