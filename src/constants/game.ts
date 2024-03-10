import { GamePhase } from '../types';

export const TIME_PER_PHASE = {
  [GamePhase.Preparation]: 1 * 1000,
  [GamePhase.Reroll]: 9999 * 1000,
  [GamePhase.Combat]: 1 * 1000,
  [GamePhase.Elimination]: 1 * 1000,
};

export const GOLD_PER_STAGE = 50;
