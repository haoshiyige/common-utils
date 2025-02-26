import { ArrayUtils } from '../../src/ArrayUtils/common/index';

describe('#toArray()', () => {
    test('like array (tag) to array', () => {
        const tags = document.querySelectorAll('span');
        const list = Array.isArray(ArrayUtils.toArray(tags));
        expect(Array.isArray(tags)).toBeFalsy();
        expect(list).toBeTruthy();
    });

    test('like array to array', () => {
        const list = Array.isArray(ArrayUtils.toArray({ length: 2, 0: 1, 1: 2 }));
        expect(list).toBeTruthy();
    });
});
