import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { UsersModule } from 'src/users/users.module';
import { MidtransModule } from 'src/midtrans/midtrans.module';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    UtilsModule,
    forwardRef(() => UsersModule),
    MidtransModule,
    EventsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
