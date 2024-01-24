export enum RoomType {
  Game = 'game',
  Lobby = 'lobby',
}

export enum LobbyEventType {
  Rooms = 'rooms',
  Add = '+',
  Remove = '-',
}

export interface GameMeta {
  name: string;
  ownerId: string;
  protected: boolean;
}

export interface GameOptions {
  name: string;
  password?: string;
  ownerId: string;
}

export interface GameRoomEntity {
  roomId: string;
}

export enum GameMessageType {
  Start = 'start',
  BuyExperience = 'buyExperience',
  BuyChampion = 'buyChampion',
  SellUnit = 'sellUnit',
  MoveUnit = 'moveUnit',
  Reroll = 'reroll',
}
