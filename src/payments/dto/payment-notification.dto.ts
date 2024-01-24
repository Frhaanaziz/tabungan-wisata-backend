import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MidtransPaymentNotificationDto {
  @IsString()
  @IsNotEmpty()
  transaction_status: string;

  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsNotEmpty()
  status_code: string;

  @IsNotEmpty()
  gross_amount: number;

  @IsString()
  @IsNotEmpty()
  signature_key: string;

  @IsString()
  @IsOptional()
  fraud_status: string;

  @IsString()
  @IsOptional()
  payment_type: string;
}
