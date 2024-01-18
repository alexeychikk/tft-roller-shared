export function weightedRandom<T extends string | number>(
  spec: Record<T, number>,
): string {
  let sum = 0;
  const r = Math.random();

  let i: string;
  for (i in spec) {
    sum += spec[i as T];
    if (r <= sum) return i;
  }
  return i!;
}
