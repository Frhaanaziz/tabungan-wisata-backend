import axios from 'axios';

export function getMidtransApp() {
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
