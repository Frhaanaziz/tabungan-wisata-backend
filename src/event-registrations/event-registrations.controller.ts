import { Controller, Get, Post, Body, Query, Put, Param } from '@nestjs/common';
import { EventRegistrationsService } from './event-registrations.service';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { Admin } from 'src/auth/admin.decorator';
import { GetPaginatedDataDto } from 'src/utils/dto/get-paginated-data.dto';
import { UpdateEventRegistrationDto } from './dto/update-event-registration.dto';

@Controller('event-registrations')
export class EventRegistrationsController {
  constructor(
    private readonly eventRegistrationsService: EventRegistrationsService,
  ) {}

  @Get()
  async findAll(
    @Query()
    { page, take = '10', search = '' }: GetPaginatedDataDto,
  ) {
    if (page) {
      return this.eventRegistrationsService.getPaginated({
        page: parseInt(page),
        take: parseInt(take),
        search,
      });
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

  @Admin()
  @Put(":id")
  update(@Param("id") id: string, @Body() data: UpdateEventRegistrationDto) {
    return this.eventRegistrationsService.updateEventRegistration({
      where: { id },
      data,
    });
  }
}
