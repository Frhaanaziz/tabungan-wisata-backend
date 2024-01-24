import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { SchoolsService } from 'src/schools/schools.service';
import { UtilsModule } from 'src/utils/utils.module';
import { VerificationsModule } from 'src/verifications/verifications.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    VerificationsModule,
    UtilsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, SchoolsService],
})
export class AuthModule {}
