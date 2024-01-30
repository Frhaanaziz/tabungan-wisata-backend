import { PartialType } from '@nestjs/mapped-types';
import { CreateWithdrawalDto } from './create-withdrawal.dto';

export class UpdateWithdrawalDto extends PartialType(CreateWithdrawalDto) {}
