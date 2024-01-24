import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserSchoolDto {
  @IsString()
  @IsNotEmpty()
  schoolCode: string;
}
