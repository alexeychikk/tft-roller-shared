import { forEachObj, sortBy } from 'remeda';

import { ALL_TRAITS_MAP, CHAMPIONS_MAP } from '../constants';
import type { CompStats } from '../types';

export function getCompStats(champions: string[]): CompStats[] {
  const res: Record<string, CompStats> = {};

  for (const name of new Set(champions)) {
    for (const trait of CHAMPIONS_MAP[name].classTraits) {
      res[trait] ??= { trait, champions: [], activationLevel: 0 };
      res[trait].champions.push(name);
    }
    for (const trait of CHAMPIONS_MAP[name].originTraits) {
      res[trait] ??= { trait, champions: [], activationLevel: 0 };
      res[trait].champions.push(name);
    }
  }

  forEachObj(res, (stats) => {
    stats.activationLevel = getActivationLevel(
      stats.trait,
      stats.champions.length,
    );
  });

  return sortBy(Object.values(res), ({ trait, champions, activationLevel }) => {
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
