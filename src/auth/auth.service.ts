import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'generated/prisma';
import { UserService } from 'src/user/user.service';
import { LoginDto, RegisterDto, TokenPayload } from './dto/auth.dto';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN = 1;
  REFRESH_TOKEN_NAME = 'refreshToken';

  constructor(
    private readonly jwt: JwtService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.login);
    const tokens = this.issueTokens({
      userId: user.id,
      login: user.login,
      role: user.role,
      email: user.email,
    });

    return { user, ...tokens };
  }

  async register(dto: RegisterDto) {
    const oldUser = await this.userService.getByEmail(dto.email);

    if (oldUser) throw new BadRequestException('Пользователь уже существует');

    const user = await this.userService.create(dto);
    const tokens = this.issueTokens({
      userId: user.id,
      login: user.login,
      role: user.role,
      email: user.email,
    });

    return { user, ...tokens };
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);
    if (!result) throw new UnauthorizedException('Невалидный refresh токен');

    const user = await this.userService.getByLogin(result.login);
    const tokens = this.issueTokens({
      userId: user.id,
      login: user.login,
      role: user.role,
      email: user.email,
    });

    return { user, ...tokens };
  }

  issueTokens(payload: TokenPayload) {
    const data = { payload };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async validateUser(login: string) {
    const user = await this.userService.getByLogin(login);

    if (!user) throw new NotFoundException('Пользователь не найден');

    return user;
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      expires: expiresIn,
      secure: true,
      sameSite: 'none',
    });
  }

  removeRefreshTokenFromResponse(res: Response) {
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: 'none',
    });
  }

  async verifyUser(accessToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(accessToken);
      const user = await this.userService.getByLogin(payload.login);

      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Невалидный access токен');
    }
  }
}
