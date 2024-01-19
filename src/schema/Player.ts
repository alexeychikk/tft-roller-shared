import { times } from 'remeda';
import { ArraySchema, Schema, filter, type } from '@colyseus/schema';

import {
  SHOP_SIZE,
  GOLD_PER_EXPERIENCE_BUY,
  GOLD_PER_REROLL,
  EXPERIENCE_PER_LEVEL,
  MAX_LEVEL,
  MIN_LEVEL,
  REROLL_CHANCES,
} from '../constants';
import { GenericClient } from '../types';

import { GridType, UnitContext, UnitsGrid } from './UnitsGrid';

export class Player extends Schema {
  @type('string') sessionId: string;
  @type('boolean') isAdmin: boolean = false;

  @type('number') gold = 300;
  @type('number') experience = 0;

  @filter(function (this: Player, client: GenericClient) {
    return this.sessionId === client.sessionId;
  })
  @type(['string'])
  shopChampionNames = new ArraySchema<string>(...times(SHOP_SIZE, () => ''));

  @type(UnitsGrid) bench = new UnitsGrid({ height: 1, width: 9 });
  @type(UnitsGrid) table = new UnitsGrid({ height: 4, width: 7 });

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
