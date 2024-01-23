import { Transform } from 'class-transformer';
import { IsAlphanumeric, IsOptional, Length } from 'class-validator';

export enum RoomType {
  Game = 'game',
  Lobby = 'lobby',
}

export class JoinLobbyOptions {
  @Length(3, 20)
  @IsAlphanumeric()
  name: string;

  constructor(data: Partial<JoinLobbyOptions>) {
    Object.assign(this, data);
  }
}

export enum LobbyEventType {
  Rooms = 'rooms',
  Add = '+',
  Remove = '-',
}

export enum LobbyMessageType {
  CreateGame = 'createGame',
  JoinGame = 'joinGame',
}

export class CreateGameOptions {
  @Transform(({ value }) => (!value ? undefined : value))
  @Length(3, 20)
  @IsAlphanumeric()
  @IsOptional()
  name?: string;

  @Length(1, 20)
  @IsOptional()
  password?: string;

  constructor(data: Partial<CreateGameOptions>) {
    Object.assign(this, data);
  }
}

export interface GameOptions {
  name?: string;
  password?: string;
  ownerId: string;
}

export class JoinGameOptions {
  @Length(1, 20)
  @IsOptional()
  password?: string;

  constructor(data: Partial<JoinGameOptions>) {
    Object.assign(this, data);
  }
}

export enum GameMessageType {
  Start = 'start',
  BuyExperience = 'buyExperience',
  BuyChampion = 'buyChampion',
  SellUnit = 'sellUnit',
  MoveUnit = 'moveUnit',
  Reroll = 'reroll',
}
