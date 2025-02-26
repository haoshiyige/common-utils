import { describe, expect, it } from 'vitest';

import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('differenceBy', () => {
  it('should the difference of two arrays using the `mapper` function', () => {
    expect(ArrayUtils.differenceBy([1.2, 2.3, 3.4], [1.2], Math.floor)).toEqual([2.3, 3.4]);
    expect(ArrayUtils.differenceBy([], [1.2], Math.floor)).toEqual([]);
  });
});
