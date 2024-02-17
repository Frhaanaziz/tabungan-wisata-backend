import { Module } from '@nestjs/common';
import { SchoolAdminsService } from './school-admins.service';
import { SchoolAdminsController } from './school-admins.controller';

@Module({
  controllers: [SchoolAdminsController],
  providers: [SchoolAdminsService],
})
export class SchoolAdminsModule {}
