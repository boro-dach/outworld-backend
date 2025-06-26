import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'generated/prisma';
import { UserService } from 'src/user/user.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as argon2 from 'argon2';

export interface TokenPayload {
  role: UserRole;
  login: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly user: UserService,
  ) {}

  issueToken({ role, login }: TokenPayload) {
    const token = this.jwt.sign(
      { role, login },
      {
        expiresIn: '7d',
      },
    );

    return token;
  }

  private async validate(dto: LoginDto) {
    const user = await this.user.getByLogin(dto.login);

    if (!user) throw new NotFoundException('User not found');

    const isValidPassword = await argon2.verify(user.password, dto.password);
    if (!isValidPassword) throw new UnauthorizedException('Wrong password');

    return user;
  }

  async register(dto: RegisterDto) {
    const oldUser = await this.user.getByEmail(dto.email);

    if (oldUser)
      throw new BadRequestException('User with this email already exists');

    const token = this.issueToken({
      role: UserRole.USER,
      login: dto.login,
    });

    const user = await this.user.create(dto, token);

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validate(dto);

    const token = this.issueToken({
      role: user.role,
      login: dto.login,
    });

    await this.user.updateToken(user.id, token);

    return user;
  }
}
