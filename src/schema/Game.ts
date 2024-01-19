import { mapValues, pickBy, sumBy, times } from 'remeda';
import { MapSchema, Schema, filter, type } from '@colyseus/schema';

import {
  CHAMPIONS_MAP,
  CHAMPIONS_POOL,
  EXPERIENCE_PER_BUY,
  GOLD_PER_EXPERIENCE_BUY,
  GOLD_PER_REROLL,
} from '../constants';
import { weightedRandom } from '../utils';
import { GenericClient } from '../types';

import { Unit } from './Unit';
import { UnitContext } from './UnitsGrid';
import { Player } from './Player';

export class Game extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

  @filter(function (this: Game, client: GenericClient) {
    return !!this.players.get(client.sessionId)?.isAdmin;
  })
  @type({ map: 'number' })
  shopChampionPool = new MapSchema<number>(CHAMPIONS_POOL);

  createPlayer(sessionId: string) {
    const player = new Player(sessionId);
    this.players.set(sessionId, player);
    this.rerollShop(sessionId);
    return player;
  }

  removePlayer(sessionId: string) {
    const player = this.players.get(sessionId);
    if (!player) return;
    player.table.units.forEach((unit) => this.addToChampionPool(unit.name, 1));
    player.bench.units.forEach((unit) => this.addToChampionPool(unit.name, 1));
    player.table.clear();
    player.bench.clear();
    this.players.delete(sessionId);
  }

  buyExperience(sessionId: string) {
    const player = this.players.get(sessionId);
    if (!player) return;
    if (!player.isEnoughGoldToBuyExperience) return;
    if (player.isMaxLevelReached) return;
    player.experience += EXPERIENCE_PER_BUY;
    player.gold -= GOLD_PER_EXPERIENCE_BUY;
  }

  buyChampion(sessionId: string, index: number) {
    const player = this.players.get(sessionId);
    if (!player) return;
    const championName = player.shopChampionNames[index];
    if (!championName) return;

    const champion = CHAMPIONS_MAP[championName];
    if (player.gold < champion.tier) return;

    if (!player.bench.firstEmptySlot) {
      const benchUnitsCoords = player.bench.getCoordsOfUnitsOfStars(
        championName,
        2,
        1,
      );
      const tableUnitsCoords = player.table.getCoordsOfUnitsOfStars(
        championName,
        2,
        1,
      );
      if (!benchUnitsCoords.length && !tableUnitsCoords.length) {
        return;
      }

      const shopChampionIndexes = [
        index,
        ...player.shopChampionNames
          .map((name, i) => (name === championName ? i : -1))
          .filter((i) => i !== -1 && i !== index),
      ];
      const amountToBuy =
        3 - (benchUnitsCoords.length + tableUnitsCoords.length);
      if (shopChampionIndexes.length < amountToBuy) {
        return;
      }
      if (player.gold < amountToBuy * champion.tier) {
        return;
      }

      times(amountToBuy, (i) => {
        player.shopChampionNames[shopChampionIndexes[i]] = '';
      });
      player.gold -= amountToBuy * champion.tier;
      this.mergeUnits(sessionId, { championName, minUnitsAmount: 1 });
      return;
    }

    player.shopChampionNames[index] = '';
    player.bench.setUnit(
      player.bench.firstEmptySlot,
      new Unit({ name: championName, stars: 1 }),
    );
    player.gold -= champion.tier;
    this.mergeUnits(sessionId, { championName });
  }

  sellUnit(sessionId: string, { coords, gridType }: UnitContext) {
    const player = this.players.get(sessionId);
    if (!player) return;
    const unit = player[gridType]?.getUnit(coords);
    if (!unit) return;
    player[gridType].setUnit(coords, undefined);
    this.addToChampionPool(unit.name, 1);
    player.gold += unit.sellCost;
  }

  moveUnit(sessionId: string, source: UnitContext, dest: UnitContext) {
    const player = this.players.get(sessionId);
    if (!player?.canMoveUnit(source, dest)) return;

    const sourceGrid = player[source.gridType];
    const destGrid = player[dest.gridType];
    if (!sourceGrid || !destGrid) return;

    const unitFrom = sourceGrid.getUnit(source.coords);
    const unitTo = destGrid.getUnit(dest.coords);

    if (source.gridType === dest.gridType) {
      sourceGrid.setUnit(source.coords, unitTo).setUnit(dest.coords, unitFrom);
    } else {
      sourceGrid.setUnit(source.coords, unitTo);
      destGrid.setUnit(dest.coords, unitFrom);
    }
  }

  reroll(sessionId: string) {
    const player = this.players.get(sessionId);
    if (!player?.isEnoughGoldToReroll) return;

    player.shopChampionNames.forEach((name) => {
      if (!name) return;
      this.addToChampionPool(name, 1);
    });
    this.rerollShop(sessionId);
    player.gold -= GOLD_PER_REROLL;
  }

  protected addToChampionPool(name: string, amount: number) {
    this.shopChampionPool.set(
      name,
      (this.shopChampionPool.get(name) || 0) + amount,
    );
  }

  protected rerollShop(sessionId: string) {
    const player = this.players.get(sessionId);
    if (!player) return;
    times(player.shopChampionNames.length, (index) =>
      this.rerollShopSlot(sessionId, index),
    );
  }

  protected rerollShopSlot(sessionId: string, index: number) {
    const player = this.players.get(sessionId);
    if (!player) return;
    const poolByTier: Record<
      number,
      { pool: Record<string, number>; total: number }
    > = {};

    const tierSpec = player.rerollChances.reduce(
      (result, probability, index) => {
        if (probability <= 0) return result;

        const tier = index + 1;
        const poolRecord = Array.from(this.shopChampionPool.entries()).reduce(
          (acc, [name, amount]) =>
            Object.assign(acc, {
              [name]: amount,
            }),
          {} as Record<string, number>,
        );
        const pool = pickBy(
          poolRecord,
          (_, name) => CHAMPIONS_MAP[name].tier === tier,
        );
        const total = sumBy(Object.keys(pool), (name) => pool[name]);

        if (total <= 0) return result;

        poolByTier[tier] = { pool, total };
        result[tier] = probability;
        return result;
      },
      {} as Record<number, number>,
    );

    const tier = +weightedRandom(tierSpec);

    const tierPool = poolByTier[tier].pool;
    const totalTierPoolSize = poolByTier[tier].total;

    const champSpec = mapValues(
      pickBy(tierPool, (pool) => pool > 0),
      (size) => size / totalTierPoolSize,
    );
    const championName = weightedRandom(champSpec);

    player.shopChampionNames[index] = championName;

    this.addToChampionPool(championName, -1);
  }

  protected mergeUnits(
    sessionId: string,
    {
      championName,
      stars = 1,
      minUnitsAmount = 3,
    }: {
      championName: string;
      stars?: number;
      minUnitsAmount?: number;
    },
  ) {
    const player = this.players.get(sessionId);
    if (!player) return;
    const benchCoords = player.bench.getCoordsOfUnitsOfStars(
      championName,
      3,
      stars,
    );
    const tableCoords = player.table.getCoordsOfUnitsOfStars(
      championName,
      3,
      stars,
    );
    if (benchCoords.length + tableCoords.length < minUnitsAmount) {
      return;
    }

    if (tableCoords.length) {
      const [firstUnitCoords, ...restCoords] = tableCoords;
      player.bench.removeUnits(benchCoords);
      player.table.removeUnits(restCoords).upgradeUnit(firstUnitCoords);
    } else {
      const [firstUnitCoords, ...restCoords] = benchCoords;
      player.table.removeUnits(tableCoords);
      player.bench.removeUnits(restCoords).upgradeUnit(firstUnitCoords);
    }

    this.mergeUnits(sessionId, { championName, stars: stars + 1 });
  }
}
