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
    take,
    model,
    where,
    include,
    orderBy,
  }: {
    page: number;
    take: number;
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

  generateJwtToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
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
