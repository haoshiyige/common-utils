import { describe, expect, it } from 'vitest';

import { ArrayUtils } from '../../src/ArrayUtils/common/index';
describe('ArrayUtils.shuffle', () => {
  it('randomizes the order of an array', () => {
    const arr = [1, 2, 3, 4, 5];

    expect(ArrayUtils.shuffle(arr).slice().sort()).toEqual(arr.slice().sort());
  });

  it('does not modify the original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const copiedArr = arr.slice();

    ArrayUtils.shuffle(arr);
    expect(arr).toEqual(copiedArr);
  });
});
