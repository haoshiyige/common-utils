import { describe, expect, it } from 'vitest';
import { ArrayUtils } from '../../src/ArrayUtils/common/index';
describe('zipObject', () => {
  it('creates an object from two arrays of keys and values', () => {
    expect(ArrayUtils.zipObject(['a', 'b', 'c'], [1, 2, 3])).toEqual({ a: 1, b: 2, c: 3 });

    expect(ArrayUtils.zipObject(['a', 'b', 'c'], [1, 2])).toEqual({ a: 1, b: 2, c: undefined });

    expect(ArrayUtils.zipObject(['a', 'b'], [1, 2, 3])).toEqual({ a: 1, b: 2 });
  });
});
