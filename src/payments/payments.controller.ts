import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Admin } from 'src/auth/admin.decorator';
import { GetPaginatedDataDto } from 'src/utils/dto/get-paginated-data.dto';

@Controller('payments')
export class PaymentsController {
  private log = new Logger('PaymentsController');
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Query('baseUrl') baseUrl: string,
  ) {
    if (!baseUrl)
      throw new NotFoundException('baseUrl query string is required');

    return this.paymentsService.createPaymentTransaction({
      ...createPaymentDto,
      baseUrl,
    });
  }

  @Admin()
  @Get()
  getAllPayments(
    @Query()
    { page, take = '10', search = '' }: GetPaginatedDataDto,
  ) {
    if (page) {
      return this.paymentsService.getPaymentsPaginated({
        page: parseInt(page),
        take: parseInt(take),
        search,
      });
    }

    return this.paymentsService.getPayments({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.getPayment({ id });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.deletePayment({ id });
  }
}
