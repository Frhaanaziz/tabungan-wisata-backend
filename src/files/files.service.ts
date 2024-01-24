import { Injectable } from '@nestjs/common';
import { File, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private utilsService: UtilsService,
  ) {}

  async getFile(
    fileWhereUniqueInput: Prisma.FileWhereUniqueInput,
  ): Promise<File | null> {
    return this.prisma.file.findUnique({
      where: fileWhereUniqueInput,
    });
  }

  async getFiles(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.FileWhereUniqueInput;
    where?: Prisma.FileWhereInput;
    orderBy?: Prisma.FileOrderByWithRelationInput;
  }): Promise<File[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.file.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createFile(data: Prisma.FileCreateInput): Promise<File> {
    return this.prisma.file.create({
      data,
    });
  }

  async updateFile(params: {
    where: Prisma.FileWhereUniqueInput;
    data: Prisma.FileUpdateInput;
  }): Promise<File> {
    const { where, data } = params;
    return this.prisma.file.update({
      data,
      where,
    });
  }

  async deleteFile(where: Prisma.FileWhereUniqueInput): Promise<File> {
    return this.prisma.file.delete({
      where,
    });
  }
}
