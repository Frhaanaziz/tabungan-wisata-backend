import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { VerificationsService } from './verifications.service';
import { Public } from 'src/auth/public.decorator';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UsersService } from 'src/users/users.service';
import { UtilsService } from 'src/utils/utils.service';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Controller('verifications')
export class VerificationsController {
  constructor(
    private readonly verificationsService: VerificationsService,
    private readonly utilsService: UtilsService,
    private readonly prisma: PrismaService,
  ) {}

  private async getUser(params: {
    where: Prisma.UserWhereUniqueInput;
  }): Promise<User | null> {
    const { where } = params;

    return this.prisma.user.findUnique({
      where,
    });
  }

  @Public()
  @Post('/verify-email')
  async verifyEmail(@Body() { baseUrl, email }: VerifyEmailDto) {
    const user = await this.getUser({ where: { email } });
    if (!user) throw new BadRequestException('Account does not exist');

    return this.verificationsService.verifyEmail({
      baseUrl,
      email,
      userId: user.id,
    });
  }

  @Public()
  @Post('/verify-email-reset-password')
  async verifyEmailForResetPassword(
    @Body() { baseUrl, email }: VerifyEmailDto,
  ) {
    const user = await this.getUser({ where: { email } });
    if (!user) throw new BadRequestException('Account does not exist');

    return this.verificationsService.verifyEmailForResetPassword({
      baseUrl,
      email,
      userId: user.id,
    });
  }

  @Public()
  @Post('/verify-token')
  async verifyToken(@Body() { token }: VerifyTokenDto) {
    return this.utilsService.verifyJwtToken(token);
  }

  @Post('/refresh-token')
  async refreshToken(@Body() { token }: VerifyTokenDto) {
    const newToken = this.utilsService.refreshToken(token);

    return { token: newToken };
  }
}
