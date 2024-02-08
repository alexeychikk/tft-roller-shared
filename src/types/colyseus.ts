import type { ArraySchema, MapSchema, Schema } from '@colyseus/schema';

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

// I know, I know, but what else can I do, it's in my nature :)
export type SchemaOf<T> =
  T extends Map<string, infer MV>
    ? MapSchema<SchemaOf<MV>, string>
    : T extends Array<infer AV>
      ? ArraySchema<SchemaOf<AV>>
      : T extends (...args: any[]) => any
        ? T
        : T extends Record<string, any>
          ? Schema & { [RK in keyof Omit<T, keyof Schema>]: SchemaOf<T[RK]> }
          : T;

export type SchemaLike<T> =
  T extends Map<string, infer MV>
    ? MapSchema<SchemaLike<MV>, string> | Record<string, SchemaLike<MV>>
    : T extends Array<infer AV>
      ? ArraySchema<SchemaLike<AV>> | SchemaLike<AV>[]
      : T;

export type SchemaConstructorParams<T> = {
  [RK in keyof Omit<T, keyof Schema>]?: SchemaLike<T[RK]>;
};
