import { IsBooleanString, IsNumberString, IsOptional } from 'class-validator';
import { GetPaginatedDataDto } from 'src/utils/dto/get-paginated-data.dto';

export class GetEventsDto extends GetPaginatedDataDto {
  @IsNumberString()
  @IsOptional()
  costLTE?: string;

  @IsNumberString()
  @IsOptional()
  costGTE?: string;

  @IsNumberString()
  @IsOptional()
  durationLTE?: string;

  @IsNumberString()
  @IsOptional()
  durationGTE?: string;

  @IsBooleanString()
  @IsOptional()
  highlighted?: string;
}
