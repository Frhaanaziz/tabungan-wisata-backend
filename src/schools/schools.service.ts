import { Injectable } from '@nestjs/common';
import { Prisma, School } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
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
          select: { users: true },
        },
      },
    });
  }

  async getSchoolJoined(
    schoolWhereUniqueInput: Prisma.SchoolWhereUniqueInput,
  ): Promise<School | null> {
    return this.prisma.school.findUnique({
      where: schoolWhereUniqueInput,
      include: {
        schoolAdmins: true,
      },
    });
  }

  async getSchoolForExport(
    schoolWhereUniqueInput: Prisma.SchoolWhereUniqueInput,
  ): Promise<School | null> {
    return this.prisma.school.findUniqueOrThrow({
      where: schoolWhereUniqueInput,
      include: {
        schoolAdmins: true,
        eventRegistrations: {
          include: {
            event: true,
          },
        },
        users: {
          include: {
            payments: true,
          },
        },
        withdrawals: {
          include: {
            user: true,
          },
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
      orderBy: {
        updatedAt: 'desc',
        ...orderBy,
      },
      include: {
        _count: {
          select: { users: true },
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
      include: {
        schoolAdmins: true,
      },
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
    const { content, ...rest } = await this.utilsService.getPaginatedResult({
      page,
      take,
      model: 'School',
      where: {
        name: {
          contains: search,
        },
      } satisfies Prisma.SchoolWhereInput,
      include: {
        _count: {
          select: { users: true },
        },
      } satisfies Prisma.SchoolInclude,
      orderBy: {
        updatedAt: 'desc',
      } satisfies Prisma.SchoolOrderByWithRelationInput,
    });

    const schoolsWithBalance = content.map(async (school) => {
      const {
        _sum: { balance },
      } = await this.prisma.user.aggregate({
        _sum: {
          balance: true,
        },
        where: {
          schoolId: school.id,
        },
      });

      return {
        ...school,
        balance: balance || 0,
      };
    });

    return {
      ...rest,
      content: await Promise.all(schoolsWithBalance),
    };
  }
}
