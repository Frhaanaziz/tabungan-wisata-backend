import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Itinerary, Prisma } from '@prisma/client';

@Injectable()
export class ItinerariesService {
  private log = new Logger('ItinerariesService');
  constructor(private readonly prisma: PrismaService) {}

  async getItinerary(
    itineraryWhereUniqueInput: Prisma.ItineraryWhereUniqueInput,
  ): Promise<Itinerary | null> {
    return this.prisma.itinerary.findUnique({
      where: itineraryWhereUniqueInput,
    });
  }

  async getItineraries(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ItineraryWhereUniqueInput;
    where?: Prisma.ItineraryWhereInput;
    orderBy?: Prisma.ItineraryOrderByWithRelationInput;
  }): Promise<Itinerary[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.itinerary.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createItinerary(data: Prisma.ItineraryCreateInput): Promise<Itinerary> {
    return this.prisma.itinerary.create({
      data,
    });
  }

  async updateItinerary(params: {
    where: Prisma.ItineraryWhereUniqueInput;
    data: Prisma.ItineraryUpdateInput;
  }): Promise<Itinerary> {
    const { where, data } = params;
    return this.prisma.itinerary.update({
      data,
      where,
    });
  }

  async deleteItinerary(
    where: Prisma.ItineraryWhereUniqueInput,
  ): Promise<Itinerary> {
    return this.prisma.itinerary.delete({
      where,
    });
  }
}
