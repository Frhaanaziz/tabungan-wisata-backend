import { Injectable } from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
  ) {}

  async getNotification(
    where: Prisma.NotificationWhereUniqueInput,
  ): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where,
    });
  }

  async getNotificationOrFail(
    where: Prisma.NotificationWhereUniqueInput,
  ): Promise<Notification> {
    return this.prisma.notification.findUniqueOrThrow({
      where,
    });
  }

  async getNotifications(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.NotificationWhereUniqueInput;
    where?: Prisma.NotificationWhereInput;
    orderBy?: Prisma.NotificationOrderByWithRelationInput;
  }): Promise<Notification[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.notification.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy: {
        createdAt: 'desc',
        ...orderBy,
      },
    });
  }

  async getNotificationsPaginated({
    page,
    take,
    search,
    where,
    include,
  }: {
    page: number;
    take: number;
    search: string;
    include?: Prisma.NotificationInclude;
    where?: Prisma.NotificationWhereInput;
  }) {
    return this.utilsService.getPaginatedResult({
      page,
      take,
      model: 'Notification',
      include,
      where: {
        ...where,
        message: {
          contains: search,
        },
      } satisfies Prisma.NotificationWhereInput,
      orderBy: {
        createdAt: 'desc',
      } satisfies Prisma.NotificationOrderByWithRelationInput,
    });
  }

  async createNotification(
    data: Prisma.NotificationCreateInput,
  ): Promise<Notification> {
    return this.prisma.notification.create({
      data,
    });
  }

  async updateNotification(params: {
    where: Prisma.NotificationWhereUniqueInput;
    data: Prisma.NotificationUpdateInput;
  }): Promise<Notification> {
    const { where, data } = params;
    return this.prisma.notification.update({
      data,
      where,
    });
  }

  async deleteNotification(
    where: Prisma.NotificationWhereUniqueInput,
  ): Promise<Notification> {
    return this.prisma.notification.delete({
      where,
    });
  }
}
