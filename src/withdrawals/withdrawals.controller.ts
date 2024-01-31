import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { Admin } from 'src/auth/admin.decorator';
import { GetPaginatedDataDto } from 'src/utils/dto/get-paginated-data.dto';
import { GetWithdrawalsTotalAmountDto } from './dto/get-total-amount.dto';

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Admin()
  @Post()
  create(@Body() createWithdrawalDto: CreateWithdrawalDto) {
    return this.withdrawalsService.createWithdrawalWithAction(
      createWithdrawalDto,
    );
  }

  @Admin()
  @Get()
  getAll(
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

  @Admin()
  @Get('total-amount')
  getTotalWithdrawalAmount(@Body() body: GetWithdrawalsTotalAmountDto) {
    return this.withdrawalsService.calculateTotalWithdrawalAmount(body);
  }
}
