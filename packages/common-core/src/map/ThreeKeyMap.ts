import { TwoKeyMap } from "./TwoKeyMap"
import { checkNewCall } from "@nin/shared";


/**
 * @description 一个可以通过三个独立键进行寻址的映射类。
 * 在高性能场景中，每次访问数据时创建复合键的成本过高，此时该类非常有用。
 * 它允许通过三个不同的键来存储和检索值，并且提供了清空数据和遍历所有值的功能。
 * @template TFirst - 第一个键的类型，必须是 `string` 或 `number`。
 * @template TSecond - 第二个键的类型，必须是 `string` 或 `number`。
 * @template TThird - 第三个键的类型，必须是 `string` 或 `number`。
 * @template TValue - 值的类型。
 */
@checkNewCall()
export class ThreeKeyMap<TFirst extends string | number, TSecond extends string | number, TThird extends string | number, TValue> {
    // 用于存储数据的内部对象，外层键为 `TFirst` 类型，对应的值是 `TwoKeyMap<TSecond, TThird, TValue>` 类型
    private _data: { [key: string | number]: TwoKeyMap<TSecond, TThird, TValue> | undefined } = {};
    /**
     * 设置一个值，通过三个键进行定位。
     * 如果外层键对应的 `TwoKeyMap` 不存在，则创建一个新的 `TwoKeyMap`。
     * 然后通过这个 `TwoKeyMap` 设置第二个键和第三个键对应的值。
     * @param first - 第一个键。
     * @param second - 第二个键。
     * @param third - 第三个键。
     * @param value - 要设置的值。
     * 
     * @example 测试案例
     * const threeKeyMap = new ThreeKeyMap<number, string, number, string>();
     * threeKeyMap.set(1, 'key1', 2, 'value1');
     * const retrievedValue = threeKeyMap.get(1, 'key1', 2);
     * console.log(retrievedValue); // 输出: value1
     */
    public set(first: TFirst, second: TSecond, third: TThird, value: TValue): void {
        if (!this._data[first]) {
            this._data[first] = new TwoKeyMap();
        }
        this._data[first as string | number]!.set(second, third, value);
    }

    /**
     * 通过三个键获取对应的值。
     * 首先根据第一个键找到对应的 `TwoKeyMap`，然后从这个 `TwoKeyMap` 中根据第二个键和第三个键获取值。
     * 如果任何一个键对应的对象或值不存在，则返回 `undefined`。
     * @param first - 第一个键。
     * @param second - 第二个键。
     * @param third - 第三个键。
     * @returns 返回对应三个键的值，如果不存在则返回 `undefined`。
     * 
     * @example 测试案例
     * const threeKeyMap = new ThreeKeyMap<number, string, number, string>();
     * threeKeyMap.set(1, 'key1', 2, 'value1');
     * const value = threeKeyMap.get(1, 'key1', 2);
     * console.log(value); // 输出: value1
     * const nonExistentValue = threeKeyMap.get(3, 'key3', 4);
     * console.log(nonExistentValue); // 输出: undefined
     */

    public get(first: TFirst, second: TSecond, third: TThird): TValue | undefined {
        return this._data[first as string | number]?.get(second, third);
    }

    /**
     * 清空 `ThreeKeyMap` 中的所有数据。
     * 将内部存储数据的对象重置为空对象，从而删除所有键值对。
     * 
     * @example 测试案例
     * const threeKeyMap = new ThreeKeyMap<number, string, number, string>();
     * threeKeyMap.set(1, 'key1', 2, 'value1');
     * threeKeyMap.clear();
     * const valueAfterClear = threeKeyMap.get(1, 'key1', 2);
     * console.log(valueAfterClear); // 输出: undefined
     */

    public clear(): void {
        this._data = {};
    }

    /**
     * 返回一个迭代器，用于遍历 `ThreeKeyMap` 中的所有值。
     * 遍历外层键对应的所有 `TwoKeyMap`，再遍历每个 `TwoKeyMap` 中的所有值，
     * 并将值通过 `yield` 返回。
     * @returns 一个可迭代的迭代器，包含所有存储的值。
     * 
     * @example 测试案例
     * const threeKeyMap = new ThreeKeyMap<number, string, number, string>();
     * threeKeyMap.set(1, 'key1', 2, 'value1');
     * threeKeyMap.set(3, 'key3', 4, 'value2');
     * for (const value of threeKeyMap.values()) {
     *     console.log(value);
     * }
     * // 输出: value1
     * //       value2
     */

    public *values(): IterableIterator<TValue> {
        for (const first in this._data) {
            for (const value of this._data[first]!.values()) {
                if (value) {
                    yield value;
                }
            }
        }
    }

}