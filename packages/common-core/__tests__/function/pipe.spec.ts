
import { FunctionUtils } from '../../src/function/index';
describe('#pipe()', () => {
    const addTest = async (str: string): Promise<string> => `test ${str} word`;
    const addTest1 = async (str: string): Promise<string> => `test ${str} word1`;
    const pipeline = FunctionUtils.pipe(addTest, addTest1);
    test('pipe test', async () => {
        const data = await pipeline('hello');
        expect(data).toBe('test hello word1');
    });
});
