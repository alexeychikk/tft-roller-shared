import type { GamePhase, GameStatus, PartialFields } from '../types';

import type { Player } from './Player';

export class Game {
  ownerSessionId: string;
  status: GameStatus;
  stage: number;
  phase: GamePhase;
  players: Map<string, Player>;
  shopChampionPool: Map<string, number>;

  constructor(options: PartialFields<Game> = {}) {
    Object.assign(this, options);
  }
}
