import { describe, expect, it } from 'vitest';

import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('difference', () => {
  it('should the difference of two arrays', () => {
    expect(ArrayUtils.difference([1, 2, 3], [1])).toEqual([2, 3]);
    expect(ArrayUtils.difference([], [1, 2, 3])).toEqual([]);
    expect(ArrayUtils.difference([1, 2, 3, 4], [2, 4])).toEqual([1, 3]);
  });
});
