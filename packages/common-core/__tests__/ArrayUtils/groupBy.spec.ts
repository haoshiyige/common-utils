import { describe, expect, it } from 'vitest';

import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('ArrayUtils.groupBy', () => {
  it('should group elements by a given key', () => {
    const array = [
      { category: 'fruit', name: 'apple' },
      { category: 'fruit', name: 'banana' },
      { category: 'vegetable', name: 'carrot' },
      { category: 'fruit', name: 'pear' },
      { category: 'vegetable', name: 'broccoli' },
    ];

    const result = ArrayUtils.groupBy(array, item => item.category);

    expect(result).toEqual({
      fruit: [
        { category: 'fruit', name: 'apple' },
        { category: 'fruit', name: 'banana' },
        { category: 'fruit', name: 'pear' },
      ],
      vegetable: [
        { category: 'vegetable', name: 'carrot' },
        { category: 'vegetable', name: 'broccoli' },
      ],
    });
  });

  it('should handle an empty array', () => {
    const array: Array<{ category: string; name: string }> = [];

    const result = ArrayUtils.groupBy(array, item => item.category);

    expect(result).toEqual({});
  });

  it('should handle an array with one element', () => {
    const array = [{ category: 'fruit', name: 'apple' }];

    const result = ArrayUtils.groupBy(array, item => item.category);

    expect(result).toEqual({
      fruit: [{ category: 'fruit', name: 'apple' }],
    });
  });

  it('should group elements by a numeric key', () => {
    const array = [
      { score: 1, name: 'John' },
      { score: 2, name: 'Jane' },
      { score: 1, name: 'Joe' },
    ];

    const result = ArrayUtils.groupBy(array, item => item.score);

    expect(result).toEqual({
      '1': [
        { score: 1, name: 'John' },
        { score: 1, name: 'Joe' },
      ],
      '2': [{ score: 2, name: 'Jane' }],
    });
  });

  it('should group elements by a symbol key', () => {
    const TYPE_A = Symbol();
    const TYPE_B = Symbol();
    const array = [
      { type: TYPE_A, score: 1, name: 'John' },
      { type: TYPE_A, score: 2, name: 'Jane' },
      { type: TYPE_B, score: 1, name: 'Joe' },
    ];

    const result = ArrayUtils.groupBy(array, item => item.type);

    expect(result).toEqual({
      [TYPE_A]: [
        { type: TYPE_A, score: 1, name: 'John' },
        { type: TYPE_A, score: 2, name: 'Jane' },
      ],
      [TYPE_B]: [{ type: TYPE_B, score: 1, name: 'Joe' }],
    });
  });

  it('should handle duplicate keys correctly', () => {
    const array = [
      { category: 'fruit', name: 'apple' },
      { category: 'fruit', name: 'apple' },
    ];

    const result = ArrayUtils.groupBy(array, item => item.category);

    expect(result).toEqual({
      fruit: [
        { category: 'fruit', name: 'apple' },
        { category: 'fruit', name: 'apple' },
      ],
    });
  });
});
