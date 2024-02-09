import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class UtilsService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async getPaginatedResult({
    page,
    take = 10,
    model,
    where,
    include,
    orderBy,
  }: {
    page: number;
    take?: number;
    model: Prisma.ModelName;
    orderBy: object;
    where?: object;
    include?: object;
  }) {
    const totalRow = await this.prisma[model].count({
      where,
    });

    const savePage = page < 1 ? 1 : page;
    const rowsPerPage = take;
    const totalPages = Math.ceil(totalRow / rowsPerPage) || 1;
    const isFirstPage = savePage === 1;
    const isLastPage = savePage >= totalPages;
    const previousPage = isFirstPage ? 1 : savePage - 1;
    const nextPage = isLastPage ? totalPages : savePage + 1;

    let rows = [];

    try {
      if (where) {
        rows = await this.prisma[model].findMany({
          skip: (savePage - 1) * rowsPerPage,
          take: rowsPerPage,
          where,
          include,
          orderBy,
        });
      } else {
        rows = await this.prisma[model].findMany({
          skip: (savePage - 1) * rowsPerPage,
          take: rowsPerPage,
          include,
          orderBy,
        });
      }
    } catch (error) {
      console.error(`Error fetching rows from model ${model}: `, error);
      // Return an empty array if there's an error
      rows = [];
    }

    return {
      currentPage: page,
      isFirstPage,
      isLastPage,
      previousPage,
      nextPage,
      rowsPerPage,
      totalPages,
      totalRow,
      content: rows,
    };
  }

  async getNewItemsLastDays({
    days,
    model,
    where,
  }: {
    days: number;
    model: Prisma.ModelName;
    where?: object;
  }) {
    // Get the date of a few days ago based on the input days
    const startDate = new Date(new Date().setDate(new Date().getDate() - days));

    // Count the number of items within the date range
    const itemsInRange = await this.prisma[model].count({
      where: {
        createdAt: {
          gte: startDate,
        },
        ...where,
      },
    });

    return itemsInRange || 0;
  }

  async getGrowthPercentageFromLastMonth({
    model,
    where,
  }: {
    model: Prisma.ModelName;
    where?: object;
  }) {
    const currentMonth = new Date().getMonth(); // get current month
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1; // get last month

    const currentCount = await this.prisma[model].count(); // get current count
    const lastMonthCount = await this.prisma[model].count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), lastMonth, 1),
          lt: new Date(new Date().getFullYear(), lastMonth + 1, 1),
        },
        ...where,
      },
    }); // get last month count

    let growth = 0;
    if (lastMonthCount !== 0)
      growth = ((currentCount - lastMonthCount) / lastMonthCount) * 100;

    return growth || 0;
  }

  verifyJwtToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid token, please request a new one',
      );
    }
  }

  generateJwtToken(payload: { user: { id: string; role?: string } }) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
  }

  refreshToken(token: string) {
    const decoded = this.verifyJwtToken(token);
    const user = decoded.user;
    if (!user || !user.id) throw new UnauthorizedException('Invalid token');

    return this.generateJwtToken({ user });
  }

  async hashPassword(password: string) {
    const ROUNDS = 12;
    return await bcrypt.hash(password, ROUNDS);
  }

  async comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  generateRandomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  getFirstName(fullName: string) {
    if (!fullName) return '';

    const words = fullName.split(' ');

    const firstName = words[0];

    return firstName ?? '';
  }

  getLastName(fullName: string) {
    if (!fullName) return undefined;

    const words = fullName.split(' ');

    const lastName = words[words.length - 1];

    return lastName;
  }
}
