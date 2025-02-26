
import { checkNewCall } from "@nin/shared";



/**
 * @description 一个可以通过两个独立键进行寻址的映射类。
 * 在高性能场景中，每次访问数据时创建复合键的成本过高，此时该类非常有用。
 * 它允许通过两个不同的键来存储和检索值，并且提供了清空数据和遍历所有值的功能。
 * @template TFirst - 第一个键的类型，必须是 `string` 或 `number`。
 * @template TSecond - 第二个键的类型，必须是 `string` 或 `number`。
 * @template TValue - 值的类型。
 */
@checkNewCall()
export class TwoKeyMap<TFirst extends string | number, TSecond extends string | number, TValue> {
    // 用于存储数据的内部对象，它是一个嵌套的对象结构，外层键为 `TFirst` 类型，内层键为 `TSecond` 类型
    private _data: { [key: string | number]: { [key: string | number]: TValue | undefined } | undefined } = {};

    /**
     * 设置一个值，通过两个键进行定位。
     * 如果外层键对应的对象不存在，则创建一个新的对象。
     * 然后将值存储在内层键对应的位置。
     * @param first - 第一个键。
     * @param second - 第二个键。
     * @param value - 要设置的值。
     * 
     * @example 测试案例
     * const twoKeyMap = new TwoKeyMap<number, string, string>();
     * twoKeyMap.set(1, 'key1', 'value1');
     * const retrievedValue = twoKeyMap.get(1, 'key1');
     * console.log(retrievedValue); // 输出: value1
     */

    public set(first: TFirst, second: TSecond, value: TValue): void {
        if (!this._data[first]) {
            this._data[first] = {};
        }
        this._data[first as string | number]![second] = value;
    }

    /**
     * 通过两个键获取对应的值。
     * 首先根据第一个键找到对应的内层对象，然后从内层对象中根据第二个键获取值。
     * 如果任何一个键对应的对象或值不存在，则返回 `undefined`。
     * @param first - 第一个键。
     * @param second - 第二个键。
     * @returns 返回对应两个键的值，如果不存在则返回 `undefined`。
     * 
     * @example 测试案例
     * const twoKeyMap = new TwoKeyMap<number, string, string>();
     * twoKeyMap.set(1, 'key1', 'value1');
     * const value = twoKeyMap.get(1, 'key1');
     * console.log(value); // 输出: value1
     * const nonExistentValue = twoKeyMap.get(2, 'key2');
     * console.log(nonExistentValue); // 输出: undefined
     */

    public get(first: TFirst, second: TSecond): TValue | undefined {
        return this._data[first as string | number]?.[second];
    }

    /**
     * 清空 `TwoKeyMap` 中的所有数据。
     * 将内部存储数据的对象重置为空对象。
     * 
     * @example 测试案例
     * const twoKeyMap = new TwoKeyMap<number, string, string>();
     * twoKeyMap.set(1, 'key1', 'value1');
     * twoKeyMap.clear();
     * const valueAfterClear = twoKeyMap.get(1, 'key1');
     * console.log(valueAfterClear); // 输出: undefined
     */

    public clear(): void {
        this._data = {};
    }

    /**
     * 返回一个迭代器，用于遍历 `TwoKeyMap` 中的所有值。
     * 遍历外层键对应的所有对象，再遍历每个内层对象中的所有值，
     * 并将值通过 `yield` 返回。
     * @returns 一个可迭代的迭代器，包含所有存储的值。
     * 
     * @example 测试案例
     * const twoKeyMap = new TwoKeyMap<number, string, string>();
     * twoKeyMap.set(1, 'key1', 'value1');
     * twoKeyMap.set(2, 'key2', 'value2');
     * for (const value of twoKeyMap.values()) {
     *     console.log(value);
     * }
     * // 输出: value1
     * //       value2
     */

    public *values(): IterableIterator<TValue> {
        for (const first in this._data) {
            for (const second in this._data[first]) {
                const value = this._data[first]![second];
                if (value) {
                    yield value;
                }
            }
        }
    }
}
