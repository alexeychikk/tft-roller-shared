import type { GenericClient } from './colyseus';

export type User = {
  nickname: string;
  id: string;
  isAdmin?: boolean;
};

export type AuthClient = GenericClient<any, User>;
