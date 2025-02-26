import { describe, expect, it } from 'vitest';

import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('differenceWith', () => {
  it('should the difference of two arrays using the `areItemsEqual` function', () => {
    expect(ArrayUtils.differenceWith([1.2, 2.3, 3.4], [1.2], (x, y) => Math.floor(x) === Math.floor(y))).toEqual([2.3, 3.4]);
  });
});
