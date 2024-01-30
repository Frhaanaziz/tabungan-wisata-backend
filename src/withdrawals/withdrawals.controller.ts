import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { Admin } from 'src/auth/admin.decorator';
import { GetPaginatedDataDto } from 'src/utils/dto/get-paginated-data.dto';

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Admin()
  @Post()
  create(@Body() { amount, userId }: CreateWithdrawalDto) {
    return this.withdrawalsService.createWithdrawal({
      amount,
      user: {
        connect: {
          id: userId,
        },
      },
    });
  }

  @Admin()
  @Get()
  getAllPayments(
    @Query()
    { page, take = '10', search = '' }: GetPaginatedDataDto,
  ) {
    if (page) {
      return this.withdrawalsService.getWithdrawalsPaginated({
        page: parseInt(page),
        take: parseInt(take),
        search,
      });
    }

    return this.withdrawalsService.getWithdrawals({});
  }
}
