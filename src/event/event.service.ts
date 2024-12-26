import { Injectable } from '@nestjs/common';
import { EventDto } from './dto/event.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EventService {
    constructor(private prisma: PrismaService) {}
    async createEvent(dto: EventDto) {
        return this.prisma.event.create({
            data: {
                title: dto.title,
                description: dto.description,
                date: dto.date
            }
        })
    }

    async getEvents() {
        return this.prisma.event.findMany();
    }

    async deleteEvent(id: number) {
        return this.prisma.event.delete({
            where: { id }
        })
    }
}
