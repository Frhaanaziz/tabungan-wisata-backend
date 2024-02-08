import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import axios from 'axios';

@Injectable()
export class MidtransService {
  private getMidtransApp() {
    const authString = btoa(`${process.env.MIDTRANS_SERVER_KEY}:`);

    return axios.create({
      baseURL: process.env.MIDTRANS_APP_URL,
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  async createTransaction(payload: CreateTransactionDto) {
    const { baseUrl, paymentId, ...restPayload } = payload;

    const input = {
      ...restPayload,
      credit_card: {
        secure: true,
        save_card: true,
      },
      callbacks: {
        finish: `${baseUrl}/payments/success`,
        error: `${baseUrl}/payments/failed`,
        pending: `${baseUrl}/payments/pending`,
      },
    };

    const res = await this.getMidtransApp().post(
      `/snap/v1/transactions`,
      input,
    );
    if (res.status !== 201)
      throw new InternalServerErrorException('Failed to create transaction');

    return { paymentId, ...res.data };
  }
}
