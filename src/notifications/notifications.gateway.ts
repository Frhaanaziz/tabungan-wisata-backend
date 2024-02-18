import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UtilsService } from 'src/utils/utils.service';
import { PrismaService } from 'nestjs-prisma';

@WebSocketGateway(+process.env.WS_PORT, {
  namespace: 'notifications',
  cors: {
    origin: [process.env.STUDENT_URL, process.env.ADMIN_URL],
    credentials: true,
  },
})
// implements OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit
export class NotificationsGateway
  implements OnGatewayDisconnect, OnGatewayConnection
{
  constructor(
    private readonly utilsService: UtilsService,
    private readonly prisma: PrismaService,
  ) {}

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    const accessToken = client.handshake.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      client.disconnect(true); // disconnect this socket and close the underlying connection "namespace"
      return;
    }

    const payload = this.utilsService.verifyJwtToken(accessToken);
    if (!payload) {
      client.disconnect(true);
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
        socketId: client.id,
      },
      create: {
        userId: payload.user.id,
        type: 'notification',
        socketId: client.id,
      },
    });

    await this.emitRecentNotifications({ userId: payload.user.id });
  }

  async handleDisconnect(client: Socket) {
    const accessToken = client.handshake.headers.authorization?.split(' ')[1];
    const payload = this.utilsService.verifyJwtToken(accessToken);

    await this.prisma.socketSession.delete({
      where: {
        userId_type: {
          userId: payload.user.id,
          type: 'notification',
        },
      },
    });

    client.disconnect();
  }

  async emitRecentNotifications({ userId }: { userId: string }) {
    const socketSession = await this.prisma.socketSession.findUnique({
      where: {
        userId_type: {
          userId,
          type: 'notification',
        },
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

      this.server
        .to(socketSession.socketId)
        .emit('recentNotifications', recentNotifications);
    }
  }
}
