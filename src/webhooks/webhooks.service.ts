import { Logger, UnauthorizedException } from '@nestjs/common';
import { Payment } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { MidtransNotificationDto } from './dto/midtrans-notification.dto';
import { PaymentsService } from 'src/payments/payments.service';

@Injectable()
export class WebhooksService {
  private readonly log = new Logger(WebhooksService.name);
  constructor(private readonly paymentsService: PaymentsService) {}

  async updateStatusPayment(
    {
      transaction_status,
      order_id,
      status_code,
      gross_amount,
      signature_key,
      fraud_status,
      payment_type,
    }: MidtransNotificationDto,
    payment: Payment,
  ) {
    const hash = createHash('sha512')
      .update(
        `${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`,
      )
      .digest('hex');

    if (signature_key !== hash) {
      this.log.error(
        'Invalid signature key in updateStatusBasedOnMidtransResponse',
      );
      throw new UnauthorizedException('Invalid signature key');
    }

    let responseData = null;

    if (transaction_status == 'capture') {
      if (fraud_status == 'accept') {
        responseData = await this.paymentsService.handleSuccessPayment({
          order_id,
          payment_type,
        });
      }
    } else if (transaction_status == 'settlement') {
      responseData = await this.paymentsService.handleSuccessPayment({
        order_id,
        payment_type,
      });
    } else if (
      transaction_status == 'cancel' ||
      transaction_status == 'deny' ||
      transaction_status == 'expire'
    ) {
      responseData = await this.paymentsService.handleFailedPayment({
        order_id,
        payment_type,
      });
    } else if (transaction_status == 'pending') {
      // check if payment status is already completed
      if (payment.status === 'completed') return payment;

      responseData = await this.paymentsService.handlePendingPayment({
        order_id,
        payment_type,
      });
    } else {
      this.log.error(
        `Invalid transaction_status "${transaction_status}" in updateStatusBasedOnMidtransResponse`,
      );
    }

    return responseData;
  }
}
