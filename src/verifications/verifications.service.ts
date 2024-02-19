import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Verification, VerificationType } from '@prisma/client';
import { CreateEmailResponse, ResendService } from 'nestjs-resend';
import { PrismaService } from 'nestjs-prisma';
import { ONEDAY_IN_MILLISECONDS } from 'src/utils/utils';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class VerificationsService {
  constructor(
    private prisma: PrismaService,
    private utilsService: UtilsService,
    private resendService: ResendService,
  ) {}

  async getVerification(
    paymentWhereUniqueInput: Prisma.VerificationWhereUniqueInput,
  ): Promise<Verification | null> {
    return this.prisma.verification.findUnique({
      where: paymentWhereUniqueInput,
    });
  }

  async getVerifications(params: {
    where?: Prisma.VerificationWhereInput;
  }): Promise<Verification[]> {
    const { where } = params;
    return this.prisma.verification.findMany({
      where,
    });
  }

  async createVerification(
    data: Prisma.VerificationCreateInput,
  ): Promise<Verification> {
    return this.prisma.verification.create({
      data,
    });
  }

  async updateVerification(params: {
    where: Prisma.VerificationWhereUniqueInput;
    data: Prisma.VerificationUpdateInput;
  }): Promise<Verification> {
    const { where, data } = params;
    return this.prisma.verification.update({
      data,
      where,
    });
  }

  async verifyEmailForResetPassword({ userId, email, baseUrl }) {
    const emailTemplate = ({ token }: { token: string }) =>
      this.resendService.send({
        from: 'Tabungan Wisata <tabungan-wisata@aththariq.com>',
        to: [email],
        subject: 'Email Verification For Reset Password',
        html: `<div><h1>Confirm Email</h1><a
      href="${baseUrl}/auth/reset-password/${token}"
      >Click here to verify your email address</a></div>`,
      });

    return this.createOrUpdateVerification({
      userId,
      userEmail: email,
      type: VerificationType.emailResetPassword,
      emailTemplate,
    });
  }

  async verifyNewEmail({ userId, email, baseUrl }) {
    const emailTemplate = ({ token }: { token: string }) =>
      this.resendService.send({
        from: 'Tabungan Wisata <tabungan-wisata@aththariq.com>',
        to: [email],
        subject: 'Email Verification',
        html: `<div><h1>Confirm Email</h1><a
      href="${baseUrl}/api/auth/verify-new-email?token=${token}&id=${userId}"
      >Click here to verify your email address</a></div>`,
      });

    return this.createOrUpdateVerification({
      userId,
      userEmail: email,
      type: VerificationType.emailNew,
      emailTemplate,
    });
  }

  async verifyUpdatedEmail({ userId, email, baseUrl }) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user) throw new BadRequestException('Email already exists');

    const emailTemplate = ({ token }: { token: string }) =>
      this.resendService.send({
        from: 'Tabungan Wisata <tabungan-wisata@aththariq.com>',
        to: [email],
        subject: 'Email Verification',
        html: `<div><h1>Confirm Email</h1><a
      href="${baseUrl}/api/auth/verify-updated-email?token=${token}&id=${userId}"
      >Click here to verify your new email address</a></div>`,
      });

    return this.createOrUpdateVerification({
      userId,
      userEmail: email,
      type: VerificationType.emailUpdate,
      emailTemplate,
    });
  }

  private async createOrUpdateVerification({
    userId,
    type,
    emailTemplate,
    userEmail,
  }: {
    userId: string;
    type: VerificationType;
    userEmail: string;
    emailTemplate: ({
      token,
    }: {
      token: string;
    }) => Promise<CreateEmailResponse>;
  }) {
    const emailTokenPayload = { user: { id: userId, email: userEmail } };
    const emailToken = this.utilsService.generateJwtToken(emailTokenPayload);

    const verification = await this.getVerification({
      userId_type: {
        userId,
        type,
      },
    });

    if (!verification) {
      emailTemplate({ token: emailToken });

      await this.createVerification({
        token: emailToken,
        type,
        active: false,
        expiresAt: new Date(Date.now() + ONEDAY_IN_MILLISECONDS),
        user: {
          connect: {
            id: userId,
          },
        },
      });
    } else {
      // if verification exists and is not active, and not expired, throw error
      if (
        new Date(verification.expiresAt) > new Date(Date.now()) &&
        !verification.active
      )
        throw new BadRequestException('Email already sent');

      emailTemplate({ token: emailToken });

      await this.updateVerification({
        where: {
          id: verification.id,
        },
        data: {
          token: emailToken,
          active: false,
          expiresAt: new Date(Date.now() + ONEDAY_IN_MILLISECONDS),
        },
      });
    }
  }
}
