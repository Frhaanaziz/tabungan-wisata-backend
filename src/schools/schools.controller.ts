import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { School } from '@prisma/client';
import { CreateSchoolDto } from './dto/create-school.dto';
import { Admin } from 'src/auth/admin.decorator';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { GetPaginatedDataDto } from 'src/utils/dto/get-paginated-data.dto';
import { EventRegistrationsService } from 'src/event-registrations/event-registrations.service';

@Controller('schools')
export class SchoolsController {
  constructor(
    private readonly schoolsService: SchoolsService,
    private readonly eventRegistrations: EventRegistrationsService,
  ) {}

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
    { page, take = '10', search = '' }: GetPaginatedDataDto,
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
  async getSchoolById(@Param('id') id: string): Promise<School> {
    const school = await this.schoolsService.getSchoolJoined({
      id,
    });
    if (!school) throw new NotFoundException('School not found');

    return school;
  }

  @Get(':id/eventRegistrations')
  async getSchoolEventRegistrations(@Param('id') id: string) {
    return this.eventRegistrations.getEventRegistrations({
      where: { schoolId: id },
      include: { event: true },
    });
  }
}
