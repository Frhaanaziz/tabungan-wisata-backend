import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { FilesService } from './files.service';
import { Admin } from 'src/auth/admin.decorator';
import { CreateFileDto } from './dto/create-file.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Admin()
  @Post()
  async online(@Body() createFileDto: CreateFileDto) {
    return this.filesService.createFile(createFileDto);
  }

  @Admin()
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.filesService.deleteFile({ id });
  }
}
