import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Payment, PaymentStatus, Prisma, User } from '@prisma/client';
import { MidtransService } from 'src/midtrans/midtrans.service';
import { PrismaService } from 'nestjs-prisma';
import { UtilsService } from 'src/utils/utils.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

@Injectable()
export class PaymentsService {
  private log = new Logger('PaymentsService');
  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
    private readonly midtransService: MidtransService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // For avoiding circular dependency
  private async getUser({
    where,
  }: {
    where: Prisma.UserWhereUniqueInput;
  }): Promise<User | null> {
    return this.prisma.user.findUnique({
      where,
    });
  }

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
      orderBy: {
        createdAt: 'desc',
        ...orderBy,
      },
      include: {
        user: true,
      },
    });
  }

  async getCompletedPayments(params: {
    take?: number;
    days?: number;
  }): Promise<Payment[]> {
    const { take, days } = params;

    const startDate = new Date(
      new Date().getTime() - 1000 * 60 * 60 * 24 * days,
    );

    const payments = await this.prisma.payment.findMany({
      take,
      where: {
        status: 'completed',
        createdAt: {
          gt: days ? startDate : undefined,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
      },
    });

    return payments || [];
  }

  async getPaymentsPaginated({
    page,
    take,
    search,
    where,
    include,
  }: {
    page: number;
    take: number;
    search: string;
    include?: Prisma.PaymentInclude;
    where?: Prisma.PaymentWhereInput;
  }) {
    return this.utilsService.getPaginatedResult({
      page,
      take,
      model: 'Payment',
      include,
      where: {
        ...where,
        user: {
          name: {
            contains: search,
          },
        },
      } satisfies Prisma.PaymentWhereInput,
      orderBy: {
        createdAt: 'desc',
      } satisfies Prisma.PaymentOrderByWithRelationInput,
    });
  }

  async createPayment(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.prisma.payment.create({
      data,
    });
  }

  async createPaymentTransaction(
    input: CreatePaymentDto & { baseUrl: string },
  ) {
    const { baseUrl, userId, amount, ...restPaymentData } = input;

    const user = await this.getUser({
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
        user_id: userId,
      });
    } catch (error) {
      if (paymentId) await this.deletePayment({ id: paymentId });
      this.log.error('createPaymentTransaction', error);
      throw new InternalServerErrorException('Midtrans error');
    }
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

  async handleSuccessPayment({
    order_id,
    payment_type,
  }: {
    order_id: string;
    payment_type: string;
  }) {
    const { notification, payment } = await this.prisma.$transaction(
      async (tx) => {
        const payment = await tx.payment.update({
          where: { id: order_id },
          data: {
            status: PaymentStatus.completed,
            paymentMethod: payment_type,
          },
        });

        // update user balance if payment status is completed
        await tx.user.update({
          where: { id: payment.userId },
          data: { balance: { increment: payment.amount } },
        });

        const notification = await tx.notification.create({
          data: {
            type: 'transaction',
            status: 'completed',
            message: 'Transaction completed successfully.',
            user: {
              connect: {
                id: payment.userId,
              },
            },
          },
        });

        return { payment, notification };
      },
    );
    await this.notificationsGateway.notifyNewNotification({
      notification,
      userId: payment.userId,
    });

    return payment;
  }

  async handleFailedPayment({
    order_id,
    payment_type,
  }: {
    order_id: string;
    payment_type: string;
  }) {
    const { notification, payment } = await this.prisma.$transaction(
      async (tx) => {
        const payment = await tx.payment.update({
          where: { id: order_id },
          data: {
            status: PaymentStatus.failed,
            paymentMethod: payment_type,
          },
        });

        const notification = await tx.notification.create({
          data: {
            type: 'transaction',
            status: 'failed',
            message: 'Transfer incomplete. Please retry transfer.',
            user: {
              connect: {
                id: payment.userId,
              },
            },
          },
        });

        return { payment, notification };
      },
    );

    await this.notificationsGateway.notifyNewNotification({
      notification,
      userId: payment.userId,
    });

    return payment;
  }

  async handlePendingPayment({
    order_id,
    payment_type,
  }: {
    order_id: string;
    payment_type: string;
  }) {
    const { notification, payment } = await this.prisma.$transaction(
      async (tx) => {
        const payment = await tx.payment.update({
          where: { id: order_id },
          data: {
            status: PaymentStatus.pending,
            paymentMethod: payment_type,
          },
        });

        const notification = await tx.notification.create({
          data: {
            type: 'transaction',
            status: 'pending',
            message: 'Payment received. Awaiting processing.',
            user: {
              connect: {
                id: payment.userId,
              },
            },
          },
        });

        return { payment, notification };
      },
    );

    await this.notificationsGateway.notifyNewNotification({
      notification,
      userId: payment.userId,
    });

    return payment;
  }

  async deletePayment(where: Prisma.PaymentWhereUniqueInput): Promise<Payment> {
    return this.prisma.payment.delete({
      where,
    });
  }
}
