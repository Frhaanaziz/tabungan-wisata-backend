import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const eventDescription: string = `<ul><li><p><strong>DAY 1 ARRIVAL JOGJA (YIA) – BOROBUDUR – MALIOBORO (L)</strong></p><ul><li><p>Tiba di Airport Yogya International Airport, dijemput oleh perwakilan Mitra</p></li><li><p>Makan siang dilokal restaurant</p></li><li><p>Mengunjungi salah satu dari 8 keajaiban dunia, Candi Borobudur</p></li><li><p>Mengunjungi Malioboro untuk belanja aneka produk kerajinan khas Jogja di sepanjang jalan Malioboro</p></li><li><p><em>Check-in&nbsp;</em>Hotel untuk istirahat malam (free program)</p></li></ul><p><strong>DAY 2 Gua Pindul – Hutan Pinus Pengger – Heha Sky View &nbsp;(B,L)</strong></p><ul><li><p>Sarapan pagi di Hotel</p></li><li><p>Mengadakan Gua Pindul Tour, menuju wilayah gunung kapur Wonosari menyusuri Bukit Patuk menikmati keindahan kota Jogja dari ketinggian, menikmati sensasi menyusuri sungai di dalam gua dengan menggunakan ban besar dilengkapi dengan jas pelampung yang aman untuk segala usia, melihat keindahalan dalam gua yang menyajikan stalaktit hasil proses ribuan tahun dan masih tetap berlangsung sampai sekarang.</p></li><li><p>Makan siang dilokal restaurant dengan menu khas daerah Gunung Kidul</p></li><li><p>Menuju Hutan Pinus Pengger</p></li><li><p>Mengunjungi Heha Skyview untuk menikmati temaram senja, keseruan spot selfi dengan latar belakang panorama kota Jogja (Tidak termasuk spot foto)</p></li><li><p>kembali ke hotel, check in dan istirahat malam</p></li></ul><p><strong>DAY 3 FREE PROGRAM – <em>TRANSFER AIRPORT&nbsp;</em>(B)</strong></p><ul><li><p>Makan pagi dihotel</p></li><li><p>menunggu waktu sampai ditransfer ke Airport</p></li></ul></li></ul>`;

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

function generateRandomEventInclude() {
  const word = faker.lorem.words({ min: 3, max: 6 });
  const list = Array.from({ length: faker.number.int({ min: 3, max: 7 }) })
    .map(() => `<li>${word}</li>`)
    .join('');
  return `<ul>${list}</ul>`;
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
    const startDate = new Date();
    const endDate = faker.date.between({
      from: startDate,
      to: faker.date.future(),
    });
    await prisma.event.create({
      data: {
        name: faker.company.name(),
        include: generateRandomEventInclude(),
        description: eventDescription,
        schoolId: faker.helpers.arrayElement(schoolIds),
        cost: faker.number.int({ min: 1000000, max: 5000000 }),
        startDate,
        endDate,
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
