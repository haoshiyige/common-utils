import { describe, expect, it } from 'vitest';
import { ArrayUtils } from '../../src/ArrayUtils/common/index';
describe('unionWith', () => {
  it('should work with a `comparator`', () => {
    expect(
      ArrayUtils.unionWith(
        [
          { x: 1, y: 2 },
          { x: 2, y: 1 },
        ],
        [
          { x: 1, y: 1 },
          { x: 1, y: 2 },
        ],
        (a, b) => a.x === b.x
      )
    ).toEqual([
      { x: 1, y: 2 },
      { x: 2, y: 1 },
    ]);
  });
});
