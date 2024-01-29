import { Controller, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { Admin } from 'src/auth/admin.decorator';

@Controller('itineraries')
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Admin()
  @Post()
  create(@Body() { description, eventId, name }: CreateItineraryDto) {
    return this.itinerariesService.createItinerary({
      event: {
        connect: {
          id: eventId,
        },
      },
      name,
      description,
    });
  }

  @Admin()
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateItineraryDto: UpdateItineraryDto,
  ) {
    return this.itinerariesService.updateItinerary({
      data: updateItineraryDto,
      where: { id },
    });
  }

  @Admin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itinerariesService.deleteItinerary({ id });
  }
}
