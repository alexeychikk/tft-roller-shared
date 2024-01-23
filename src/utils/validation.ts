import {
  plainToInstance,
  type ClassConstructor,
  Transform,
} from 'class-transformer';
import { IsOptional, validateOrReject } from 'class-validator';

import { composeDecorators } from './composeDecorators';

export async function validate<T extends object>(
  classParam: ClassConstructor<T>,
  value: any,
): Promise<T> {
  const instance = plainToInstance(classParam, value);
  await validateOrReject(instance, { whitelist: true });
  return instance;
}

export const IsOptionalString = () =>
  composeDecorators(
    IsOptional(),
    Transform(({ value }) => (!value ? undefined : value)),
  );
