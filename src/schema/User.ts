import { Schema, type } from '@colyseus/schema';

export class UserSchema extends Schema {
  @type('string')
  nickname: string;

  @type('string')
  id: string;

  @type('boolean')
  isAdmin: boolean;
}
