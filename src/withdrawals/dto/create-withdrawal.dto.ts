import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWithdrawalDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  schoolId: string;
}
