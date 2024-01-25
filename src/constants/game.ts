import { GamePhase } from '../types';

export const TIME_PER_PHASE = {
  [GamePhase.Preparation]: 3 * 1000,
  [GamePhase.Reroll]: 30 * 1000,
  [GamePhase.Combat]: 5 * 1000,
  [GamePhase.Elimination]: 3 * 1000,
};

export const GOLD_PER_STAGE = 50;
