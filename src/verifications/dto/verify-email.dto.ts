import { IsEmail, IsUrl } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsUrl()
  baseUrl: string;
}
