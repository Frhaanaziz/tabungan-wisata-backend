import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(6)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
