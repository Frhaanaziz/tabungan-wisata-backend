import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
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
}
