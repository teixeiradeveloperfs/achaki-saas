import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';

/** Routes are authenticated by default; this opts a route out. */
export const Public = () => SetMetadata(IS_PUBLIC, true);
