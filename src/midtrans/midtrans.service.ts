import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getMidtransApp } from 'src/utils/axios';
import { CreateTransactionDto } from './dto/CreateTransaction.dto';

@Injectable()
export class MidtransService {
  async createTransaction(payload: CreateTransactionDto) {
    const { baseUrl, paymentId, ...restPayload } = payload;

    const input = {
      ...restPayload,
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: `${baseUrl}/payments/success`,
        error: `${baseUrl}/payments/failed`,
        pending: `${baseUrl}/payments/pending`,
      },
    };

    const res = await getMidtransApp().post(`/snap/v1/transactions`, input);
    if (res.status !== 201)
      throw new InternalServerErrorException('Failed to create transaction');

    return { paymentId, ...res.data };
  }
}
