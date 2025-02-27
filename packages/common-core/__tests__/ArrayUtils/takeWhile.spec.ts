import { describe, it, expect } from 'vitest';
 // adjust the import path as necessary
import { ArrayUtils } from '../../src/ArrayUtils/common/index';
describe('ArrayUtils.takeWhile', () => {
  it('should return elements while the predicate is true', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = ArrayUtils.takeWhile(arr, x => x < 4);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should return an empty array if the first element does not satisfy the predicate', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = ArrayUtils.takeWhile(arr, x => x > 4);
    expect(result).toEqual([]);
  });

  it('should return all elements if all satisfy the predicate', () => {
    const arr = [1, 2, 3];
    const result = ArrayUtils.takeWhile(arr, x => x < 4);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should return an empty array if the input array is empty', () => {
    const arr: number[] = [];
    const result = ArrayUtils.takeWhile(arr, x => x < 4);
    expect(result).toEqual([]);
  });

  it('should handle complex predicate functions', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    const result = ArrayUtils.takeWhile(arr, item => item.id < 3);
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
