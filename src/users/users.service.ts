import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UtilsService } from 'src/utils/utils.service';
import { VerificationsService } from 'src/verifications/verifications.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private utilsService: UtilsService,
    private verificationsService: VerificationsService,
  ) {}

  async getUser(params: {
    where: Prisma.UserWhereUniqueInput;
    include?: Prisma.UserInclude;
    select?: Prisma.UserSelect;
  }): Promise<User | null> {
    const { where, include, select } = params;
    if (select) {
      return this.prisma.user.findUnique({
        where,
        select,
      });
    }

    return this.prisma.user.findUnique({
      where,
      include: {
        ...include,
        school: true,
      },
    });
  }

  async getUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy: {
        updatedAt: 'desc',
        ...orderBy,
      },
      include: {
        school: true,
      },
    });
  }

  async getTotalUsersBalance({ schoolId }: { schoolId?: string }) {
    const { _sum } = await this.prisma.user.aggregate({
      _sum: {
        balance: true,
      },
      where: {
        schoolId,
      },
    });

    return _sum.balance || 0;
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
      include: {
        school: true,
      },
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
    include?: Prisma.UserInclude;
  }): Promise<User> {
    const { where, data, include } = params;
    return this.prisma.user.update({
      data,
      where,
      include,
    });
  }

  async updateUsers(params: {
    where: Prisma.UserWhereInput;
    data: Prisma.UserUpdateInput;
  }): Promise<Prisma.BatchPayload> {
    const { where, data } = params;
    return this.prisma.user.updateMany({
      data,
      where,
    });
  }

  async getUsersPaginated({
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
      model: 'User',
      where: {
        name: {
          contains: search,
        },
        email: {
          contains: search,
        },
      } satisfies Prisma.UserWhereInput,
      include: {
        school: true,
      } satisfies Prisma.UserInclude,
      orderBy: {
        updatedAt: 'desc',
      } satisfies Prisma.UserOrderByWithRelationInput,
    });
  }

  async updateUserSchoolByCode({
    userId,
    schoolCode,
  }: {
    userId: string;
    schoolCode: string;
  }) {
    try {
      return await this.updateUser({
        where: {
          id: userId,
        },
        data: {
          school: {
            connect: {
              code: schoolCode,
            },
          },
        },
      });
    } catch (error) {
      if (
        error.code === 'P2025' &&
        error.meta.cause == 'Record to update not found.'
      )
        throw new NotFoundException('Account not found');
      throw new NotFoundException('Invalid school code');
    }
  }

  async resetPassword({
    newPassword,
    userId,
  }: ResetPasswordDto & { userId: string }) {
    try {
      const hashedPassword = await this.utilsService.hashPassword(newPassword);
      const updatedUser = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password: hashedPassword,
          emailVerified: true,
        },
      });

      return updatedUser;
    } catch (error) {
      throw new NotFoundException('Account not found');
    }
  }

  async updateEmailVerified({
    userId,
    emailVerified,
    token,
  }: {
    userId: string;
    emailVerified: boolean;
    token: string;
  }) {
    const updatedUser = await this.updateUser({
      where: { id: userId },
      data: { emailVerified },
      include: { verification: true },
    });

    await this.verificationsService.updateVerification({
      where: { token },
      data: { active: true },
    });

    return updatedUser;
  }

  async getUsersCount() {
    return this.prisma.user.count();
  }
}
