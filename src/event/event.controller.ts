import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EventService } from './event.service';
import { EventDto } from './dto/event.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Auth(Role.ADMIN)
  @Post('create')
  async createEvent(
    @Body() dto: EventDto,
  ) {
    return this.eventService.createEvent(dto);
  }

  @Get('get')
  async getEvents() {
    return this.eventService.getEvents();
  }

  @Post('delete/:id')
  async deleteEvent(
    @Param('id') id: number,
  ) {
    return this.eventService.deleteEvent(id);
  }
}
