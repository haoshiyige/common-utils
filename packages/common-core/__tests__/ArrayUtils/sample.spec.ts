import { describe, expect, it } from 'vitest';
import { ArrayUtils } from '../../src/ArrayUtils/common/index';
describe('sample', () => {
  it('selects a random element from an array', () => {
    const arr = [1, 2, 3, 4, 5];

    expect(arr.includes(ArrayUtils.sample(arr))).toBe(true);
  });
});
