import { Body, Controller, Headers, Logger, Post } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Public } from 'src/auth/public.decorator';
import { MidtransNotificationDto } from './dto/midtrans-notification.dto';
import { PaymentsService } from 'src/payments/payments.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly log = new Logger(WebhooksController.name);
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Public()
  @Post('midtrans-notification')
  async midtransPaymentNotification(
    @Headers('Iris-Signature') irisSignature: string,
    @Body() body: MidtransNotificationDto,
  ) {
    this.log.verbose('Midtrans payment notification received');
    const { order_id } = body;

    const payment = await this.paymentsService.getPayment({ id: order_id });
    if (payment) {
      await this.webhooksService.updateStatusPayment(body, payment);
    }

    return 'OK';
  }
}
