import { Injectable } from '@nestjs/common';
import { CreateSchoolAdminDto } from './dto/create-school-admin.dto';
import { PrismaService } from 'nestjs-prisma';
import { Prisma, SchoolAdmin } from '@prisma/client';

@Injectable()
export class SchoolAdminsService {
  constructor(private prisma: PrismaService) {}

  async getSchoolAdmin(
    schoolAdminWhereUniqueInput: Prisma.SchoolAdminWhereUniqueInput,
  ): Promise<SchoolAdmin | null> {
    return this.prisma.schoolAdmin.findUnique({
      where: schoolAdminWhereUniqueInput,
    });
  }

  async getSchoolAdmins(params: {
    where?: Prisma.SchoolAdminWhereInput;
  }): Promise<SchoolAdmin[]> {
    const { where } = params;
    return this.prisma.schoolAdmin.findMany({
      where,
    });
  }

  async createSchoolAdmin(data: CreateSchoolAdminDto): Promise<SchoolAdmin> {
    return this.prisma.schoolAdmin.create({
      data,
    });
  }

  async updateSchoolAdmin(params: {
    where: Prisma.SchoolAdminWhereUniqueInput;
    data: Prisma.SchoolAdminUpdateInput;
  }): Promise<SchoolAdmin> {
    const { where, data } = params;
    return this.prisma.schoolAdmin.update({
      data,
      where,
    });
  }

  async deleteSchoolAdmin(
    where: Prisma.SchoolAdminWhereUniqueInput,
  ): Promise<SchoolAdmin> {
    return this.prisma.schoolAdmin.delete({
      where,
    });
  }
}
