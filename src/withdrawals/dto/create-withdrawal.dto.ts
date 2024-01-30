import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateWithdrawalDto {
  @IsInt()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
