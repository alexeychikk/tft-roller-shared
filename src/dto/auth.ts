import { IsAlphanumeric, Length } from 'class-validator';

import { IsOptionalString } from '../utils';

export class SignInAnonymouslyDto {
  @Length(3, 20)
  @IsAlphanumeric()
  nickname: string;

  @Length(5, 100)
  @IsOptionalString()
  password?: string;

  constructor(data: Partial<SignInAnonymouslyDto>) {
    Object.assign(this, data);
  }
}
