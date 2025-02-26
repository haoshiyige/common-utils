import { describe, expect, it } from 'vitest';
import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('zip', () => {
  it('zips multiple arrays to create a tuple', () => {
    expect(ArrayUtils.zip([1, 2, 3])).toEqual([[1], [2], [3]]);

    expect(ArrayUtils.zip([1, 2, 3], ['a', 'b', 'c'])).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ]);
    expect(ArrayUtils.zip([1, 2, 3], ['a', 'b'])).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, undefined],
    ]);

    expect(ArrayUtils.zip([1, 2, 3], ['a', 'b', 'c'], [true, true, false])).toEqual([
      [1, 'a', true],
      [2, 'b', true],
      [3, 'c', false],
    ]);
    expect(ArrayUtils.zip([1], ['a'], [true], [null])).toEqual([[1, 'a', true, null]]);
  });
});
