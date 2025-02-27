import { FunctionUtils } from '../../src/function/index';
describe('#cacheFn()', () => {
    let index = 0;
    const mockFn = (str: string) => str + index++;
    const fn = FunctionUtils.cacheFn(mockFn);
    test('cacheFn test', () => {
        expect(fn('key')).toEqual('key0');
        expect(fn('key')).toEqual(fn('key'));
        expect(fn).toBeInstanceOf(Function);
        expect(fn('key1')).not.toEqual(fn('key'));
    });
});
