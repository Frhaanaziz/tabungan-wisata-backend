import { IsNotEmpty, IsString } from 'class-validator';

export class GetWithdrawalsTotalAmountDto {
  @IsString()
  @IsNotEmpty()
  schoolId: string;
}
