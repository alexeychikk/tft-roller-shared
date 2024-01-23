import type { ArraySchema } from '@colyseus/schema';
import { Schema, filter, type } from '@colyseus/schema';

import {
  GOLD_PER_EXPERIENCE_BUY,
  GOLD_PER_REROLL,
  EXPERIENCE_PER_LEVEL,
  MAX_LEVEL,
  MIN_LEVEL,
  REROLL_CHANCES,
} from '../constants';
import type { GenericClient } from '../types';

import type { UnitContext, UnitsGrid } from './UnitsGrid';
import { GridType, UnitsGridSchema } from './UnitsGrid';

export class Player extends Schema {
  sessionId: string;
  isAdmin: boolean;
  gold: number;
  experience: number;
  shopChampionNames: string[] | ArraySchema<string>;
  bench: UnitsGrid;
  table: UnitsGrid;

  get isEnoughGoldToBuyExperience() {
    return this.gold >= GOLD_PER_EXPERIENCE_BUY;
  }

  get isEnoughGoldToReroll() {
    return this.gold >= GOLD_PER_REROLL;
  }

  get isMaxLevelReached() {
    return this.experience >= EXPERIENCE_PER_LEVEL[MAX_LEVEL];
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

export class PlayerSchema extends Player {
  @type('string') sessionId: string;
  @type('number') gold: number;
  @type('number') experience: number;

  @filter(function (this: PlayerSchema, client: GenericClient) {
    return this.sessionId === client.sessionId;
  })
  @type(['string'])
  shopChampionNames: ArraySchema<string>;

  @type(UnitsGridSchema) bench: UnitsGridSchema;
  @type(UnitsGridSchema) table: UnitsGridSchema;
}
