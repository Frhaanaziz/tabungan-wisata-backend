import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Payment, PaymentStatus, Prisma } from '@prisma/client';
import { MidtransService } from 'src/midtrans/midtrans.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { UtilsService } from 'src/utils/utils.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import crypto from 'crypto';
import { MidtransPaymentNotificationDto } from './dto/payment-notification.dto';

@Injectable()
export class PaymentsService {
  private log = new Logger('PaymentsService');
  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
    private readonly usersService: UsersService,
    private readonly midtransService: MidtransService,
  ) {}

  async getPayment(
    paymentWhereUniqueInput: Prisma.PaymentWhereUniqueInput,
  ): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: paymentWhereUniqueInput,
    });
  }

  async getPayments(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PaymentWhereUniqueInput;
    where?: Prisma.PaymentWhereInput;
    orderBy?: Prisma.PaymentOrderByWithRelationInput;
  }): Promise<Payment[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.payment.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createPayment(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.prisma.payment.create({
      data,
    });
  }

  async updatePayment(params: {
    where: Prisma.PaymentWhereUniqueInput;
    data: Prisma.PaymentUpdateInput;
  }): Promise<Payment> {
    const { where, data } = params;
    return this.prisma.payment.update({
      data,
      where,
    });
  }

  async deletePayment(where: Prisma.PaymentWhereUniqueInput): Promise<Payment> {
    return this.prisma.payment.delete({
      where,
    });
  }

  async getPaymentsPaginated({
    page,
    take,
    search,
    where,
  }: {
    page: number;
    take: number;
    search: string;
    where?: Prisma.PaymentWhereInput;
  }) {
    return this.utilsService.getPaginatedResult({
      page,
      take,
      model: 'Payment',
      where: {
        ...where,
        user: {
          name: {
            contains: search,
          },
        },
      },
      include: {
        user: true,
      },
    });
  }

  async createPaymentTransaction(
    input: CreatePaymentDto & { baseUrl: string },
  ) {
    const { baseUrl, userId, amount, ...restPaymentData } = input;

    const user = await this.usersService.getUser({
      where: {
        id: userId,
      },
    });
    if (!user) {
      this.log.error(
        `User with id ${userId} not found in createPaymentTransaction`,
      );
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const first_name = this.utilsService.getFirstName(user.name);
    const last_name = this.utilsService.getLastName(user.name);

    const { id: paymentId } = await this.createPayment({
      ...restPaymentData,
      amount,
      user: {
        connect: {
          id: userId,
        },
      },
    });

    try {
      return await this.midtransService.createTransaction({
        baseUrl,
        paymentId,
        transaction_details: {
          gross_amount: amount,
          order_id: paymentId,
        },
        customer_details: {
          first_name,
          last_name,
          email: user.email,
        },
      });
    } catch (error) {
      if (paymentId) await this.deletePayment({ id: paymentId });
      this.log.error('createPaymentTransaction', error);
      throw new InternalServerErrorException('Midtrans error');
    }
  }

  async updateStatusBasedOnMidtransResponse(
    {
      transaction_status,
      order_id,
      status_code,
      gross_amount,
      signature_key,
      fraud_status,
      payment_type,
    }: MidtransPaymentNotificationDto,
    payment: Payment,
  ) {
    const hash = crypto
      .createHash('sha512')
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
        const payment = await this.updatePayment({
          where: { id: order_id },
          data: {
            status: PaymentStatus.completed,
            paymentMethod: payment_type,
          },
        });
        responseData = payment;
      }
    } else if (transaction_status == 'settlement') {
      const payment = await this.updatePayment({
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
      const payment = await this.updatePayment({
        where: { id: order_id },
        data: {
          status: PaymentStatus.failed,
        },
      });
      responseData = payment;
    } else if (transaction_status == 'pending') {
      // check if payment status is already completed
      if (payment.status === 'completed') return payment;

      const updatedPayment = await this.updatePayment({
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
