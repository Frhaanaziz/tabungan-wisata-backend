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
import { UtilsService } from 'src/utils/utils.service';
import { Prisma } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  private log = new Logger('PaymentsController');
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly utilsService: UtilsService,
  ) {}

  @Admin()
  @Get()
  getAllPayments(
    @Query()
    {
      page,
      take = '10',
      days = '30',
      search = '',
      completed,
    }: GetPaginatedDataDto & { completed?: boolean; days?: string },
  ) {
    if (page) {
      return this.paymentsService.getPaymentsPaginated({
        page: parseInt(page),
        take: parseInt(take),
        search,
        include: { user: true },
      });
    } else if (completed) {
      return this.paymentsService.getCompletedPayments({
        take: parseInt(take),
        days: parseInt(days),
      });
    }

    return this.paymentsService.getPayments({
      orderBy: { createdAt: 'desc' },
    });
  }

  @Admin()
  @Get('/growth-percentage')
  getPercentageFromLastMonth() {
    return this.utilsService.getGrowthPercentageFromLastMonth({
      model: 'Payment',
      where: { status: 'completed' } satisfies Prisma.PaymentWhereInput,
    });
  }

  @Admin()
  @Get('count-new-payments')
  async getNewPayments(@Query() { days = '30' }: { days?: string }) {
    return this.utilsService.getNewItemsLastDays({
      days: parseInt(days),
      model: 'Payment',
      where: {
        status: 'completed',
      } satisfies Prisma.PaymentWhereInput,
    });
  }

  // @Admin()
  // @Get('/monthly')
  // getMonthlyPayments() {
  //   return this.paymentsService.getPaymentsByMonth();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.getPayment({ id });
  }

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

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedPayments = await this.paymentsService.deletePayment({ id });
    this.log.fatal(`Payment ${id} deleted`);

    return deletedPayments;
  }
}
