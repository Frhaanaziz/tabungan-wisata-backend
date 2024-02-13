import { Module } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { EventRegistrationsModule } from 'src/event-registrations/event-registrations.module';

@Module({
  imports: [UtilsModule, EventRegistrationsModule],
  controllers: [SchoolsController],
  providers: [SchoolsService],
  exports: [SchoolsService],
})
export class SchoolsModule {}
