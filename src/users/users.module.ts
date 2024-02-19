import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { VerificationsModule } from 'src/verifications/verifications.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { OnlineUsersGateway } from './online.gateway';

@Module({
  imports: [
    UtilsModule,
    VerificationsModule,
    PaymentsModule,
    NotificationsModule,
    VerificationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, OnlineUsersGateway],
  exports: [UsersService, OnlineUsersGateway],
})
export class UsersModule {}
