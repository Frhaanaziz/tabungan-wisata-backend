import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  PORT: Joi.number().required(),
  WS_PORT: Joi.number().required(),
  STUDENT_URL: Joi.string().required(),
  ADMIN_URL: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),

  RESEND_API_KEY: Joi.string().required(),

  MIDTRANS_APP_URL: Joi.string().required(),
  MIDTRANS_SERVER_KEY: Joi.string().required(),
});
