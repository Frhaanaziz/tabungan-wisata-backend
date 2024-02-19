import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyUpdatedEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  baseUrl: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
