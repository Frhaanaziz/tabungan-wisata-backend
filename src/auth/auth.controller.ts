import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { Public } from './public.decorator';
import { SignInGoogleDto } from './dto/SignInGoogle.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('/signup')
  signUp(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Query('baseUrl') baseUrl: string | undefined,
  ) {
    if (!baseUrl)
      throw new BadRequestException('baseUrl (queryParam) is required');
    return this.authService.signUp({ ...authCredentialsDto, baseUrl });
  }

  @Post('/signin-google')
  loginGoogle(@Body() loginGooleDto: SignInGoogleDto) {
    return this.authService.signInGoogle(loginGooleDto);
  }
}
