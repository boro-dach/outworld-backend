import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EventService } from './event.service';
import { EventDto } from './dto/event.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

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
