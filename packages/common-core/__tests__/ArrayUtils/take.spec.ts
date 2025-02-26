import { describe, expect, it } from 'vitest';

import { ArrayUtils } from '../../src/ArrayUtils/common/index';
describe('ArrayUtils.take', () => {
  it('returns the first n elements from the array', () => {
    expect(ArrayUtils.take([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3]);
    expect(ArrayUtils.take(['a', 'b', 'c', 'd'], 2)).toEqual(['a', 'b']);
    expect(ArrayUtils.take([true, false, true], 1)).toEqual([true]);
  });

  it('handles cases where count is greater than array length', () => {
    expect(ArrayUtils.take([1, 2, 3], 5)).toEqual([1, 2, 3]);
  });

  it('handles cases where count is zero', () => {
    expect(ArrayUtils.take([1, 2, 3], 0)).toEqual([]);
  });

  it('handles empty arrays', () => {
    expect(ArrayUtils.take([], 3)).toEqual([]);
  });
});
