import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SchoolsModule } from './schools/schools.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth-guard/auth.guard';
import { AuthGuardModule } from './auth/auth-guard/auth-guard.module';
import { EventsModule } from './events/events.module';
import { PaymentsModule } from './payments/payments.module';
import { UtilsModule } from './utils/utils.module';
import { VerificationsModule } from './verifications/verifications.module';
import { FilesModule } from './files/files.module';
import { MidtransModule } from './midtrans/midtrans.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: configValidationSchema,
    }),
    PrismaModule,
    SchoolsModule,
    UsersModule,
    AuthModule,
    AuthGuardModule,
    EventsModule,
    PaymentsModule,
    UtilsModule,
    VerificationsModule,
    FilesModule,
    MidtransModule,
  ],
  providers: [AppService, { provide: APP_GUARD, useClass: AuthGuard }],
  controllers: [AppController],
})
export class AppModule {}
