import { Schema, type } from '@colyseus/schema';
import { CHAMPIONS_MAP } from '../constants';

export class Unit extends Schema {
  @type('string') name: string;
  @type('number') stars: number;

  get sellCost(): number {
    const champion = CHAMPIONS_MAP[this.name];
    const gold = champion.tier * Math.pow(3, this.stars - 1);
    return champion.tier === 1 || this.stars === 1 ? gold : gold - 1;
  }

  upgrade() {
    this.stars++;
  }
}
