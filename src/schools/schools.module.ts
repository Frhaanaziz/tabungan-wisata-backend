import { Module } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { EventsModule } from 'src/events/events.module';
import { EventsService } from 'src/events/events.service';

@Module({
  imports: [UtilsModule],
  controllers: [SchoolsController],
  providers: [SchoolsService, EventsService],
  exports: [SchoolsService],
})
export class SchoolsModule {}
