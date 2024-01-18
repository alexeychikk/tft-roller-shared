import { CHAMPIONS } from './champions';
import { Champion } from '../types';

export const TRAIT_TO_CHAMPIONS_MAP = (() => {
  const res: Record<string, Champion[]> = {};

  for (const champ of CHAMPIONS) {
    for (const trait of champ.classTraits) {
      res[trait] ??= [];
      const index = res[trait].findLastIndex((ch) => champ.tier > ch.tier);
      res[trait].splice(index === -1 ? res[trait].length : index, 0, champ);
    }
    for (const trait of champ.originTraits) {
      res[trait] ??= [];
      const index = res[trait].findLastIndex((ch) => champ.tier > ch.tier);
      res[trait].splice(index === -1 ? res[trait].length : index, 0, champ);
    }
  }

  return res;
})();
