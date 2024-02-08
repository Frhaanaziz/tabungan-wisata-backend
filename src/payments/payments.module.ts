import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { MidtransModule } from 'src/midtrans/midtrans.module';

@Module({
  imports: [UtilsModule, MidtransModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
