import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Admin } from 'src/auth/admin.decorator';
import { Public } from 'src/auth/public.decorator';
import { GetPaginatedDataDto } from 'src/utils/dto/get-paginated-data.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Admin()
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    const { schoolId, ...restEventData } = createEventDto;
    return this.eventsService.createEvent({
      ...restEventData,
      school: { connect: { id: schoolId } },
    });
  }

  @Get()
  getAllEvents(
    @Query()
    { page, take = '10', search = '' }: GetPaginatedDataDto,
  ) {
    if (page) {
      return this.eventsService.getEventsPaginated({
        page: parseInt(page),
        take: parseInt(take),
        search,
      });
    }

    return this.eventsService.getEvents({});
  }

  @Public()
  @Get('/ids')
  getAllEventsId() {
    return this.eventsService.getEvents({
      select: { id: true },
    });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.getEvent({ id });
  }

  @Admin()
  @Put(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.updateEvent({
      data: updateEventDto,
      where: { id },
    });
  }

  @Admin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.deleteEvent({ id });
  }
}
