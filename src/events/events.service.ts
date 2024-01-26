import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Event, Prisma } from '@prisma/client';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private utilsService: UtilsService,
  ) {}

  async getEvent(
    eventWhereUniqueInput: Prisma.EventWhereUniqueInput,
  ): Promise<Event | null> {
    const event = await this.prisma.event.findUnique({
      where: eventWhereUniqueInput,
      include: {
        images: true,
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async getEvents(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.EventWhereUniqueInput;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
    select?: Prisma.EventSelect;
  }): Promise<Event[]> {
    const { skip, take, cursor, where, orderBy, select } = params;
    if (select) {
      return this.prisma.event.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy: {
          startDate: 'desc',
          ...orderBy,
        },
        select,
      });
    }

    return this.prisma.event.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        images: true,
      },
    });
  }

  async createEvent(data: Prisma.EventCreateInput): Promise<Event> {
    return this.prisma.event.create({
      data,
      include: {
        images: true,
      },
    });
  }

  async updateEvent(params: {
    where: Prisma.EventWhereUniqueInput;
    data: Prisma.EventUpdateInput;
  }): Promise<Event> {
    const { where, data } = params;
    return this.prisma.event.update({
      data,
      where,
      include: {
        images: true,
      },
    });
  }

  async deleteEvent(where: Prisma.EventWhereUniqueInput): Promise<Event> {
    return this.prisma.event.delete({
      where,
      include: {
        images: true,
      },
    });
  }

  async getEventsPaginated({
    page,
    take,
    search,
  }: {
    page: number;
    take: number;
    search: string;
  }) {
    return this.utilsService.getPaginatedResult({
      page,
      take,
      model: 'Event',
      where: {
        name: {
          contains: search,
        },
      } satisfies Prisma.EventWhereInput,
      include: {
        school: true,
      } satisfies Prisma.EventInclude,
      orderBy: {
        startDate: 'desc',
      } satisfies Prisma.EventOrderByWithRelationInput,
    });
  }
}
