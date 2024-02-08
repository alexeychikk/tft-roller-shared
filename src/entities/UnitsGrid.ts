import type { PartialFields } from '../types';

import type { Unit } from './Unit';

export type Coords = { x: number; y: number };

export enum GridType {
  Bench = 'bench',
  Table = 'table',
}

export type UnitContext = { gridType: GridType; coords: Coords };

export class UnitsGrid {
  readonly width: number;
  readonly height: number;

  /**
   * 1D representation of the grid as map
   */
  readonly slots: Map<string, Unit>;

  constructor(options: PartialFields<UnitsGrid> = {}) {
    Object.assign(this, options);
  }

  get size(): number {
    return (this.width * this.height) | 0;
  }

  get isFull(): boolean {
    return !this.firstEmptySlot;
  }

  get units(): Unit[] {
    const res: Unit[] = [];
    for (let i = 0; i < this.size; i++) {
      if (this.slots.has(`${i}`)) res.push(this.slots.get(`${i}`)!);
    }
    return res;
  }

  get firstEmptySlot(): Coords | undefined {
    for (let i = 0; i < this.size; i++) {
      if (!this.slots.has(`${i}`))
        return { x: i % this.width, y: (i / this.width) | 0 };
    }
  }

  getUnit(coords: Coords): Unit | undefined {
    return this.slots.get(`${(coords.x + this.width * coords.y) | 0}`);
  }

  getCoordsOfUnitsOfStars(
    name: string,
    numUnits: number,
    stars: number,
  ): Coords[] {
    const coords: Coords[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (
          this.getUnit({ x, y })?.name !== name ||
          this.getUnit({ x, y })?.stars !== stars
        ) {
          continue;
        }
        coords.push({ x, y });
        if (coords.length === numUnits) {
          return coords;
        }
      }
    }

    return coords;
  }
}
