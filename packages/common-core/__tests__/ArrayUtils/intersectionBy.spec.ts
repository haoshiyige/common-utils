import { describe, expect, it } from 'vitest';

import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('intersectionBy', () => {
  it('should return the intersection of two arrays with `mapper`', () => {
    expect(ArrayUtils.intersectionBy([1.2, 2.1], [1.4, 3.1], Math.floor)).toStrictEqual([1.2]);
    expect(ArrayUtils.intersectionBy([{ foo: 1 }, { foo: 2 }], [{ foo: 1 }, { foo: 3 }], x => x.foo)).toStrictEqual([{ foo: 1 }]);
  });
});
