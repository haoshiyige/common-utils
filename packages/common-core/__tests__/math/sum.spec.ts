import { describe, it, expect } from 'vitest';
import { sum } from '../../src/math';

describe('sum function', () => {
  it('calculates the sum of an array of numbers', () => {
    const result = sum([1, 2, 3, 4]);
    expect(result).toBe(10);
  });

  it('returns 0 for an empty array', () => {
    const result = sum([]);
    expect(result).toBe(0);
  });

  it('handles arrays with negative numbers', () => {
    const result = sum([-1, -2, -3, 4]);
    expect(result).toBe(-2);
  });
});
