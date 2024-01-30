import { Injectable } from '@nestjs/common';
import { Prisma, Withdrawal } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class WithdrawalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
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
      } satisfies Prisma.WithdrawalWhereInput,
      include: {
        user: true,
      } satisfies Prisma.WithdrawalInclude,
      orderBy: {
        createdAt: 'desc',
      } satisfies Prisma.WithdrawalOrderByWithRelationInput,
    });
  }
}
