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
        itineraries: true,
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
        select,
        orderBy: {
          createdAt: 'desc',
          ...orderBy,
        },
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
        itineraries: true,
      },
    });
  }

  async createEvent(data: Prisma.EventCreateInput): Promise<Event> {
    return this.prisma.event.create({
      data,
      include: {
        images: true,
        itineraries: true,
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
        itineraries: true,
      },
    });
  }

  async deleteEvent(where: Prisma.EventWhereUniqueInput): Promise<Event> {
    return this.prisma.event.delete({
      where,
      include: {
        images: true,
        itineraries: true,
      },
    });
  }

  async getEventsPaginated({
    page,
    take,
    search,
    costLTE,
    costGTE,
    durationLTE,
    durationGTE,
  }: {
    page?: string;
    take?: string;
    search?: string;
    costLTE?: string;
    costGTE?: string;
    durationLTE?: string;
    durationGTE?: string;
  }) {
    return this.utilsService.getPaginatedResult({
      page: page ? parseInt(page) : undefined,
      take: take ? parseInt(take) : undefined,
      model: 'Event',
      where: {
        name: {
          contains: search,
        },
        cost: {
          lte: costLTE ? parseInt(costLTE) : undefined,
          gte: costGTE ? parseInt(costGTE) : undefined,
        },
        duration: {
          lte: durationLTE ? parseInt(durationLTE) : undefined,
          gte: durationGTE ? parseInt(durationGTE) : undefined,
        },
      } satisfies Prisma.EventWhereInput,
      include: {
        itineraries: true,
        images: true,
      } satisfies Prisma.EventInclude,
      orderBy: {
        createdAt: 'desc',
      } satisfies Prisma.EventOrderByWithRelationInput,
    });
  }
}
