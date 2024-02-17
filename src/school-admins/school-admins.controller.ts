import { Controller, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { SchoolAdminsService } from './school-admins.service';
import { CreateSchoolAdminDto } from './dto/create-school-admin.dto';
import { Admin } from 'src/auth/admin.decorator';
import { UpdateSchoolAdminDto } from './dto/update-school-admin.dto';

@Controller('school-admins')
export class SchoolAdminsController {
  constructor(private readonly schoolAdminsService: SchoolAdminsService) {}

  @Admin()
  @Post()
  create(@Body() createSchoolAdminDto: CreateSchoolAdminDto) {
    return this.schoolAdminsService.createSchoolAdmin(createSchoolAdminDto);
  }

  @Admin()
  @Put(':id')
  update(
    @Body() updateSchoolAdminDto: UpdateSchoolAdminDto,
    @Param('id') id: string,
  ) {
    return this.schoolAdminsService.updateSchoolAdmin({
      data: updateSchoolAdminDto,
      where: { id },
    });
  }

  @Admin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schoolAdminsService.deleteSchoolAdmin({ id });
  }
}
