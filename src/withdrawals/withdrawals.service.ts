import { Injectable } from '@nestjs/common';
import { Prisma, Withdrawal } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { UtilsService } from 'src/utils/utils.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UsersService } from 'src/users/users.service';
import { SchoolsService } from 'src/schools/schools.service';

@Injectable()
export class WithdrawalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
    private readonly usersService: UsersService,
    private readonly schoolsService: SchoolsService,
  ) {}

  async getWithdrawal(
    withdrawalWhereUniqueInput: Prisma.WithdrawalWhereUniqueInput,
  ): Promise<Withdrawal | null> {
    return this.prisma.withdrawal.findUnique({
      where: withdrawalWhereUniqueInput,
    });
  }

  async getWithdrawals(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.WithdrawalWhereUniqueInput;
    where?: Prisma.WithdrawalWhereInput;
    orderBy?: Prisma.WithdrawalOrderByWithRelationInput;
  }): Promise<Withdrawal[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.withdrawal.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy: {
        createdAt: 'desc',
        ...orderBy,
      },
      include: {
        user: true,
        school: true,
      },
    });
  }

  async createWithdrawal(
    data: Prisma.WithdrawalCreateInput,
  ): Promise<Withdrawal> {
    return this.prisma.withdrawal.create({
      data,
      include: {
        user: true,
        school: true,
      },
    });
  }

  async createWithdrawalWithAction({ schoolId, userId }: CreateWithdrawalDto) {
    const balance = await this.usersService.getTotalUsersBalance({
      schoolId,
    });

    await this.usersService.updateUsers({
      data: {
        balance: {
          set: 0,
        },
      },
      where: {
        schoolId,
      },
    });

    return this.createWithdrawal({
      amount: balance,
      user: {
        connect: {
          id: userId,
        },
      },
      school: {
        connect: {
          id: schoolId,
        },
      },
    });
  }

  async updateWithdrawal(params: {
    where: Prisma.WithdrawalWhereUniqueInput;
    data: Prisma.WithdrawalUpdateInput;
  }): Promise<Withdrawal> {
    const { where, data } = params;
    return this.prisma.withdrawal.update({
      data,
      where,
      include: {
        user: true,
        school: true,
      },
    });
  }

  async deleteWithdrawal(
    where: Prisma.WithdrawalWhereUniqueInput,
  ): Promise<Withdrawal> {
    return this.prisma.withdrawal.delete({
      where,
      include: {
        user: true,
        school: true,
      },
    });
  }

  async getWithdrawalsPaginated({
    page,
    take,
    search,
    where,
  }: {
    page: number;
    take: number;
    search: string;
    where?: Prisma.WithdrawalWhereInput;
  }) {
    return this.utilsService.getPaginatedResult({
      page,
      take,
      model: 'Withdrawal',
      where: {
        ...where,
        user: {
          name: {
            contains: search,
          },
        },
        school: {
          name: {
            contains: search,
          },
        },
      } satisfies Prisma.WithdrawalWhereInput,
      include: {
        user: true,
        school: true,
      } satisfies Prisma.WithdrawalInclude,
      orderBy: {
        createdAt: 'desc',
      } satisfies Prisma.WithdrawalOrderByWithRelationInput,
    });
  }

  async calculateTotalWithdrawalAmount({
    schoolId,
  }: {
    schoolId: string;
  }): Promise<number> {
    const balance = await this.usersService.getTotalUsersBalance({
      schoolId,
    });

    return balance;
  }
}
