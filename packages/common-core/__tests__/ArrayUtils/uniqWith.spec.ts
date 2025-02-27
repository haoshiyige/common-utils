import { describe, expect, it } from 'vitest';
import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('uniqWith', () => {
  it('should work with a `comparator`', () => {
    expect(
      ArrayUtils.uniqWith(
        [
          { x: 1, y: 2 },
          { x: 1, y: 3 },
        ],
        (a, b) => a.x === b.x
      )
    ).toEqual([{ x: 1, y: 2 }]);
    expect(ArrayUtils.uniqWith([1.2, 1.5, 2.1, 3.2, 5.7, 5.3, 7.19], (a, b) => Math.abs(a - b) < 1)).toEqual([
      1.2, 3.2, 5.7, 7.19,
    ]);
  });
});
