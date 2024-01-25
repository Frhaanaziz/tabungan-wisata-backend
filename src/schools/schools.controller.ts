import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { Event, School } from '@prisma/client';
import { CreateSchoolDto } from './dto/create-school.dto';
import { Admin } from 'src/auth/admin.decorator';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { EventsService } from 'src/events/events.service';

@Controller('schools')
export class SchoolsController {
  constructor(
    private readonly schoolsService: SchoolsService,
    private readonly eventsService: EventsService,
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

  @Get(':id/events')
  getSchoolEvents(@Param('id') id: string): Promise<Event[]> {
    return this.eventsService.getEvents({
      where: {
        schoolId: id,
      },
    });
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
