import { describe, expect, it } from 'vitest';

import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('ArrayUtils.takeRight', () => {
  it('returns the last n elements from the array', () => {
    expect(ArrayUtils.takeRight([1, 2, 3, 4, 5], 2)).toEqual([4, 5]);
    expect(ArrayUtils.takeRight(['a', 'b', 'c', 'd'], 2)).toEqual(['c', 'd']);
    expect(ArrayUtils.takeRight([true, false, true], 1)).toEqual([true]);
    expect(ArrayUtils.takeRight([1, 2, 3], 5)).toEqual([1, 2, 3]);
    expect(ArrayUtils.takeRight([1, 2, 3], 0)).toEqual([]);
    expect(ArrayUtils.takeRight([], 3)).toEqual([]);
  });

  it('handles cases where count is greater than array length', () => {
    expect(ArrayUtils.takeRight([1, 2, 3], 5)).toEqual([1, 2, 3]);
  });

  it('handles cases where count is zero', () => {
    expect(ArrayUtils.takeRight([1, 2, 3], 0)).toEqual([]);
  });

  it('handles empty arrays', () => {
    expect(ArrayUtils.takeRight([], 3)).toEqual([]);
  });
});
