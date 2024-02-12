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
import { UtilsService } from 'src/utils/utils.service';
import { GetEventsDto } from './dto/get-events.dto';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly utilsService: UtilsService,
  ) {}

  @Admin()
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.createEvent(createEventDto);
  }

  @Public()
  @Get()
  getAllEvents(
    @Query()
    getPaginatedFilterDataDto: GetEventsDto,
  ) {
    const { page, highlighted } = getPaginatedFilterDataDto;

    if (page)
      return this.eventsService.getEventsPaginated(getPaginatedFilterDataDto);

    if (Boolean(highlighted))
      return this.eventsService.getEventsJoin({ where: { highlighted: true } });

    return this.eventsService.getEvents({});
  }
  @Admin()
  @Get('count-new-events')
  async getNewEvents(@Query() { days = '30' }: { days?: string }) {
    return this.utilsService.getNewItemsLastDays({
      days: parseInt(days),
      model: 'Event',
    });
  }

  @Admin()
  @Get('/growth-percentage')
  getPercentageFromLastMonth() {
    return this.utilsService.getGrowthPercentageFromLastMonth({
      model: 'Event',
    });
  }

  @Public()
  @Get('/ids')
  getAllEventsId() {
    return this.eventsService.getEventsJoin({
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
