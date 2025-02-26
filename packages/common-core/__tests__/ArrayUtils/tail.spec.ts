import { describe, expect, it } from 'vitest';
import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('ArrayUtils.tail', () => {
  it('returns all elements except the first', () => {
    expect(ArrayUtils.tail([1, 2, 3])).toEqual([2, 3]);

    expect(ArrayUtils.tail([true, false, true])).toEqual([false, true]);

    expect(ArrayUtils.tail([1])).toEqual([]);

    expect(ArrayUtils.tail([])).toEqual([]);
  });
});
