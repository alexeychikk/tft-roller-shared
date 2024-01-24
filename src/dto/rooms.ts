import { IsAlphanumeric, Length } from 'class-validator';

import { IsOptionalString } from '../utils';

export class CreateGameDto {
  @Length(3, 20)
  @IsAlphanumeric()
  @IsOptionalString()
  name?: string;

  @Length(1, 20)
  @IsOptionalString()
  password?: string;

  constructor(data: Partial<CreateGameDto>) {
    Object.assign(this, data);
  }
}

export class JoinGameDto {
  @Length(1, 20)
  @IsOptionalString()
  password?: string;

  constructor(data: Partial<JoinGameDto>) {
    Object.assign(this, data);
  }
}

export class JoinGameRoomDto extends JoinGameDto {
  @Length(1, 20)
  roomId: string;

  constructor(data: Partial<JoinGameRoomDto>) {
    super(data);
  }
}
