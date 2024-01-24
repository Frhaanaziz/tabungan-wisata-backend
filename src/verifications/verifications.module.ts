import { Module, forwardRef } from '@nestjs/common';
import { VerificationsService } from './verifications.service';
import { VerificationsController } from './verifications.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { ResendModule } from 'nestjs-resend';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UtilsModule,
    ResendModule.forRoot({
      apiKey: process.env.RESEND_API_KEY,
    }),
    forwardRef(() => UsersModule),
  ],
  controllers: [VerificationsController],
  providers: [VerificationsService],
  exports: [VerificationsService],
})
export class VerificationsModule {}
