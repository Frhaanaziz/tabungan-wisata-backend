import { Module } from '@nestjs/common';
import { EventRegistrationsService } from './event-registrations.service';
import { EventRegistrationsController } from './event-registrations.controller';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [UtilsModule],
  controllers: [EventRegistrationsController],
  providers: [EventRegistrationsService],
})
export class EventRegistrationsModule {}
