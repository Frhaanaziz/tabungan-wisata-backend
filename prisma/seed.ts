import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

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
  console.log('Creating schools...');
  const schoolIds = [];
  for (let i = 0; i < faker.number.int({ min: 50, max: 100 }); i++) {
    const createdAt = faker.date.past();
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

    const school = await prisma.school.create({
      data: {
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        createdAt,
        updatedAt,
        code: generateRandomCode(),
        contact: faker.phone.number(),
      },
    });
    schoolIds.push(school.id);
  }

  console.log('Creating events...');
  for (let i = 0; i < 100; i++) {
    function generateRandomEventInclude() {
      const word = faker.lorem.words({ min: 3, max: 6 });
      const list = Array.from({ length: faker.number.int({ min: 3, max: 7 }) })
        .map(() => `<li>${word}</li>`)
        .join('');
      return `<ul>${list}</ul>`;
    }

    const startDate = new Date();
    const endDate = faker.date.between({
      from: startDate,
      to: faker.date.future(),
    });
    await prisma.event.create({
      data: {
        name: faker.company.name(),
        include: generateRandomEventInclude(),
        exclude: generateRandomEventInclude(),
        schoolId: faker.helpers.arrayElement(schoolIds),
        cost: faker.number.int({ min: 1000000, max: 5000000 }),
        startDate,
        endDate,
        highlight: generateRandomEventInclude(),
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
                height: 720,
              }),
              size: faker.number.int({ min: 1_000_000, max: 5_000_000 }),
              uploadedAt: faker.date.past(),
            })),
          },
        },
      },
    });
  }

  console.log('Creating users...');
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
      allowSpecialCharacters: true,
      provider: 'gmail',
    });

    await prisma.user.create({
      data: {
        email,
        name: fullName,
        image: faker.image.avatar(),
        payments: {
          createMany: {
            data: Array.from({
              length: faker.number.int({ min: 10, max: 30 }),
            }).map(() => ({
              amount: faker.number.int({ min: 10000, max: 2000000 }),
              date: faker.date.past(),
              paymentMethod: faker.helpers.arrayElement(paymentMethods),
              status: faker.helpers.arrayElement(paymentStatus),
            })),
          },
        },
        createdAt,
        updatedAt,
        schoolId: faker.helpers.arrayElement(schoolIds),
      },
    });
  }
}
main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
