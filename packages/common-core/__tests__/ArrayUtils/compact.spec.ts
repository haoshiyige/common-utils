import { describe, it, expect } from 'vitest';

import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('compact', () => {
  it('removes falsey values from array', () => {
    expect(ArrayUtils.compact([0, 1, false, 2, '', 3, null, undefined, 4, NaN, 5])).toEqual([1, 2, 3, 4, 5]);
    expect(ArrayUtils.compact([false, 0, '', null, undefined, NaN])).toEqual([]);
    expect(ArrayUtils.compact([0, { name: 'John' }, false, 'hello', null, { age: 30 }, undefined, NaN])).toEqual([
      { name: 'John' },
      'hello',
      { age: 30 },
    ]);
  });
});
