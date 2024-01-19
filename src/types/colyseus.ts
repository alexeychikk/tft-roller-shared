// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
