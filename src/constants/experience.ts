export const EXPERIENCE_PER_LEVEL: Record<number, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 10,
  5: 20,
  6: 44,
  7: 84,
  8: 144,
  9: 228,
  // 10: 328,
};

const ALL_LEVELS = Object.keys(EXPERIENCE_PER_LEVEL);
export const MIN_LEVEL = +ALL_LEVELS[0];
export const MAX_LEVEL = +ALL_LEVELS[ALL_LEVELS.length - 1];

export const GOLD_PER_EXPERIENCE = 1;
export const EXPERIENCE_PER_BUY = 4;
export const GOLD_PER_EXPERIENCE_BUY = GOLD_PER_EXPERIENCE * EXPERIENCE_PER_BUY;
