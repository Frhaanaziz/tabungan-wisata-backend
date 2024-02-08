import { Module } from '@nestjs/common';
import { VerificationsService } from './verifications.service';
import { VerificationsController } from './verifications.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { ResendModule } from 'nestjs-resend';

@Module({
  imports: [
    UtilsModule,
    ResendModule.forRoot({
      apiKey: process.env.RESEND_API_KEY,
    }),
  ],
  controllers: [VerificationsController],
  providers: [VerificationsService],
  exports: [VerificationsService],
})
export class VerificationsModule {}
