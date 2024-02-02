import { Injectable } from '@nestjs/common';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { UpdateEventRegistrationDto } from './dto/update-event-registration.dto';
import { EventRegistration, Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class EventRegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getEventRegistration(
    eventRegistrationWhereUniqueInput: Prisma.EventRegistrationWhereUniqueInput,
  ): Promise<EventRegistration | null> {
    return this.prisma.eventRegistration.findUnique({
      where: eventRegistrationWhereUniqueInput,
    });
  }

  async getEventRegistrations(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.EventRegistrationWhereUniqueInput;
    where?: Prisma.EventRegistrationWhereInput;
    orderBy?: Prisma.EventRegistrationOrderByWithRelationInput;
    include?: Prisma.EventRegistrationInclude;
  }): Promise<EventRegistration[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.eventRegistration.findMany({
      skip,
      take,
      cursor,
      where,
      include,
      orderBy: {
        createdAt: 'desc',
        ...orderBy,
      },
    });
  }

  async create(
    data: Prisma.EventRegistrationCreateInput,
  ): Promise<EventRegistration> {
    return this.prisma.eventRegistration.create({
      data,
    });
  }

  async updateEventRegistration(params: {
    where: Prisma.EventRegistrationWhereUniqueInput;
    data: Prisma.EventRegistrationUpdateInput;
  }): Promise<EventRegistration> {
    const { where, data } = params;
    return this.prisma.eventRegistration.update({
      data,
      where,
    });
  }

  async deleteEventRegistration(
    where: Prisma.EventRegistrationWhereUniqueInput,
  ): Promise<EventRegistration> {
    return this.prisma.eventRegistration.delete({
      where,
    });
  }
}
