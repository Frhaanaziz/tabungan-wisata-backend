import { UserRole } from '@prisma/client';
import { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';

export interface JwtPayload extends DefaultJwtPayload {
  user: { id: string; role: UserRole };
}
