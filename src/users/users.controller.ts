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

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private utilsService: UtilsService,
    private paymentsService: PaymentsService,
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
    const { user } = await this.utilsService.verifyJwtToken(token);

    return this.usersService.resetPassword({
      userId: user.id,
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
    return this.usersService.getNewUserLastDays({
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
    }: {
      page?: string;
      take?: string;
      search?: string;
    },
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

    return this.paymentsService.getPayments({
      where: {
        userId: id,
      },
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
}
