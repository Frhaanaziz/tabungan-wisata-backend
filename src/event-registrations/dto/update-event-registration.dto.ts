import { PartialType } from '@nestjs/mapped-types';
import { CreateEventRegistrationDto } from './create-event-registration.dto';

export class UpdateEventRegistrationDto extends PartialType(CreateEventRegistrationDto) {}
