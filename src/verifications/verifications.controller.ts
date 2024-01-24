import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { VerificationsService } from './verifications.service';
import { Public } from 'src/auth/public.decorator';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UsersService } from 'src/users/users.service';
import { UtilsService } from 'src/utils/utils.service';

@Controller('verifications')
export class VerificationsController {
  constructor(
    private readonly verificationsService: VerificationsService,
    private readonly usersService: UsersService,
    private readonly utilsService: UtilsService,
  ) {}

  @Public()
  @Post('/verify-email')
  async verifyEmail(@Body() { baseUrl, email }: VerifyEmailDto) {
    const user = await this.usersService.getUser({ where: { email } });
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
    const user = await this.usersService.getUser({ where: { email } });
    if (!user) throw new BadRequestException('Account does not exist');

    return this.verificationsService.verifyEmailForResetPassword({
      baseUrl,
      email,
      userId: user.id,
    });
  }

  @Public()
  @Post('/verify-token')
  async verifyToken(@Body() { token }: { token: string }) {
    return this.utilsService.verifyJwtToken(token);
  }
}
