import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateFileDto {
  @IsString()
  @IsUrl()
  url: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @IsInt()
  @Min(0)
  size: number;

  @IsDateString()
  uploadedAt: Date;

  @IsString()
  @IsOptional()
  eventId?: string;
}
