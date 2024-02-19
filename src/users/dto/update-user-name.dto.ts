import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
