import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { VerificationsModule } from 'src/verifications/verifications.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [UtilsModule, VerificationsModule, PaymentsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
