import {
  GOLD_PER_EXPERIENCE_BUY,
  GOLD_PER_REROLL,
  EXPERIENCE_PER_LEVEL,
  MAX_LEVEL,
  MIN_LEVEL,
  REROLL_CHANCES,
} from '../constants';
import type { PartialFields } from '../types';

import type { UnitContext, UnitsGrid } from './UnitsGrid';
import { GridType } from './UnitsGrid';
import type { User } from './User';

export class Player {
  user: User;
  sessionId: string;
  gold: number;
  experience: number;
  health: number;
  shopChampionNames: string[];
  bench: UnitsGrid;
  table: UnitsGrid;

  constructor(options: PartialFields<Player> = {}) {
    Object.assign(this, options);
  }

  get isEnoughGoldToBuyExperience() {
    return this.gold >= GOLD_PER_EXPERIENCE_BUY;
  }

  get isEnoughGoldToReroll() {
    return this.gold >= GOLD_PER_REROLL;
  }

  get isMaxLevelReached() {
    return this.experience >= EXPERIENCE_PER_LEVEL[MAX_LEVEL];
  }

  get isDead() {
    return this.health <= 0;
  }

  get levelAbove() {
    const levelAboveName = Object.keys(EXPERIENCE_PER_LEVEL).find((level) => {
      const exp = EXPERIENCE_PER_LEVEL[+level];
      return this.experience < exp;
    });
    return levelAboveName ? +levelAboveName : undefined;
  }

  get level() {
    return Math.max(
      this.levelAbove !== undefined ? this.levelAbove - 1 : MAX_LEVEL,
      MIN_LEVEL,
    );
  }

  get rerollChances() {
    return REROLL_CHANCES[this.level];
  }

  getUnitCost({ coords, gridType }: UnitContext) {
    return this[gridType].getUnit(coords)?.sellCost || 0;
  }

  canMoveUnit(source: UnitContext, dest: UnitContext): boolean {
    const unitFrom = this[source.gridType].getUnit(source.coords);
    if (!unitFrom) return false;

    const unitTo = this[dest.gridType].getUnit(dest.coords);

    if (
      source.gridType === GridType.Bench &&
      dest.gridType === GridType.Table &&
      !unitTo &&
      this.table.units.length >= this.level
    ) {
      return false;
    }

    return true;
  }
}
