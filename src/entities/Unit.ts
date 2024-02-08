import { CHAMPIONS_MAP } from '../constants';
import type { PartialFields } from '../types';

export class Unit {
  name: string;
  stars: number;

  constructor(options: PartialFields<Unit> = {}) {
    Object.assign(this, options);
  }

  get sellCost(): number {
    const champion = CHAMPIONS_MAP[this.name];
    const gold = champion.tier * Math.pow(3, this.stars - 1);
    return champion.tier === 1 || this.stars === 1 ? gold : gold - 1;
  }
}
