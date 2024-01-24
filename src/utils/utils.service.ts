import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

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
  }: {
    page: number;
    take: number;
    model: Prisma.ModelName;
    where?: object;
    include?: object;
  }) {
    const totalRow = await this.prisma[model].count();

    const savePage = page < 1 ? 1 : page;
    const rowsPerPage = take;
    const totalPages = Math.ceil(totalRow / rowsPerPage);
    let rows = [];

    try {
      if (where) {
        rows = await this.prisma[model].findMany({
          skip: (savePage - 1) * rowsPerPage,
          take: rowsPerPage,
          where,
          include,
        });
      } else {
        rows = await this.prisma[model].findMany({
          skip: (savePage - 1) * rowsPerPage,
          take: rowsPerPage,
          include,
        });
      }
    } catch (error) {
      console.error(`Error fetching rows from model ${model}: `, error);
      // Return an empty array if there's an error
      rows = [];
    }

    return {
      currentPage: page,
      totalRow,
      rowsPerPage,
      totalPages,
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

    // Split the full name string into an array of words
    const words = fullName.split(' ');

    // Take the first element of the array as the first name
    const firstName = words[0];

    return firstName ?? '';
  }

  getLastName(fullName: string) {
    if (!fullName) return undefined;

    // Split the full name string into an array of words
    const words = fullName.split(' ');

    // Take the last element of the array as the last name
    const lastName = words[words.length - 1];

    return lastName;
  }
}
