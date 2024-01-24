import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Admin } from 'src/auth/admin.decorator';
import { Public } from 'src/auth/public.decorator';
import { MidtransPaymentNotificationDto } from './dto/payment-notification.dto';

@Controller('payments')
export class PaymentsController {
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
    {
      page,
      take = '10',
      search = '',
    }: {
      page?: string;
      take?: string;
      search?: string;
    },
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

  @Public()
  @Post('notification')
  async midtransPaymentNotification(
    @Body() body: MidtransPaymentNotificationDto,
  ) {
    const { order_id, gross_amount, status_code } = body;
    console.log(gross_amount, status_code);

    const payment = await this.paymentsService.getPayment({ id: order_id });
    if (payment) {
      await this.paymentsService.updateStatusBasedOnMidtransResponse(
        body,
        payment,
      );
    }

    return 'OK';
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
