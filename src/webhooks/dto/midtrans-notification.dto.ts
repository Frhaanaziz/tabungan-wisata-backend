import { IsOptional } from 'class-validator';

export class MidtransNotificationDto {
  // Payment notification
  @IsOptional()
  transaction_status: string;

  @IsOptional()
  order_id: string;

  @IsOptional()
  status_code: string;

  @IsOptional()
  gross_amount: string;

  @IsOptional()
  signature_key: string;

  @IsOptional()
  fraud_status: string;

  @IsOptional()
  payment_type: string;

  // Payout notification
  @IsOptional()
  amount: string;

  @IsOptional()
  reference_no: string;

  @IsOptional()
  status: string;

  @IsOptional()
  updated_at: string;

  @IsOptional()
  error_code: string;

  @IsOptional()
  error_message: string;
}
