import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NewDto } from './dto/new.dto';

@Injectable()
export class NewService {
    constructor(private prisma: PrismaService) {}
    async createNew(dto: NewDto) {
        return this.prisma.new.create({
            data: {
                title: dto.title,
                content: dto.content,
                date: dto.date
            }
        })
    }

    async getNews() {
        return this.prisma.new.findMany();
    }

    async deleteNew(id: number) {
        return this.prisma.event.delete({
            where: { id }
        })
    }
}
