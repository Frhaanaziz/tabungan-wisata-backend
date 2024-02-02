import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  include: string;

  @IsString()
  @IsNotEmpty()
  exclude: string;

  @IsString()
  @IsNotEmpty()
  highlight: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @IsNumber()
  @Min(0)
  cost: number;
}
