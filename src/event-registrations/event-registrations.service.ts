import { Injectable } from '@nestjs/common';
import { EventRegistration, Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class EventRegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
  ) {}

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

  async getPaginated({
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
      model: 'EventRegistration',
      where: {
        OR: [
          {
            school: {
              name: {
                contains: search,
              },
            },
          },
          {
            event: {
              name: {
                contains: search,
              },
            },
          },
        ],
      } satisfies Prisma.EventRegistrationWhereInput,
      include: {
        event: true,
        school: true,
      } satisfies Prisma.EventRegistrationInclude,
      orderBy: {
        createdAt: 'desc',
      } satisfies Prisma.EventRegistrationOrderByWithRelationInput,
    });
  }
}
