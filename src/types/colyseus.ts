import type { Schema } from '@colyseus/schema';
import type { NonFunctionKeys, PickByValue } from 'utility-types';

export interface GenericClient<UserData = any, AuthData = any> {
  readyState: number;
  id: string;
  /**
   * Unique id per session.
   */
  sessionId: string;
  state: ClientState;
  userData?: UserData;
  /**
   * auth data provided by your `onAuth`
   */
  auth?: AuthData;
  pingCount?: number;
}

export enum ClientState {
  JOINING = 0,
  JOINED = 1,
  RECONNECTED = 2,
  LEAVING = 3,
}

export enum ErrorCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  UnprocessableEntity = 422,
  InternalServerError = 500,
}

export type SchemaOptions<T extends Schema> = Partial<
  PickByValue<T, NonFunctionKeys<T>>
>;

export interface RoomListingData<Metadata = any> {
  clients: number;
  locked: boolean;
  private: boolean;
  maxClients: number;
  metadata: Metadata;
  name: string;
  publicAddress?: string;
  processId: string;
  roomId: string;
  unlisted: boolean;
}
