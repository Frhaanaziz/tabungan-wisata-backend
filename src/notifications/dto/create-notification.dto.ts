import { NotificationType, PaymentStatus } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status: PaymentStatus;

  @IsBoolean()
  @IsOptional()
  isRead: boolean;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
