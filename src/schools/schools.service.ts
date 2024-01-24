import { Injectable } from '@nestjs/common';
import { Prisma, School } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';
import { CreateSchoolDto } from './dto/create-school.dto';

@Injectable()
export class SchoolsService {
  constructor(
    private prisma: PrismaService,
    private utilsService: UtilsService,
  ) {}

  async getSchool(
    schoolWhereUniqueInput: Prisma.SchoolWhereUniqueInput,
  ): Promise<School | null> {
    return this.prisma.school.findUnique({
      where: schoolWhereUniqueInput,
      include: {
        _count: {
          select: { events: true, users: true },
        },
      },
    });
  }

  async getSchools(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SchoolWhereUniqueInput;
    where?: Prisma.SchoolWhereInput;
    orderBy?: Prisma.SchoolOrderByWithRelationInput;
  }): Promise<School[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.school.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        _count: {
          select: { events: true, users: true },
        },
      },
    });
  }

  async createSchool(createSchoolDto: CreateSchoolDto): Promise<School> {
    try {
      const schoolData = {
        ...createSchoolDto,
        code: this.utilsService.generateRandomCode(),
      };

      return await this.prisma.school.create({
        data: schoolData,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return this.createSchool(createSchoolDto);
      } else {
        throw error;
      }
    }
  }

  async updateSchool(params: {
    where: Prisma.SchoolWhereUniqueInput;
    data: Prisma.SchoolUpdateInput;
  }): Promise<School> {
    const { where, data } = params;
    return this.prisma.school.update({
      data,
      where,
    });
  }

  async getSchoolsPaginated({
    page,
    take,
    search,
  }: {
    page: number;
    take: number;
    search: string;
  }) {
    const include: Prisma.SchoolInclude = {
      _count: {
        select: { events: true, users: true },
      },
    };

    return this.utilsService.getPaginatedResult({
      page,
      take,
      model: 'School',
      where: {
        name: {
          contains: search,
        },
      },
      include,
    });
  }
}
