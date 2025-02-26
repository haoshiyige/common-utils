import { describe, expect, it } from 'vitest';
import { ArrayUtils } from '../../src/ArrayUtils/common/index';
describe('uniqBy', () => {
  it('should work with a `mapper`', () => {
    expect(ArrayUtils.uniqBy([2.1, 1.2, 2.3], Math.floor)).toEqual([2.1, 1.2]);
  });
});
