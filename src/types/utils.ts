import type { NonFunctionKeys } from 'utility-types';

export type PartialFields<T extends object> = Partial<
  Pick<T, NonFunctionKeys<T>>
>;
