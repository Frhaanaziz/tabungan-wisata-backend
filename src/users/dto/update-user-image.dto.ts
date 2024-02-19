import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserImageDto {
  @IsString()
  @IsUrl()
  @IsOptional()
  image?: string | null;
}
