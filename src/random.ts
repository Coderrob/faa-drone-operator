/**
 * Creates a deterministic 32-bit seed factory using xmur3.
 * @param value - Text used to initialize the hash.
 * @returns A function that returns the next unsigned seed.
 */
function xmur3(value: string): () => number {
  let hash = 1779033703 ^ value.length;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
}

/**
 * Creates a reproducible pseudo-random number generator.
 * @param seed - Stable text used to initialize the generator.
 * @returns A function producing values in the range [0, 1).
 */
export function seededRandom(seed: string): () => number {
  const seedFactory = xmur3(seed);
  let state = seedFactory();
  return () => {
    state += 0x6d2b79f5;
    let result = state;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a Fisher-Yates shuffled copy of the supplied values.
 * @param values - Values to copy and shuffle.
 * @param random - Random number source producing values in [0, 1).
 * @returns A shuffled copy without modifying the input.
 */
export function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  }
  return result;
}
