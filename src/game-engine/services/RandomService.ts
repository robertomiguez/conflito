export class RandomService {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Mulberry32 generator for 32-bit seedable randomness.
   * Returns a float between 0 (inclusive) and 1 (exclusive).
   */
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Roll a standard 6-sided die.
   */
  rollDie(): number {
    return Math.floor(this.next() * 6) + 1;
  }

  /**
   * Get the current advanced seed state.
   */
  getSeed(): number {
    return this.seed;
  }
}
