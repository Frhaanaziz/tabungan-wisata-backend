import { IsJWT, IsString } from 'class-validator';

export class VerifyTokenDto {
  @IsString()
  @IsJWT()
  token: string;
}
