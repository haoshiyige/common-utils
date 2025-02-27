import { describe, expect, it } from 'vitest';

import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('ArrayUtils.forEachRight', () => {
  it('should iterate over elements from right to left', () => {
    const array = [1, 2, 3];
    const result: number[] = [];

    ArrayUtils.forEachRight(array, value => {
      result.push(value);
    });

    expect(result).toEqual([3, 2, 1]);
  });

  it('should provide correct index and array for arrays', () => {
    const array = [1, 2, 3];
    const indices: number[] = [];
    const arrays: number[][] = [];

    ArrayUtils.forEachRight(array, (_, index, arr) => {
      indices.push(index);
      arrays.push(arr);
    });

    expect(indices).toEqual([2, 1, 0]);
    expect(arrays).toEqual([array, array, array]);
  });

  it('should handle an empty array', () => {
    const array: number[] = [];
    const result: number[] = [];

    ArrayUtils.forEachRight(array, value => {
      result.push(value);
    });

    expect(result).toEqual([]);
  });
});
