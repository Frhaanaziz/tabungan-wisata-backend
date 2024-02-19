import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserEmailVerifiedDto } from './dto/update-user-emailVerified.dto';
import { UtilsService } from 'src/utils/utils.service';
import { Public } from 'src/auth/public.decorator';
import { Admin } from 'src/auth/admin.decorator';
import { UpdateUserSchoolDto } from './dto/update-user-school.dto';
import { PaymentsService } from 'src/payments/payments.service';
import { GetPaginatedDataDto } from 'src/utils/dto/get-paginated-data.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PaymentStatus } from '@prisma/client';
import { UpdateUserImageDto } from './dto/update-user-image.dto';
import { VerificationsService } from 'src/verifications/verifications.service';
import { UpdateUserEmailDto } from './dto/update-user-email.dto';
import { UpdateUserNameDto } from './dto/update-user-name.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { CreateUserPasswordDto } from './dto/create-user-password.dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private utilsService: UtilsService,
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
    private verficationsService: VerificationsService,
  ) {}

  @Admin()
  @Get()
  getAllUser(
    @Query()
    { page, take = '10', search = '' }: GetPaginatedDataDto,
  ) {
    if (page) {
      return this.usersService.getUsersPaginated({
        page: parseInt(page),
        take: parseInt(take),
        search,
      });
    }

    return this.usersService.getUsers({});
  }

  @Public()
  @Post('/reset-password')
  async resetPassword(
    @Body() { newPassword }: ResetPasswordDto,
    @Query('token') token: string | undefined,
  ) {
    if (!token) throw new UnauthorizedException('Unauthorized');

    const payload = this.utilsService.verifyJwtToken(token);
    if (!payload)
      throw new UnauthorizedException(
        'Invalid token, please request a new one',
      );

    return this.usersService.resetPassword({
      userId: payload.user.id,
      newPassword,
    });
  }

  @Admin()
  @Get('/growth-percentage')
  getPercentageFromLastMonth() {
    return this.utilsService.getGrowthPercentageFromLastMonth({
      model: 'User',
    });
  }

  @Admin()
  @Get('/count-new-users')
  getNewUsers(
    @Query()
    { days = '30' }: { days?: string },
  ) {
    return this.utilsService.getNewItemsLastDays({
      days: parseInt(days),
      model: 'User',
    });
  }

  @Admin()
  @Get('/total-users')
  getTotalUsers() {
    return this.usersService.getUsersCount();
  }

  @Admin()
  @Get('/growth-count')
  getNewUsersCountLastDays(@Query() { days = '30' }: { days?: string }) {
    return this.utilsService.getNewItemsLastDays({
      model: 'User',
      days: parseInt(days),
    });
  }

  @Admin()
  @Get('/total-balance')
  getTotalUsersBalance(@Query('schoolId') schoolId: string | undefined) {
    return this.usersService.getTotalUsersBalance({ schoolId });
  }

  @Get(':id')
  async getUserById(
    @Param('id') id: string,
    @Query('payments') payments: boolean,
  ) {
    const user = await this.usersService.getUser({
      where: { id },
      include: { payments: Boolean(payments) },
    });
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  // @Put(':id')
  // async updateUserById(
  //   @Param('id') id: string,
  //   @Body() { email, ...rest }: UpdateUserDto,
  // ) {
  //   const updatedUser = await this.usersService.updateUser({
  //     where: { id },
  //     data: rest,
  //   });

  //   if (email && email !== updatedUser.email) {
  //     await this.verficationsService.verifyUpdatedEmail({
  //       baseUrl: process.env.STUDENT_URL,
  //       email,
  //       userId: id,
  //     });
  //   }

  //   return updatedUser;
  // }

  @Get(':id/balance')
  async getUserBalance(@Param('id') id: string) {
    const user = await this.usersService.getUser({
      where: { id },
      select: { balance: true },
    });
    if (!user) throw new NotFoundException('User not found');

    return user.balance;
  }

  @Get(':id/payments')
  getUserPayments(
    @Param('id') id: string,
    @Query()
    {
      page,
      take = '10',
      search = '',
      filter,
    }: GetPaginatedDataDto & { filter?: string },
  ) {
    if (page) {
      return this.paymentsService.getPaymentsPaginated({
        page: parseInt(page),
        take: parseInt(take),
        search,
        where: {
          userId: id,
        },
      });
    }

    if (filter && filter.includes('status:')) {
      const status = filter.split(':')[1];
      if (!(status in PaymentStatus))
        throw new NotFoundException('Invalid status');

      return this.paymentsService.getPayments({
        where: {
          userId: id,
          status: status as PaymentStatus,
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    return this.paymentsService.getPayments({
      where: {
        userId: id,
      },
    });
  }

  @Get(':id/notifications')
  getUserNotifications(
    @Param('id') id: string,
    @Query()
    { page, take = '10', search = '' }: GetPaginatedDataDto,
  ) {
    if (page) {
      return this.notificationsService.getNotificationsPaginated({
        page: parseInt(page),
        take: parseInt(take),
        search,
        where: {
          userId: id,
        },
      });
    }

    return this.notificationsService.getNotifications({
      where: {
        userId: id,
      },
    });
  }

  @Post(':id/password')
  async createPassword(
    @Param('id') id: string,
    @Body() { newPassword }: CreateUserPasswordDto,
  ) {
    return this.usersService.createPassword({
      userId: id,
      password: newPassword,
    });
  }

  @Patch(':id/school')
  updateUserSchoolByCode(
    @Param('id') id: string,
    @Body() { schoolCode }: UpdateUserSchoolDto,
  ) {
    return this.usersService.updateUserSchoolByCode({ schoolCode, userId: id });
  }

  @Patch(':id/emailVerified')
  updateUserEmailVerified(
    @Param('id') id: string,
    @Body() { emailVerified, token }: UpdateUserEmailVerifiedDto,
  ) {
    return this.usersService.updateEmailVerified({
      userId: id,
      emailVerified,
      token,
    });
  }

  @Patch(':id/email')
  updateUserEmail(
    @Param('id') id: string,
    @Body() { token }: UpdateUserEmailDto,
  ) {
    return this.usersService.updateEmail({
      token,
      userId: id,
    });
  }

  @Patch(':id/image')
  updateUserImage(
    @Param('id') id: string,
    @Body() updateUserImageDto: UpdateUserImageDto,
  ) {
    return this.usersService.updateUser({
      where: { id },
      data: { image: updateUserImageDto?.image ?? null },
    });
  }

  @Patch(':id/name')
  updateUserName(
    @Param('id') id: string,
    @Body() updateUserNameDto: UpdateUserNameDto,
  ) {
    return this.usersService.updateUser({
      where: { id },
      data: updateUserNameDto,
    });
  }

  @Patch(':id/password')
  updateUserPassword(
    @Param('id') id: string,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    return this.usersService.updatePassword({
      ...updateUserPasswordDto,
      userId: id,
    });
  }
}
