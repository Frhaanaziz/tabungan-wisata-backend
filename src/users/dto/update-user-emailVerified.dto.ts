import { IsBoolean, IsJWT, IsString } from 'class-validator';

export class UpdateUserEmailVerifiedDto {
  @IsBoolean()
  emailVerified: boolean;

  @IsString()
  @IsJWT()
  token: string;
}
