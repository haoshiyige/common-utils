import { describe, expect, it } from 'vitest';
import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('ArrayUtils.uniq', () => {
  it('ArrayUtils.uniq function creates unique elements from the array passed as an argument.', () => {
    expect(ArrayUtils.uniq([11, 2, 3, 44, 11, 2, 3])).toEqual([11, 2, 3, 44]);
  });
  it('ArrayUtils.uniq function works with strings.', () => {
    expect(ArrayUtils.uniq(['a', 'b', 'b', 'c', 'a'])).toEqual(['a', 'b', 'c']);
  });
  it('ArrayUtils.uniq function works with boolean values.', () => {
    expect(ArrayUtils.uniq([true, false, true, false, false])).toEqual([true, false]);
  });
  it('ArrayUtils.uniq function works with nullish values.', () => {
    expect(ArrayUtils.uniq([null, undefined, null, undefined])).toEqual([null, undefined]);
  });
  it('ArrayUtils.uniq function works with empty arrays.', () => {
    expect(ArrayUtils.uniq([])).toEqual([]);
  });
  it('ArrayUtils.uniq function works with multiple types.', () => {
    expect(ArrayUtils.uniq([1, 'a', 2, 'b', 1, 'a'])).toEqual([1, 'a', 2, 'b']);
  });
  it('ArrayUtils.uniq function keeps its original order.', () => {
    expect(ArrayUtils.uniq([1, 2, 2, 3, 4, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });
  it('ArrayUtils.uniq function should create a new array.', () => {
    const array = [1, 2, 3];
    const result = ArrayUtils.uniq(array);

    expect(result).toEqual([1, 2, 3]);
    expect(result).not.toBe(array);
  });
  it('ArrayUtils.uniq function should not mutate the original array.', () => {
    const array = [1, 2, 3, 2, 1, 3];
    ArrayUtils.uniq(array);

    expect(array).toEqual([1, 2, 3, 2, 1, 3]);
  });
});
