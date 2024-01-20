import { MapSchema, Schema, type } from '@colyseus/schema';

import { Unit, UnitSchema } from './Unit';

export type Coords = { x: number; y: number };

export enum GridType {
  Bench = 'bench',
  Table = 'table',
}

export type UnitContext = { gridType: GridType; coords: Coords };

export class UnitsGrid extends Schema {
  readonly width: number;
  readonly height: number;

  /**
   * 1D representation of the grid as map
   */
  readonly slots: Map<string, Unit> | MapSchema<UnitSchema>;

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

export class UnitsGridSchema extends UnitsGrid {
  @type('number') readonly width: number;
  @type('number') readonly height: number;
  @type({ map: UnitSchema }) slots: MapSchema<UnitSchema>;

  setUnit(coords: Coords, unit: UnitSchema | undefined): UnitsGridSchema {
    if (!unit) {
      this.slots.delete(`${(coords.x + this.width * coords.y) | 0}`);
    } else {
      this.slots.set(`${(coords.x + this.width * coords.y) | 0}`, unit);
    }
    return this;
  }

  moveUnit(from: Coords, to: Coords): UnitsGridSchema {
    const fromUnit = this.getUnit(from);
    if (!fromUnit) return this;

    const toUnit = this.getUnit(to);
    this.setUnit(to, fromUnit);
    this.setUnit(from, toUnit);
    return this;
  }

  upgradeUnit(coords: Coords): UnitsGridSchema {
    const unit = this.getUnit(coords);
    if (!unit) {
      throw new Error(`Unit at coords ${coords.x},${coords.y} does not exist!`);
    }
    unit.stars++;
    return this;
  }

  removeUnits(coords: Coords[]): UnitsGridSchema {
    for (const coord of coords) {
      this.setUnit(coord, undefined);
    }
    return this;
  }

  clear() {
    for (let i = 0; i < this.size; i++) {
      this.slots.delete(`${i}`);
    }
  }
}
