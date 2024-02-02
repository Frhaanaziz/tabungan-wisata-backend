// model EventRegistration {
//     id        String   @id @default(cuid())
//     cost      Int
//     eventId   String
//     schoolId  String
//     event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
//     school    School   @relation(fields: [schoolId], references: [id], onDelete: Cascade)
//     createdAt DateTime @default(now())

import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

//     @@index([eventId], name: "eventId")
//     @@index([schoolId], name: "schoolId")
//   }

export class CreateEventRegistrationDto {
  @IsInt()
  @Min(1)
  cost: number;

  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  schoolId: string;
}
