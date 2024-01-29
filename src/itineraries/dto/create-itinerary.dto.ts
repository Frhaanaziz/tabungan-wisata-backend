import { IsNotEmpty, IsString } from 'class-validator';

export class CreateItineraryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  eventId: string;
}
