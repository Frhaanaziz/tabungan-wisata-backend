import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { PrismaModule, QueryInfo, loggingMiddleware } from 'nestjs-prisma';
import { ItinerariesModule } from './itineraries/itineraries.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { EventRegistrationsModule } from './event-registrations/event-registrations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SchoolAdminsModule } from './school-admins/school-admins.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: configValidationSchema,
    }),
    // ThrottlerModule.forRoot([
    //   {
    //     name: 'short',
    //     ttl: 1_000, // 1 minute
    //     limit: 3,
    //   },
    //   {
    //     name: 'long',
    //     ttl: 60_000, // 1 minute
    //     limit: 100,
    //   },
    // ]),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        explicitConnect: true,
        middlewares: [
          loggingMiddleware({
            logger: new Logger('Prisma Query'),
            logLevel: 'log', // default is `debug`
            logMessage: (query: QueryInfo) =>
              `${query.model}.${query.action} - ${query.executionTime}ms`,
          }),
        ],
        // prismaOptions: {
        //   log: ['info', 'warn', 'query'],
        // },
      },
    }),
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
    ItinerariesModule,
    WebhooksModule,
    WithdrawalsModule,
    EventRegistrationsModule,
    NotificationsModule,
    SchoolAdminsModule,
  ],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard },
    // { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  controllers: [AppController],
})
export class AppModule {}
