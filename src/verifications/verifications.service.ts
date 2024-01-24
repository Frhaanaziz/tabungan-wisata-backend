import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Verification } from '@prisma/client';
import { ResendService } from 'nestjs-resend';
import { PrismaService } from 'src/prisma/prisma.service';
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
    skip?: number;
    take?: number;
    cursor?: Prisma.VerificationWhereUniqueInput;
    where?: Prisma.VerificationWhereInput;
    orderBy?: Prisma.VerificationOrderByWithRelationInput;
  }): Promise<Verification[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.verification.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
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

  async deleteVerification(
    where: Prisma.VerificationWhereUniqueInput,
  ): Promise<Verification> {
    return this.prisma.verification.delete({
      where,
    });
  }

  private async sendVerificationEmail({
    email,
    baseUrl,
    userId,
    token,
  }: {
    email: string;
    baseUrl: string;
    userId: string;
    token: string;
  }) {
    return this.resendService.send({
      from: 'Tabungan Wisata <tabungan-wisata@aththariq.com>',
      to: [email],
      subject: 'Email Verification',
      html: `<div><h1>Confirm Email</h1><a
      href="${baseUrl}/api/auth/verify-email?token=${token}&id=${userId}"
      >Click here to verify your email address</a></div>`,
    });
  }

  async sendVerificationEmailForResetPassword({
    email,
    baseUrl,
    token,
  }: {
    email: string;
    baseUrl: string;
    token: string;
  }) {
    return this.resendService.send({
      from: 'Tabungan Wisata <tabungan-wisata@aththariq.com>',
      to: [email],
      subject: 'Email Verification For Reset Password',
      html: `<div><h1>Confirm Email</h1><a
      href="${baseUrl}/auth/reset-password/${token}"
      >Click here to verify your email address</a></div>`,
    });
  }

  async verifyEmailForResetPassword({ userId, email, baseUrl }) {
    const emailTokenPayload = { user: { id: userId } };
    const emailToken = this.utilsService.generateJwtToken(emailTokenPayload);

    const verifications = await this.getVerifications({
      where: {
        userId,
        type: 'email-reset-password',
      },
    });

    if (!verifications.length) {
      this.sendVerificationEmailForResetPassword({
        email,
        baseUrl,
        token: emailToken,
      });

      await this.createVerification({
        token: emailToken,
        type: 'email-reset-password',
        expiresAt: new Date(Date.now() + ONEDAY_IN_MILLISECONDS),
        user: {
          connect: {
            id: userId,
          },
        },
      });
    } else {
      const isExpired = verifications.find(
        (verification) =>
          new Date(verification.expiresAt) < new Date(Date.now()),
      );
      if (!isExpired) throw new BadRequestException('Email already sent');

      this.sendVerificationEmailForResetPassword({
        email,
        baseUrl,
        token: emailToken,
      });

      await this.updateVerification({
        where: {
          id: isExpired.id,
        },
        data: {
          token: emailToken,
          expiresAt: new Date(Date.now() + ONEDAY_IN_MILLISECONDS),
        },
      });
    }
  }

  async verifyEmail({ userId, email, baseUrl }) {
    const emailTokenPayload = { user: { id: userId } };
    const emailToken = this.utilsService.generateJwtToken(emailTokenPayload);

    const verifications = await this.getVerifications({
      where: {
        userId,
        type: 'email',
      },
    });

    if (!verifications.length) {
      this.sendVerificationEmail({ email, baseUrl, userId, token: emailToken });

      await this.createVerification({
        token: emailToken,
        type: 'email',
        expiresAt: new Date(Date.now() + ONEDAY_IN_MILLISECONDS),
        user: {
          connect: {
            id: userId,
          },
        },
      });
    } else {
      const isExpired = verifications.find(
        (verification) =>
          new Date(verification.expiresAt) < new Date(Date.now()),
      );
      if (!isExpired) throw new BadRequestException('Email already sent');

      this.sendVerificationEmail({ email, baseUrl, userId, token: emailToken });

      await this.updateVerification({
        where: {
          id: isExpired.id,
        },
        data: {
          token: emailToken,
          expiresAt: new Date(Date.now() + ONEDAY_IN_MILLISECONDS),
        },
      });
    }
  }
}
