import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolAdminDto } from './create-school-admin.dto';

export class UpdateSchoolAdminDto extends PartialType(CreateSchoolAdminDto) {}
