import { Payment, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import axios from 'axios';

const paymentMethods = [
  'credit_card',
  'echannel',
  'bank_transfer',
  'gopay',
  'qris',
  'cstore',
  'bca_klikpay',
  'bca_klikbca',
  'bri_epay',
];

const paymentStatus = ['pending', 'completed', 'failed'] as const;

function generateRandomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

const prisma = new PrismaClient();
async function main() {
  console.info('Fetching schools...');
  const { data } = await axios.get(
    'https://api-sekolah-indonesia.vercel.app/sekolah?perPage=200&kab_kota=026000',
  );
  const schools = data.dataSekolah;

  console.info('Creating schools...');
  const schoolIds = [];
  await schools.map(async (school) => {
    const { kabupaten_kota, kecamatan, sekolah, bentuk, alamat_jalan } = school;
    if (bentuk === 'SD') return undefined;

    const createdAt = faker.date.past();
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

    const newSchool = await prisma.school.create({
      data: {
        name: sekolah,
        address: `${alamat_jalan}, ${kecamatan}, ${kabupaten_kota}`,
        createdAt,
        updatedAt,
        code: generateRandomCode(),
        contact: faker.phone.number(),
        schoolAdmins: {
          createMany: {
            data: Array.from({
              length: faker.number.int({ min: 2, max: 3 }),
            }).map(() => {
              const sex = faker.person.sexType();
              const firstName = faker.person.firstName(sex);
              const lastName = faker.person.lastName(sex);
              const fullName = faker.person.fullName({
                firstName,
                lastName,
                sex,
              });

              return {
                name: fullName,
                contact: faker.phone.number(),
              };
            }),
          },
        },
      },
    });

    schoolIds.push(newSchool.id);
  });

  console.info('Creating events...');
  const eventIds = [];
  for (let i = 0; i < 100; i++) {
    function generateRandomEventInclude() {
      const word = faker.lorem.words({ min: 5, max: 10 });
      const list = Array.from({ length: faker.number.int({ min: 3, max: 7 }) })
        .map(() => `<li>${word}</li>`)
        .join('');
      return `<ul>${list}</ul>`;
    }

    const event = await prisma.event.create({
      data: {
        name: faker.company.name(),
        include: generateRandomEventInclude(),
        exclude: generateRandomEventInclude(),
        cost: faker.number.int({ min: 1000000, max: 5000000 }),
        highlight: faker.lorem.paragraphs(),
        duration: faker.number.int({ min: 2, max: 7 }),
        itineraries: {
          createMany: {
            data: Array.from({
              length: faker.number.int({ min: 3, max: 5 }),
            }).map(() => ({
              name: faker.location.city(),
              description: faker.lorem.paragraphs(),
            })),
          },
        },
        images: {
          createMany: {
            data: Array.from({
              length: faker.number.int({ min: 4, max: 7 }),
            }).map(() => ({
              url: faker.image.urlLoremFlickr({
                category: 'city',
                width: 1280,
                height: 960,
              }),
              size: faker.number.int({ min: 1_000_000, max: 5_000_000 }),
              uploadedAt: faker.date.past(),
            })),
          },
        },
      },
    });
    eventIds.push(event.id);
  }

  console.info('Creating event registrations...');
  schoolIds.forEach(async (schoolId) => {
    const startDate = new Date();
    const endDate = faker.date.between({
      from: startDate,
      to: faker.date.future(),
    });
    await prisma.eventRegistration.createMany({
      data: Array.from({ length: faker.number.int({ min: 1, max: 2 }) }).map(
        () => ({
          cost: faker.number.int({ min: 1_000_000, max: 3000000 }),
          startDate,
          endDate,
          schoolId,
          eventId: faker.helpers.arrayElement(eventIds),
        }),
      ),
    });
  });

  console.info('Creating users...');
  for (let i = 0; i < faker.number.int({ min: 100, max: 200 }); i++) {
    const createdAt = faker.date.past();
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
    const sex = faker.person.sexType();
    const firstName = faker.person.firstName(sex);
    const lastName = faker.person.lastName(sex);
    const fullName = faker.person.fullName({
      firstName,
      lastName,
      sex,
    });
    const email = faker.internet.email({
      firstName,
      lastName,
      allowSpecialCharacters: false,
      provider: 'gmail.com',
    });
    const paymentsCount = faker.number.int({ min: 10, max: 30 });

    let balance: number = 0;
    const user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        image: faker.image.avatar(),
        password:
          '$2a$13$4.dMmMkp3jbb6nZizXBnluD3pKwZAFNa9L2lMyOccmIu5K.MWtKgO',
        emailVerified: true,
        createdAt,
        updatedAt,
        schoolId: faker.helpers.arrayElement(schoolIds),
      },
    });

    const payments: Payment[] = [];

    // Create payments
    for (let i = 0; i < paymentsCount; i++) {
      const amount = faker.number.int({ min: 10000, max: 500000 });
      const status = faker.helpers.arrayElement(paymentStatus);
      if (status === 'completed') balance += amount;

      const payment = await prisma.payment.create({
        data: {
          amount,
          userId: user.id,
          paymentMethod: faker.helpers.arrayElement(paymentMethods),
          status,
          createdAt: faker.date.past(),
          updatedAt: faker.date.between({
            from: createdAt,
            to: new Date(),
          }),
        },
      });

      payments.push(payment);
    }

    // Update user balance
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        balance,
      },
    });

    await prisma.notification.createMany({
      data: payments.map(({ status, updatedAt, createdAt, id }) => {
        const message =
          status === 'completed'
            ? 'Transaction completed successfully.'
            : status === 'failed'
              ? 'Transfer incomplete. Please retry transfer.'
              : 'Payment received. Awaiting processing.';

        return {
          message,
          type: 'transaction',
          status,
          isRead: false,
          paymentId: id,
          userId: user.id,
          createdAt,
          updatedAt,
        };
      }),
    });
  }
}
main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
