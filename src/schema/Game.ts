import type { Clock } from '@colyseus/core';
import type { MapSchema } from '@colyseus/schema';
import { Schema, filter, type } from '@colyseus/schema';
import { mapValues, pickBy, sumBy, times } from 'remeda';

import {
  CHAMPIONS_MAP,
  CHAMPIONS_POOL,
  EXPERIENCE_PER_BUY,
  GOLD_PER_EXPERIENCE_BUY,
  GOLD_PER_REROLL,
  SHOP_SIZE,
  TIME_PER_PHASE,
} from '../constants';
import type { GenericClient, SchemaOptions, User } from '../types';
import { GamePhase, GameStatus } from '../types';
import { weightedRandom } from '../utils';

import type { Player } from './Player';
import { PlayerSchema } from './Player';
import { UnitSchema } from './Unit';
import type { UnitContext } from './UnitsGrid';
import { UnitsGridSchema } from './UnitsGrid';
import { UserSchema } from './User';

export class Game extends Schema {
  ownerSessionId: string;
  status: GameStatus;
  stage: number;
  phase: GamePhase;
  players: Map<string, Player> | MapSchema<PlayerSchema>;
  shopChampionPool: Map<string, number> | MapSchema<number>;
}

export class GameSchema extends Game {
  @type('string')
  ownerSessionId: string;

  @type('string')
  status: GameStatus;

  @type('number')
  stage: number;

  @type('string')
  phase: GamePhase;

  @type({ map: PlayerSchema })
  players: MapSchema<PlayerSchema>;

  @filter(function (this: GameSchema, client: GenericClient) {
    return !!this.players.get(client.sessionId)?.user.isAdmin;
  })
  @type({ map: 'number' })
  shopChampionPool: MapSchema<number>;

  protected clock: Clock;

  constructor(options: { clock: Clock }) {
    super({
      status: GameStatus.InLobby,
      stage: 0,
      phase: GamePhase.Preparation,
      players: {},
      shopChampionPool: CHAMPIONS_POOL,
    });
    this.clock = options?.clock;
  }

  createPlayer(user: User, options: SchemaOptions<Player> = {}) {
    const player = new PlayerSchema({
      gold: 0,
      experience: 0,
      health: 100,
      shopChampionNames: times(SHOP_SIZE, () => ''),
      bench: new UnitsGridSchema({
        height: 1,
        width: 9,
        slots: new Map(),
      }),
      table: new UnitsGridSchema({
        height: 4,
        width: 7,
        slots: new Map(),
      }),
      user: new UserSchema(user),
      ...options,
    });
    this.players.set(player.sessionId, player);
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

  // TODO: throw errors and handle them in GameRoom
  start(sessionId: string) {
    if (this.status !== GameStatus.InLobby) return;
    if (this.players.size < 2) return;
    const player = this.players.get(sessionId);
    if (player?.sessionId !== this.ownerSessionId) return;
    this.players.forEach((player) => this.rerollShop(player.sessionId));
    this.status = GameStatus.InProgress;
    this.gameLoop();
    return true;
  }

  buyExperience(sessionId: string) {
    if (this.status !== GameStatus.InProgress) return;
    if (this.phase !== GamePhase.Reroll) return;
    const player = this.players.get(sessionId);
    if (!player) return;
    if (!player.isEnoughGoldToBuyExperience) return;
    if (player.isMaxLevelReached) return;
    player.experience += EXPERIENCE_PER_BUY;
    player.gold -= GOLD_PER_EXPERIENCE_BUY;
  }

  buyChampion(sessionId: string, index: number) {
    if (this.status !== GameStatus.InProgress) return;
    if (this.phase !== GamePhase.Reroll) return;
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
      new UnitSchema({ name: championName, stars: 1 }),
    );
    player.gold -= champion.tier;
    this.mergeUnits(sessionId, { championName });
  }

  sellUnit(sessionId: string, { coords, gridType }: UnitContext) {
    if (this.status !== GameStatus.InProgress) return;
    if (this.phase !== GamePhase.Reroll) return;
    const player = this.players.get(sessionId);
    if (!player) return;
    const unit = player[gridType]?.getUnit(coords);
    if (!unit) return;
    player[gridType].setUnit(coords, undefined);
    this.addToChampionPool(unit.name, 1);
    player.gold += unit.sellCost;
  }

  moveUnit(sessionId: string, source: UnitContext, dest: UnitContext) {
    if (this.status !== GameStatus.InProgress) return;
    if (this.phase !== GamePhase.Reroll) return;
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
    if (this.status !== GameStatus.InProgress) return;
    if (this.phase !== GamePhase.Reroll) return;
    const player = this.players.get(sessionId);
    if (!player?.isEnoughGoldToReroll) return;

    player.shopChampionNames.forEach((name) => {
      if (!name) return;
      this.addToChampionPool(name, 1);
    });
    this.rerollShop(sessionId);
    player.gold -= GOLD_PER_REROLL;
  }

  protected gameLoop() {
    switch (this.phase) {
      case GamePhase.Preparation: {
        this.players.forEach((player) => {
          player.gold += 50;
        });
        this.clock.setTimeout(() => {
          this.phase = GamePhase.Reroll;
          this.gameLoop();
        }, TIME_PER_PHASE[GamePhase.Preparation]);
        return;
      }

      case GamePhase.Reroll: {
        this.clock.setTimeout(() => {
          this.phase = GamePhase.Combat;
          this.gameLoop();
        }, TIME_PER_PHASE[GamePhase.Reroll]);
        return;
      }

      case GamePhase.Combat: {
        this.players.forEach((player) => {
          // TODO: combat logic
          player.health -= 10;
        });

        this.clock.setTimeout(() => {
          this.phase = GamePhase.Elimination;
          this.gameLoop();
        }, TIME_PER_PHASE[GamePhase.Combat]);
        return;
      }

      case GamePhase.Elimination: {
        this.players.forEach((player) => {
          if (player.health <= 0) {
            this.removePlayer(player.sessionId);
          }
        });

        if (this.players.size <= 1) {
          this.status = GameStatus.Finished;
          return;
        }

        this.clock.setTimeout(() => {
          this.stage++;
          this.phase = GamePhase.Preparation;
          this.gameLoop();
        }, TIME_PER_PHASE[GamePhase.Elimination]);
        return;
      }
    }
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
        const poolRecord = Array.from(this.shopChampionPool).reduce(
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
