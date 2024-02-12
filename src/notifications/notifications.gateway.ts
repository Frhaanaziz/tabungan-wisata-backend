import { OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtPayload } from 'src/auth/interface/jwt-payload.interface';
import { UtilsService } from 'src/utils/utils.service';
import { Notification } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

export interface socketMetaPayload extends JwtPayload {
  socketId: string;
}

@WebSocketGateway(+process.env.WS_PORT, {
  namespace: 'notifications',
  cors: {
    origin: process.env.STUDENT_URL,
    credentials: true,
  },
})
export class NotificationsGateway implements OnModuleInit {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly prisma: PrismaService,
  ) {}

  @WebSocketServer() server: Server;
  socketMap = new Map<string, socketMetaPayload>();

  onModuleInit() {
    this.server.on('connection', async (socket) => {
      const accessToken = socket.handshake.headers.authorization?.split(' ')[1];

      if (!accessToken) {
        socket.disconnect(true); // disconnect this socket and close the underlying connection "namespace"
        return;
      }

      const payload = this.utilsService.verifyJwtToken(accessToken);
      if (!payload) {
        socket.disconnect(true);
        return;
      }
      this.socketMap.set(payload.user.id, { ...payload, socketId: socket.id });

      await this.emitRecentNotifications({ userId: payload.user.id });

      socket.on('disconnect', () => {
        this.socketMap.delete(payload.user.id);
      });
    });
  }

  private async emitRecentNotifications({ userId }: { userId: string }) {
    const socketMeta = this.socketMap.get(userId);

    if (socketMeta) {
      const recentNotifications = await this.prisma.notification.findMany({
        take: 4,
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const { socketId } = socketMeta;
      this.server.to(socketId).emit('recentNotifications', recentNotifications);
    }
  }

  async notifyNewNotification({
    notification,
    userId,
  }: {
    notification: Notification;
    userId: string;
  }) {
    const socketMeta = this.socketMap.get(userId);

    if (socketMeta) {
      const { socketId } = socketMeta;
      this.server.to(socketId).emit('newNotification', notification);
    }

    await this.emitRecentNotifications({ userId });
  }
}
