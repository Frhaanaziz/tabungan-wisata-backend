import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { School } from '@prisma/client';
import { CreateSchoolDto } from './dto/create-school.dto';
import { Admin } from 'src/auth/admin.decorator';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Admin()
  @Post()
  createSchool(@Body() createSchoolDto: CreateSchoolDto): Promise<School> {
    return this.schoolsService.createSchool({
      ...createSchoolDto,
    });
  }

  @Admin()
  @Get()
  getAllSchool(
    @Query()
    {
      page,
      take = '10',
      search = '',
    }: {
      page?: string;
      take?: string;
      search?: string;
    },
  ) {
    if (page) {
      return this.schoolsService.getSchoolsPaginated({
        page: parseInt(page),
        take: parseInt(take),
        search,
      });
    }

    return this.schoolsService.getSchools({});
  }

  @Admin()
  @Put(':id')
  updateSchool(
    @Param('id') id: string,
    @Body() updateSchoolDto: UpdateSchoolDto,
  ): Promise<School> {
    return this.schoolsService.updateSchool({
      where: { id },
      data: updateSchoolDto,
    });
  }

  @Get(':id')
  getSchoolById(@Param('id') id: string): Promise<School> {
    return this.schoolsService.getSchool({
      id,
    });
  }
}
