import { Logger, UnauthorizedException } from '@nestjs/common';
import { Payment, PaymentStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { MidtransNotificationDto } from './dto/midtrans-notification.dto';
import { PaymentsService } from 'src/payments/payments.service';

@Injectable()
export class WebhooksService {
  constructor(private readonly paymentsService: PaymentsService) {}

  private readonly log = new Logger(WebhooksService.name);

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
        const payment = await this.paymentsService.updatePayment({
          where: { id: order_id },
          data: {
            status: PaymentStatus.completed,
            paymentMethod: payment_type,
          },
        });
        responseData = payment;
      }
    } else if (transaction_status == 'settlement') {
      const payment = await this.paymentsService.updatePayment({
        where: { id: order_id },
        data: {
          status: PaymentStatus.completed,
          paymentMethod: payment_type,
        },
      });
      responseData = payment;
    } else if (
      transaction_status == 'cancel' ||
      transaction_status == 'deny' ||
      transaction_status == 'expire'
    ) {
      const payment = await this.paymentsService.updatePayment({
        where: { id: order_id },
        data: {
          status: PaymentStatus.failed,
          paymentMethod: payment_type,
        },
      });
      responseData = payment;
    } else if (transaction_status == 'pending') {
      // check if payment status is already completed
      if (payment.status === 'completed') return payment;

      const updatedPayment = await this.paymentsService.updatePayment({
        where: { id: order_id },
        data: {
          status: PaymentStatus.pending,
          paymentMethod: payment_type,
        },
      });
      responseData = updatedPayment;
    } else {
      this.log.error(
        `Invalid transaction_status "${transaction_status}" in updateStatusBasedOnMidtransResponse`,
      );
    }

    return responseData;
  }
}
