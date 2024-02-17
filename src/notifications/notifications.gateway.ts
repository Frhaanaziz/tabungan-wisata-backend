import { OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UtilsService } from 'src/utils/utils.service';
import { PrismaService } from 'nestjs-prisma';

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
      // Create or update a new socket session
      await this.prisma.socketSession.upsert({
        where: {
          userId_type: {
            userId: payload.user.id,
            type: 'notification',
          },
        },
        update: {
          socketId: socket.id,
        },
        create: {
          userId: payload.user.id,
          type: 'notification',
          socketId: socket.id,
        },
      });

      await this.emitRecentNotifications({ userId: payload.user.id });

      socket.on('disconnect', async () => {
        await this.prisma.socketSession.delete({
          where: {
            userId_type: {
              userId: payload.user.id,
              type: 'notification',
            },
          },
        });
      });
    });
  }

  async emitRecentNotifications({ userId }: { userId: string }) {
    const socketSession = await this.prisma.socketSession.findMany({
      where: {
        userId,
        type: 'notification',
      },
    });

    if (socketSession) {
      const recentNotifications = await this.prisma.notification.findMany({
        take: 4,
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      socketSession.forEach((session) => {
        this.server
          .to(session.socketId)
          .emit('recentNotifications', recentNotifications);
      });
    }
  }
}
