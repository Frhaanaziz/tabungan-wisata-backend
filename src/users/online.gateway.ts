import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UtilsService } from 'src/utils/utils.service';
import { PrismaService } from 'nestjs-prisma';
import { Logger } from '@nestjs/common';

@WebSocketGateway(+process.env.WS_PORT, {
  namespace: 'users/online-admins',
  cors: {
    origin: [process.env.STUDENT_URL, process.env.ADMIN_URL],
    credentials: true,
  },
})
export class OnlineUsersGateway
  implements OnGatewayDisconnect, OnGatewayConnection
{
  private readonly logger = new Logger(OnlineUsersGateway.name);
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
    } else if (payload.user.role !== 'admin') {
      client.disconnect(true);
      return;
    }
    // Create or update a new socket session
    await this.prisma.socketSession.upsert({
      where: {
        userId_type: {
          userId: payload.user.id,
          type: 'onlineAdmin',
        },
      },
      update: {
        socketId: client.id,
      },
      create: {
        userId: payload.user.id,
        type: 'onlineAdmin',
        socketId: client.id,
      },
    });

    await this.emitOnlineAdmins();
  }

  async handleDisconnect(client: Socket) {
    const accessToken = client.handshake.headers.authorization?.split(' ')[1];
    const payload = this.utilsService.verifyJwtToken(accessToken);

    try {
      await this.prisma.socketSession.delete({
        where: {
          userId_type: {
            userId: payload.user.id,
            type: 'onlineAdmin',
          },
        },
      });
    } catch (error) {
      this.logger.error(error);
    }

    await this.emitOnlineAdmins();
    client.disconnect();
  }

  async emitOnlineAdmins() {
    const socketSession = await this.prisma.socketSession.findMany({
      where: {
        type: 'onlineAdmin',
      },
    });
    const onlineAdmins = await this.prisma.user.findMany({
      where: {
        id: {
          in: socketSession.map((session) => session.userId),
        },
      },
    });

    this.server.emit('onlineAdmins', onlineAdmins);
  }
}
