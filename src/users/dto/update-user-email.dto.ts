import { IsJWT, IsString } from 'class-validator';

export class UpdateUserEmailDto {
  @IsString()
  @IsJWT()
  token: string;
}
