import { describe, expect, it } from 'vitest';

import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('intersection', () => {
  it('should return the intersection of two arrays', () => {
    expect(ArrayUtils.intersection([1, 2], [1, 3])).toEqual([1]);
    expect(ArrayUtils.intersection([1, 2], [3, 1])).toEqual([1]);
    expect(ArrayUtils.intersection([1, 2], [3, 4])).toEqual([]);
    expect(ArrayUtils.intersection([], [1, 2])).toEqual([]);
  });
});
