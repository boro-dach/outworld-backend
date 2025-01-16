import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { AuthDto } from "./dto/auth.dto";
import { Response } from 'express';
import { PrismaService } from "src/prisma.service";
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
    EXPIRE_DAY_TOKEN = 7;
    REFRESH_TOKEN_NAME = 'refreshToken';
    
    constructor(
        private jwt: JwtService,
        private userService: UserService,
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {}

    async login(dto: AuthDto) {
        const user = await this.validateUser(dto)
        const tokens = await this.issueTokens(user.id)
        return { user, ...tokens }
    }

    async register(dto: AuthDto) {
        const oldUser = await this.userService.getUserByEmail(dto.email)
        if (oldUser) {
            throw new BadRequestException('Пользователь с такой почтой уже существует')
        }
        const user = await this.userService.create(dto)
        const tokens = await this.issueTokens(user.id)
        return { user, ...tokens }
    }

    async getNewTokens(refreshToken: string) {
        const result = await this.jwt.verifyAsync(refreshToken)
        if (!result) throw new UnauthorizedException('токен обновления не валиден')
        
        const user = await this.userService.getUserById(result.id)
        const tokens = await this.issueTokens(user.id)
        return { user, ...tokens }
    }

    async issueTokens(userId: number) {
        const data = { id: userId }
        
        const accessToken = this.jwt.sign(data, {
            expiresIn: '7d'
        });
        
        const refreshToken = this.jwt.sign(data, {
            expiresIn: '7d'
        });

        // Устанавливаем дату истечения через 7 дней
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.EXPIRE_DAY_TOKEN);

        // Обновляем пользователя с новым токеном
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                accessToken: accessToken,
                tokenExpires: expiresAt
            }
        });

        return { accessToken, refreshToken }
    }

    async validateUser(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email }
        });

        if (!user) throw new UnauthorizedException('Пользователь не найден');

        const isValidPassword = await argon2.verify(user.password, dto.password);
        if (!isValidPassword) throw new UnauthorizedException('Неверный пароль');

        return user;
    }

    async validateToken(token: string) {
        try {
            // Проверяем токен в базе данных
            const user = await this.prisma.user.findFirst({
                where: {
                    accessToken: token,
                    tokenExpires: {
                        gt: new Date()
                    }
                }
            });

            if (!user) {
                throw new UnauthorizedException('Токен не валиден или истёк его срок')
            }

            return user;
        } catch (error) {
            throw new UnauthorizedException('Токен не валидный или истёк его срок')
        }
    }

    async findUserByAccessToken(token: string) {
        return await this.prisma.user.findFirst({
            where: {
                accessToken: token,
                tokenExpires: {
                    gt: new Date()
                }
            }
        });
    }

    async removeExpiredTokens() {
        await this.prisma.user.updateMany({
            where: {
                tokenExpires: {
                    lt: new Date()
                }
            },
            data: {
                accessToken: null,
                tokenExpires: null
            }
        });
    }

    addRefreshTokenToResponse(res: Response, refreshToken: string) {
        const expiresIn = new Date()
        expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_TOKEN)
        res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
            httpOnly: true,
            domain: this.configService.get('SERVER_DOMAIN'),
            expires: expiresIn,
            secure: true,
            sameSite: 'none'
        })
    }

    removeRefreshTokenFromResponse(res: Response) {
        res.cookie(this.REFRESH_TOKEN_NAME, '', {
            httpOnly: true,
            domain: this.configService.get('SERVER_DOMAIN'),
            expires: new Date(0),
            secure: true,
            sameSite: 'none'
        })
    }
}