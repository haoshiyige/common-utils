import { describe, expect, test } from 'vitest';
import { ArrayUtils } from '../../src/ArrayUtils/common/index';
describe('ArrayUtils.toFilled function tests', () => {
  test('handles empty array', () => {
    const result = ArrayUtils.toFilled([], '*');
    expect(result).toEqual([]);
  });

  test('fills middle values', () => {
    const result = ArrayUtils.toFilled([1, 2, 3, 4, 5], '*', 1, 4);
    expect(result).toEqual([1, '*', '*', '*', 5]);
  });

  test('fills entire array', () => {
    const result = ArrayUtils.toFilled([1, 2, 3, 4, 5], '*');
    expect(result).toEqual(['*', '*', '*', '*', '*']);
  });

  test('fills from specified start position', () => {
    const result = ArrayUtils.toFilled([1, 2, 3, 4, 5], '*', 2);
    expect(result).toEqual([1, 2, '*', '*', '*']);
  });

  test('handles negative start position', () => {
    const result = ArrayUtils.toFilled([1, 2, 3, 4, 5], '*', -3);
    expect(result).toEqual([1, 2, '*', '*', '*']);
  });

  test('handles positive start and negative end positions', () => {
    const result = ArrayUtils.toFilled([1, 2, 3, 4, 5], '*', 1, -1);
    expect(result).toEqual([1, '*', '*', '*', 5]);
  });

  test('handles both negative start and end positions', () => {
    const result = ArrayUtils.toFilled([1, 2, 3, 4, 5], '*', -4, -1);
    expect(result).toEqual([1, '*', '*', '*', 5]);
  });
});
