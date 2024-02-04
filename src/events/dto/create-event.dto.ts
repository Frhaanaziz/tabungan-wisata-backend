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

  @IsNumber()
  @Min(1)
  duration: number;

  @IsString()
  @IsNotEmpty()
  highlight: string;

  @IsNumber()
  @Min(0)
  cost: number;
}
