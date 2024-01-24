import { SetMetadata } from '@nestjs/common';

export const iS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(iS_PUBLIC_KEY, true);
