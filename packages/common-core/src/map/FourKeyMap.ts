import { TwoKeyMap } from "./TwoKeyMap";


import { checkNewCall } from "@nin/shared";

/**
 * @description 一个可以通过四个独立键进行寻址的映射类。
 * 在高性能场景中，每次访问数据时创建复合键的成本过高，此时该类非常有用。
 * 它允许通过四个不同的键来存储和检索值，并且提供了清空数据的功能。
 * @template TFirst - 第一个键的类型，必须是 `string` 或 `number`。
 * @template TSecond - 第二个键的类型，必须是 `string` 或 `number`。
 * @template TThird - 第三个键的类型，必须是 `string` 或 `number`。
 * @template TFourth - 第四个键的类型，必须是 `string` 或 `number`。
 * @template TValue - 值的类型。
 */
@checkNewCall()
export class FourKeyMap<TFirst extends string | number, TSecond extends string | number, TThird extends string | number, TFourth extends string | number, TValue> {
    // 用于存储数据的内部对象，是一个嵌套的 `TwoKeyMap` 结构
    private _data: TwoKeyMap<TFirst, TSecond, TwoKeyMap<TThird, TFourth, TValue>> = new TwoKeyMap();

    /**
     * 设置一个值，通过四个键进行定位。
     * 首先检查由第一个键和第二个键确定的 `TwoKeyMap` 是否存在，如果不存在则创建一个新的。
     * 然后在这个新创建或已存在的 `TwoKeyMap` 中，通过第三个键和第四个键设置对应的值。
     * @param first - 第一个键。
     * @param second - 第二个键。
     * @param third - 第三个键。
     * @param fourth - 第四个键。
     * @param value - 要设置的值。
     * 
     * @example 测试案例
     * const fourKeyMap = new FourKeyMap<number, string, number, string, string>();
     * fourKeyMap.set(1, 'key1', 2, 'key2', 'value1');
     * const retrievedValue = fourKeyMap.get(1, 'key1', 2, 'key2');
     * console.log(retrievedValue); // 输出: value1
     */

    public set(first: TFirst, second: TSecond, third: TThird, fourth: TFourth, value: TValue): void {
        if (!this._data.get(first, second)) {
            this._data.set(first, second, new TwoKeyMap());
        }
        this._data.get(first, second)!.set(third, fourth, value);
    }

    /**
     * 通过四个键获取对应的值。
     * 首先根据第一个键和第二个键获取对应的 `TwoKeyMap`，然后从这个 `TwoKeyMap` 中根据第三个键和第四个键获取值。
     * 如果任何一个键对应的对象或值不存在，则返回 `undefined`。
     * @param first - 第一个键。
     * @param second - 第二个键。
     * @param third - 第三个键。
     * @param fourth - 第四个键。
     * @returns 返回对应四个键的值，如果不存在则返回 `undefined`。
     * 
     * @example 测试案例
     * const fourKeyMap = new FourKeyMap<number, string, number, string, string>();
     * fourKeyMap.set(1, 'key1', 2, 'key2', 'value1');
     * const value = fourKeyMap.get(1, 'key1', 2, 'key2');
     * console.log(value); // 输出: value1
     * const nonExistentValue = fourKeyMap.get(3, 'key3', 4, 'key4');
     * console.log(nonExistentValue); // 输出: undefined
     */

    public get(first: TFirst, second: TSecond, third: TThird, fourth: TFourth): TValue | undefined {
        return this._data.get(first, second)?.get(third, fourth);
    }

    /**
     * 清空 `FourKeyMap` 中的所有数据。
     * 调用内部嵌套的 `TwoKeyMap` 的 `clear` 方法，从而删除所有键值对。
     * 
     * @example 测试案例
     * const fourKeyMap = new FourKeyMap<number, string, number, string, string>();
     * fourKeyMap.set(1, 'key1', 2, 'key2', 'value1');
     * fourKeyMap.clear();
     * const valueAfterClear = fourKeyMap.get(1, 'key1', 2, 'key2');
     * console.log(valueAfterClear); // 输出: undefined
     */

    public clear(): void {
        this._data.clear();
    }
}