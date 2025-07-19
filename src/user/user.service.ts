import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { hash } from 'argon2';
import { RegisterDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import { UpdateIsVerifiedDto } from './dto/user.dto';
import { UserRole } from 'generated/prisma';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

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
    try {
      const user = await this.prisma.user.update({
        where: { id: dto.id },
        data: { isVerified: dto.isVerified },
        select: {
          id: true,
          login: true,
          isVerified: true,
        },
      });

      if (dto.isVerified && user.login) {
        await this.addToWhitelist(user.login);
      }

      if (!dto.isVerified && user.login) {
        await this.removeFromWhitelist(user.login);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Failed to update verification status: ${error.message}`,
      );
      throw new BadRequestException('Failed to update verification status');
    }
  }

  private async removeFromWhitelist(username: string): Promise<void> {
    try {
      this.logger.log(`Removing user ${username} from whitelist`);

      const response = await firstValueFrom(
        this.httpService.delete(`${process.env.MINECRAFT_API_URL}/whitelist`, {
          params: { username },
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${process.env.MINECRAFT_API_KEY}`,
          },
        }),
      );

      this.logger.log(`Successfully removed ${username} from whitelist`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to remove ${username} from whitelist: ${error.message}`,
      );
      this.logger.warn(
        `Whitelist API failed for ${username}, but user remains unverified in DB`,
      );
    }
  }

  private async addToWhitelist(username: string): Promise<void> {
    try {
      this.logger.log(`Adding user ${username} to whitelist`);

      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.MINECRAFT_API_URL}/whitelist`,
          {},
          {
            params: { username },
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `${process.env.MINECRAFT_API_KEY}`,
            },
          },
        ),
      );

      this.logger.log(`Successfully added ${username} to whitelist`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to add ${username} to whitelist: ${error.message}`,
      );
      this.logger.warn(
        `Whitelist API failed for ${username}, but user remains verified in DB`,
      );
    }
  }

  async getLogin(login: string) {
    return { login };
  }

  async getIsVerified(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { isVerified: true },
    });
    return Boolean(user?.isVerified);
  }

  async getRole(role: UserRole) {
    return { role };
  }

  async verify(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });
    return user;
  }
}
