import { describe, expect, it } from 'vitest';


import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('unzipWith', () => {
  it('should unzip arrays correctly with an iteratee', () => {
    const zipped = ArrayUtils.zip([10, 20, 30], [40, 50, 60], [70, 80, 90]);
    const result = ArrayUtils.unzipWith(zipped, (item, item2, item3) => item + item2 + item3);

    expect(result).toEqual([60, 150, 240]);
  });

  it('should handle arrays of different lengths', () => {
    const zipped = ArrayUtils.zip([1, 20, 300, 4000], [100, 200, 300]);
    const result = ArrayUtils.unzipWith(zipped, (item, item2, item3, item4) => item + item2 + item3 + item4);

    expect(result).toEqual([4321, NaN]);
  });
});
