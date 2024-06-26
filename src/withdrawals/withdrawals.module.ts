import { Module } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { WithdrawalsController } from './withdrawals.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UtilsModule, UsersModule],
  controllers: [WithdrawalsController],
  providers: [WithdrawalsService],
})
export class WithdrawalsModule {}
