import { BadRequestException } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

/** Validates and strips a request payload with a zod schema. */
export class ZodValidationPipe<Schema extends z.ZodType> implements PipeTransform {
  constructor(private readonly schema: Schema) {}

  transform(value: unknown): z.infer<Schema> {
    const result = this.schema.safeParse(value);
    if (!result.success) throw new BadRequestException('Dados inválidos.');
    return result.data;
  }
}
