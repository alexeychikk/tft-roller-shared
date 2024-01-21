import type { Trait } from '../types';

export const ORIGIN_TRAITS: Trait[] = [
  {
    name: 'Darkin',
    activations: [1],
  },
  {
    name: 'Demacia',
    activations: [3, 5, 7, 9],
  },
  {
    name: 'Freljord',
    activations: [2, 3, 4],
  },
  {
    name: 'Ionia',
    activations: [3, 6, 9],
  },
  {
    name: 'Noxus',
    activations: [3, 6, 9],
  },
  {
    name: 'Piltover',
    activations: [3, 6],
  },
  {
    name: 'Shadow Isles',
    activations: [2, 4, 6],
  },
  {
    name: 'Shurima',
    activations: [3, 5, 7, 9],
  },
  {
    name: 'Targon',
    activations: [2, 3, 4],
  },
  {
    name: 'Void',
    activations: [3, 6, 8],
  },
  {
    name: 'Wanderer',
    activations: [1],
  },
  {
    name: 'Yordle',
    activations: [3, 5],
  },
  {
    name: 'Zaun',
    activations: [2, 4, 6],
  },
];

export const CLASS_TRAITS: Trait[] = [
  {
    name: 'Bastion',
    activations: [2, 4, 6, 8],
  },
  {
    name: 'Bruiser',
    activations: [2, 4, 6],
  },
  {
    name: 'Challenger',
    activations: [2, 4, 6, 8],
  },
  {
    name: 'Deadeye',
    activations: [2, 4, 6],
  },
  {
    name: 'Empress',
    activations: [1],
  },
  {
    name: 'Gunner',
    activations: [2, 4, 6],
  },
  {
    name: 'Invoker',
    activations: [2, 4, 6],
  },
  {
    name: 'Juggernaut',
    activations: [2, 4, 6],
  },
  {
    name: 'Multicaster',
    activations: [2, 4],
  },
  {
    name: 'Redeemer',
    activations: [1],
  },
  {
    name: 'Rogue',
    activations: [2, 4],
  },
  {
    name: 'Slayer',
    activations: [2, 3, 4, 5, 6],
  },
  {
    name: 'Sorcerer',
    activations: [2, 4, 6, 8],
  },
  {
    name: 'Strategist',
    activations: [2, 3, 4, 5],
  },
  {
    name: 'Technogenius',
    activations: [1],
  },
];

export const ALL_TRAITS = ORIGIN_TRAITS.concat(CLASS_TRAITS);

export const ALL_TRAITS_MAP = ALL_TRAITS.reduce(
  (res, trait) => {
    res[trait.name] = trait;
    return res;
  },
  {} as Record<string, Trait>,
);
