import { alphabetical } from 'radash';

import { CompStats } from '../types';
import { ALL_TRAITS_MAP, CHAMPIONS_MAP } from '../constants';

export function getCompStats(champions: string[]): CompStats[] {
  const statsByTrait: Record<string, CompStats> = {};

  for (const name of new Set(champions)) {
    for (const trait of CHAMPIONS_MAP[name].classTraits) {
      statsByTrait[trait] ??= { trait, champions: [], activationLevel: 0 };
      statsByTrait[trait].champions.push(name);
    }
    for (const trait of CHAMPIONS_MAP[name].originTraits) {
      statsByTrait[trait] ??= { trait, champions: [], activationLevel: 0 };
      statsByTrait[trait].champions.push(name);
    }
  }

  const compStats = Object.values(statsByTrait);
  compStats.forEach((stats) => {
    stats.activationLevel = getActivationLevel(
      stats.trait,
      stats.champions.length,
    );
  });

  return alphabetical(compStats, ({ trait, champions, activationLevel }) => {
    return `${9 - activationLevel};${99 - champions.length};${trait}`;
  });
}

export function getActivationLevel(
  trait: string,
  championsCount: number,
): number {
  const { activations } = ALL_TRAITS_MAP[trait];

  return championsCount < activations[0]
    ? 0
    : championsCount >= activations[activations.length - 1]
      ? activations.length
      : activations.findIndex(
          (ac, i) =>
            championsCount >= ac && championsCount < activations[i + 1],
        ) + 1;
}
