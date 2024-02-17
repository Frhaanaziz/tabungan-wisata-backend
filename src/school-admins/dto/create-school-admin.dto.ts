import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSchoolAdminDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  contact: string;

  @IsString()
  @IsNotEmpty()
  schoolId: string;
}
