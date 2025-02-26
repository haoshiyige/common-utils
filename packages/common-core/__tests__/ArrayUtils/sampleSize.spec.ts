import { describe, expect, it } from 'vitest';

import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('ArrayUtils.sampleSize', () => {
  it('returns a sample element array of a specified size', () => {
    const array = [1, 2, 3];
    const result = ArrayUtils.sampleSize(array, 2);

    expect(array).toEqual(expect.arrayContaining(result));
  });

  it('returns an empty array for size 0', () => {
    const result = ArrayUtils.sampleSize([1, 2, 3], 0);
    expect(result).toEqual([]);
  });

  it('returns the same array if the size is equal to the array length', () => {
    const array = [1, 2, 3];
    const result = ArrayUtils.sampleSize(array, array.length);

    expect(result).toEqual(array);
    expect(result).not.toBe(array);
  });

  it('throws an error if the size is greater than the array length', () => {
    expect(() => ArrayUtils.sampleSize([1, 2, 3], 4)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Size must be less than or equal to the length of array.]`
    );
  });
});
