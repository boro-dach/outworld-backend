import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { AuthDto } from "./dto/auth.dto";
import { Response } from 'express';

@Injectable()
export class AuthService {
    EXPIRE_DAY_TOKEN = 1;
    REFRESH_TOKEN_NAME = 'refreshToken';

    constructor (
        private jwt: JwtService,
        private userService: UserService,
        private configService: ConfigService,
    ) {}

    async login(dto: AuthDto) {
        const user = await this.validateUser(dto)

        const tokens = this.issueTokens(user.id)

        return {user, ...tokens}
    }

    async register(dto: AuthDto) {
        const oldUser = await this.userService.getUserByEmail(dto.email)

        if (oldUser) {
            throw new BadRequestException('Пользователь с такой почтой уже существует')
        }

        const user = await this.userService.create(dto)

        const tokens = this.issueTokens(user.id)

        return {user, ...tokens}
    }

    async getNewTokens(refreshToken: string) {
        const result = await this.jwt.verifyAsync(refreshToken)
        if (!result) throw new UnauthorizedException('токен обновления не валиден')

        const user = await this.userService.getUserById(result.id)

        const tokens = this.issueTokens(user.id)

        return {user, ...tokens}
    }

    issueTokens(id: number) {
        const data = {id: id}

        const accessToken = this.jwt.sign(data, {
            expiresIn: '1h'
        });

        const refreshToken = this.jwt.sign(data, {
            expiresIn: '7d'
        });

        return { accessToken, refreshToken }
    }

    private async validateUser(dto: AuthDto) {
        const user = await this.userService.getUserByEmail(dto.email)

        if (!user) {
            throw new UnauthorizedException('Пользователь не найден')
        }

        return user
    }

    async validateToken(token: string) {
        try {
            const decoded = this.jwt.verify(token)

            const user = await this.userService.getUserById(decoded.sub)

            if (!user) {
                throw new UnauthorizedException('Пользователь не найден')
            }
            return user

        } catch (error) {
            throw new UnauthorizedException('Токен не валидный или истёк его срок')
        }
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