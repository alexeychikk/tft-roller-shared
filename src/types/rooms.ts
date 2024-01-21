import { IsAlphanumeric, Length } from 'class-validator';

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

export enum LobbyMessageType {
  Rooms = 'rooms',
  Add = '+',
  Remove = '-',
}

export enum GameMessageType {
  BuyExperience = 'buyExperience',
  BuyChampion = 'buyChampion',
  SellUnit = 'sellUnit',
  MoveUnit = 'moveUnit',
  Reroll = 'reroll',
}
