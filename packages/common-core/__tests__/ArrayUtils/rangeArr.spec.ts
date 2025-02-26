import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('#rangeArr()', () => {
    test('make a array', () => {
        expect(ArrayUtils.rangeArr(2)).toEqual([undefined, undefined]);
    });

    test('make a array (default value)', () => {
        expect(ArrayUtils.rangeArr(2, 'string')).toEqual(['string', 'string']);
    });

    test('make a array (default Function)', () => {
        expect(ArrayUtils.rangeArr(2, (i) => 2 * i)).toEqual([0, 2]);
    });

    test('make a array (default Function undefined)', () => {
        expect(ArrayUtils.rangeArr(2, ()=>{})).toEqual([undefined, undefined]);
    });
});
