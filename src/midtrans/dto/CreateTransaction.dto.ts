import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
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
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsEmail()
  email: string;
}

export class CreateTransactionDto {
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  baseUrl: string;

  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsObject()
  transaction_details: TransactionDetails;

  @IsObject()
  customer_details: CustomerDetails;

  @IsOptional()
  item_details?: object | object[];
}
