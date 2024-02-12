import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { MidtransModule } from 'src/midtrans/midtrans.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [UtilsModule, MidtransModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
