import { ForbiddenException, Injectable, Put } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { hash } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

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

    async updateUserRole(
        adminUser: User,
        userId: number,
        dto: UpdateUserDto
    ) {
        if (adminUser.role !== 'ADMIN') {
            throw new ForbiddenException('Только администраторы могут изменять роли пользователей');
        }

        const targetUser = await this.getUserById(userId);
        if (!targetUser) {
            throw new Error('Пользователь не найден');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { role: dto.role },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true
            }
        });

        return updatedUser;
    }
}
