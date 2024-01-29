import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

class TransactionDetails {
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsInt()
  @Min(0)
  gross_amount: number;
}

class CustomerDetails {
  @IsString()
  first_name: string;

  @IsString()
  last_name?: string;

  @IsEmail()
  email: string;
}

export class CreateTransactionDto {
  @IsString()
  baseUrl: string;

  @IsString()
  paymentId: string;

  transaction_details: TransactionDetails;

  customer_details: CustomerDetails;

  @IsString()
  user_id: string;

  @IsOptional()
  item_details?: object | object[];
}
