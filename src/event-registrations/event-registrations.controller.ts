import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EventRegistrationsService } from './event-registrations.service';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { Admin } from 'src/auth/admin.decorator';

@Controller('event-registrations')
export class EventRegistrationsController {
  constructor(
    private readonly eventRegistrationsService: EventRegistrationsService,
  ) {}

  @Get()
  async findAll(@Query() { schoolId }: { schoolId?: string }) {
    const eventRegistrations =
      await this.eventRegistrationsService.getEventRegistrations({
        where: { schoolId },
        include: { event: true },
      });

    return eventRegistrations || [];
  }

  @Admin()
  @Post()
  create(@Body() { cost, eventId, schoolId }: CreateEventRegistrationDto) {
    return this.eventRegistrationsService.create({
      cost,
      event: { connect: { id: eventId } },
      school: { connect: { id: schoolId } },
    });
  }
}
