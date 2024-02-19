import { IsString, MinLength } from 'class-validator';

export class CreateUserPasswordDto {
  @IsString()
  @MinLength(6)
  newPassword: string;
}
