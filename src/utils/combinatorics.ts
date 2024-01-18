import { times } from 'remeda';

/**
 * (n = 6, k = 4) => 15
 * 0123 1234 2345
 * 0124 1235
 * 0125 1245
 * 0134 1345
 * 0135
 * 0145
 * 0234
 * 0235
 * 0245
 * 0345
 */
export function traverseUniqueCombinations<T>(
  arr: T[],
  k: number,
  cb: (comb: T[], i: number) => void,
): void {
  const n = arr.length;

  if (k <= 0 || k > n) {
    return;
  }

  const indexes = times(k, (i) => i);
  let iteration = 0;

  for (;;) {
    const comb: T[] = indexes.map((i) => arr[i]);
    iteration++;
    cb(comb, iteration);

    let i = k - 1;
    while (i >= 0 && indexes[i] === i + n - k) {
      i--;
    }

    if (i < 0) {
      break;
    }

    indexes[i]++;
    for (let j = i + 1; j < k; j++) {
      indexes[j] = indexes[j - 1] + 1;
    }
  }
}
