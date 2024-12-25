import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
    constructor (private readonly prisma: PrismaService) {}

    async getUserById(id: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id
            }
        });

        return user;
    }

    async getUserByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        });

        return user;
    }

    async create(dto: AuthDto){
        return this.prisma.user.create({
            data: {
                username: dto.username,
                email: dto.email,
                password: await hash(dto.password)
            }
        })
    }
}
