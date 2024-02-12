import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { EventRegistrationsService } from './event-registrations.service';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { Admin } from 'src/auth/admin.decorator';
import { GetPaginatedDataDto } from 'src/utils/dto/get-paginated-data.dto';

@Controller('event-registrations')
export class EventRegistrationsController {
  constructor(
    private readonly eventRegistrationsService: EventRegistrationsService,
  ) {}

  @Get()
  async findAll(
    @Query()
    {
      page,
      take = '10',
      search = '',
      schoolId,
    }: GetPaginatedDataDto & { schoolId?: string },
  ) {
    if (page) {
      return this.eventRegistrationsService.getPaginated({
        page: parseInt(page),
        take: parseInt(take),
        search,
      });
    }

    if (schoolId) {
      const eventRegistrations =
        await this.eventRegistrationsService.getEventRegistrations({
          where: { schoolId },
          include: { event: true },
        });
      return eventRegistrations || [];
    }

    return this.eventRegistrationsService.getEventRegistrations({});
  }

  @Admin()
  @Post()
  create(@Body() { eventId, schoolId, ...rest }: CreateEventRegistrationDto) {
    return this.eventRegistrationsService.create({
      ...rest,
      event: { connect: { id: eventId } },
      school: { connect: { id: schoolId } },
    });
  }
}
