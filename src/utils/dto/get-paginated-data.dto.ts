import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetPaginatedDataDto {
  @IsNumberString()
  @IsOptional()
  page?: string;

  @IsNumberString()
  @IsOptional()
  take?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
