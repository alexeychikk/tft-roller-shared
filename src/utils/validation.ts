import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { validateOrReject } from 'class-validator';

export async function validate<T extends object>(
  classParam: ClassConstructor<T>,
  value: any,
): Promise<T> {
  const instance = plainToInstance(classParam, value);
  await validateOrReject(instance, { whitelist: true });
  return instance;
}
