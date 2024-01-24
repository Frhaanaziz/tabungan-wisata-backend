import {
  Body,
  Controller,
  Get,
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
    @Body('newPassword') newPassword: string,
    @Query('token') token: string | undefined,
  ) {
    if (!token) throw new UnauthorizedException('Unauthorized');
    const { user } = await this.utilsService.verifyJwtToken(token);

    return this.usersService.resetPassword({
      userId: user.id,
      newPassword,
    });
  }

  @Patch(':id/school')
  updateUserSchoolByCode(
    @Param('id') id: string,
    @Body() { schoolCode }: UpdateUserSchoolDto,
  ) {
    return this.usersService.updateUserSchoolByCode({ schoolCode, userId: id });
  }

  @Get(':id')
  getUserById(@Param('id') id: string, @Query('payments') payments: boolean) {
    return this.usersService.getUser({
      where: { id },
      include: { payments: Boolean(payments) },
    });
  }

  @Get(':id/payments')
  getUserPaymentsById(
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
