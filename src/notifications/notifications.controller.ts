import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from 'nestjs-prisma';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}
  @Get(':id')
  async getNotification(@Param('id') id: string) {
    return this.notificationsService.getNotificationOrFail({ id });
  }

  @Post()
  async createNotification(@Body() { userId, ...rest }: CreateNotificationDto) {
    return this.notificationsService.createNotification({
      ...rest,
      user: {
        connect: {
          id: userId,
        },
      },
    });
  }

  @Post(':id/mark-all')
  async markAllNotification(@Param('id') id: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId: id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  // @Patch(':id/isRead')
  // async markNotification(
  //   @Param('id') id: string,
  //   @Body('isRead') { isRead }: UpdateNotificationDto,
  // ) {
  //   return this.notificationsService.updateNotification({
  //     where: {
  //       id,
  //     },
  //     data: {
  //       isRead,
  //     },
  //   });
  // }
}
