import type { PartialFields } from '../types';

export class User {
  nickname: string;
  id: string;
  isAdmin: boolean;

  constructor(options: PartialFields<User> = {}) {
    Object.assign(this, options);
  }
}
