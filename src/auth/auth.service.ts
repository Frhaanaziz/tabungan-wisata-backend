import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { SchoolsService } from 'src/schools/schools.service';
import { UtilsService } from 'src/utils/utils.service';
import { VerificationsService } from 'src/verifications/verifications.service';
import { SignInGoogleDto } from './dto/SignInGoogle.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private schoolsServer: SchoolsService,
    private verificationsService: VerificationsService,
    private utilsService: UtilsService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.usersService.getUser({
      where: {
        email,
      },
    });

    if (user && !user.password)
      throw new NotFoundException(
        'Please create a password from forgot password',
      );

    if (!user || !user?.password)
      throw new UnauthorizedException('Incorrect email or password');

    if (!user.emailVerified)
      throw new UnauthorizedException('Please confirm your email to login');

    const passwordMatch = await this.utilsService.comparePassword(
      password,
      user.password,
    );

    if (!passwordMatch)
      throw new UnauthorizedException('Incorrect email or password');

    const accessTokenPayload = { user: { id: user.id, role: user.role } };
    const accessToken = this.utilsService.generateJwtToken(accessTokenPayload);

    return { accessToken, user };
  }

  async signUp(authCredentialsDto: AuthCredentialsDto & { baseUrl: string }) {
    const { name, email, password, schoolCode, baseUrl } = authCredentialsDto;

    const exist = await this.usersService.getUser({
      where: { email },
    });

    if (exist && exist.emailVerified)
      throw new UnauthorizedException('Email already registered, please login');

    if (!exist) {
      const hashedPassword = await this.utilsService.hashPassword(password);

      const school = await this.schoolsServer.getSchool({
        code: schoolCode,
      });
      if (!school) throw new NotFoundException('Invalid school code');

      const user = await this.usersService.createUser({
        name,
        email,
        password: hashedPassword,
        school: { connect: { id: school.id } },
      });

      await this.verificationsService.verifyEmail({
        userId: user.id,
        email,
        baseUrl,
      });
    } else if (!exist.emailVerified) {
      await this.verificationsService.verifyEmail({
        userId: exist.id,
        email,
        baseUrl,
      });
    }
  }

  async signInGoogle(loginGoogleDto: SignInGoogleDto) {
    const { accounts, ...data } = loginGoogleDto;
    try {
      const user = await this.usersService.getUser({
        where: {
          email: data.email,
        },
      });

      if (!user) {
        const user = await this.usersService.createUser({
          ...data,
          accounts: {
            create: accounts,
          },
        });

        const accessTokenPayload = { user: { id: user.id, role: user.role } };
        const accessToken =
          this.utilsService.generateJwtToken(accessTokenPayload);

        return { accessToken, user };
      } else {
        const accessTokenPayload = { user: { id: user.id, role: user.role } };
        const accessToken =
          this.utilsService.generateJwtToken(accessTokenPayload);
        return { accessToken, user };
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to login with google');
    }
  }
}
