import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User, VerificationType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UtilsService } from 'src/utils/utils.service';
import { VerificationsService } from 'src/verifications/verifications.service';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

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

  async getUsersCount() {
    return this.prisma.user.count();
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
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            email: {
              contains: search,
            },
          },
          {
            school: {
              name: {
                contains: search,
              },
            },
          },
        ],
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

  async createPassword({
    userId,
    password,
  }: {
    userId: string;
    password: string;
  }) {
    const hashedPassword = await this.utilsService.hashPassword(password);
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return updatedUser;
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
    const decoded = this.utilsService.verifyJwtToken(token);
    if (!decoded)
      throw new NotFoundException('Invalid token, please request a new one');

    if (userId !== decoded.user.id)
      throw new NotFoundException('Invalid token, please request a new one');

    const verification = await this.verificationsService.getVerification({
      userId_type: {
        userId,
        type: VerificationType.emailNew,
      },
    });

    if (verification.expiresAt < new Date(Date.now()))
      throw new NotFoundException('Token expired, please request a new one');

    const [updatedUser] = await Promise.all([
      this.updateUser({
        where: { id: userId },
        data: { emailVerified },
      }),
      this.verificationsService.updateVerification({
        where: {
          userId_type: {
            userId,
            type: VerificationType.emailNew,
          },
        },
        data: { active: true },
      }),
    ]);

    return updatedUser;
  }

  async updateEmail({ token, userId }: { token: string; userId: string }) {
    const decoded = this.utilsService.verifyJwtToken(token);
    if (!decoded)
      throw new NotFoundException('Invalid token, please request a new one');

    if (userId !== decoded.user.id)
      throw new NotFoundException('Invalid token, please request a new one');

    if (!decoded.user.email)
      throw new NotFoundException('Invalid token, please request a new one');

    const verification = await this.verificationsService.getVerification({
      userId_type: {
        userId,
        type: VerificationType.emailUpdate,
      },
    });

    if (verification.expiresAt < new Date(Date.now()))
      throw new NotFoundException('Token expired, please request a new one');

    if (verification.active)
      throw new NotFoundException(
        'Email already updated, please request a new one',
      );

    const [updatedUser] = await Promise.all([
      this.updateUser({
        where: { id: userId },
        data: { email: decoded.user.email },
      }),
      this.verificationsService.updateVerification({
        where: {
          userId_type: {
            userId,
            type: VerificationType.emailUpdate,
          },
        },
        data: { active: true },
      }),
    ]);

    return updatedUser;
  }

  async updatePassword({
    currentPassword,
    newPassword,
    userId,
  }: UpdateUserPasswordDto & { userId: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundException('Account not found');

    const isPasswordValid = await this.utilsService.comparePassword(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid)
      throw new NotFoundException('Invalid current password, please try again');

    const hashedPassword = await this.utilsService.hashPassword(newPassword);
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return updatedUser;
  }
}
