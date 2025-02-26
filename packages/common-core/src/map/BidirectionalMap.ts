import { checkNewCall } from "@nin/shared";



/**
 *  @description 一个支持通过键和值进行双向访问的映射类。
 * 注意：值必须是唯一的。
 * @template K - 键的类型。
 * @template V - 值的类型。
 */
@checkNewCall()
export class BidirectionalMap<K, V> {
    // 用于存储键到值的映射
    private readonly _m1 = new Map<K, V>();
    // 用于存储值到键的映射
    private readonly _m2 = new Map<V, K>();

    /**
     * 创建一个 `BidirectionalMap` 实例。
     * @param entries - 可选的初始键值对数组，用于初始化映射。
     * 
     * @example 测试案例
     * const entries = [['key1', 'value1'], ['key2', 'value2']];
     * const bidirectionalMap = new BidirectionalMap(entries);
     * console.log(bidirectionalMap.get('key1')); // 输出: value1
     * console.log(bidirectionalMap.getKey('value2')); // 输出: key2
     */

    constructor(entries?: readonly (readonly [K, V])[]) {
        if (entries) {
            for (const [key, value] of entries) {
                this.set(key, value);
            }
        }
    }

    /**
     * 清空 `BidirectionalMap` 中的所有键值对。
     * 同时清空存储键到值和值到键的两个映射。
     * 
     * @example 测试案例
     * const bidirectionalMap = new BidirectionalMap<string, number>();
     * bidirectionalMap.set('key1', 1);
     * bidirectionalMap.clear();
     * console.log(bidirectionalMap.get('key1')); // 输出: undefined
     * console.log(bidirectionalMap.getKey(1)); // 输出: undefined
     */

    clear(): void {
        this._m1.clear();
        this._m2.clear();
    }

    /**
     * 设置键值对。
     * 同时在键到值和值到键的两个映射中添加相应的映射。
     * @param key - 要设置的键。
     * @param value - 要设置的值。
     * 
     * @example 测试案例
     * const bidirectionalMap = new BidirectionalMap<string, number>();
     * bidirectionalMap.set('key1', 1);
     * console.log(bidirectionalMap.get('key1')); // 输出: 1
     * console.log(bidirectionalMap.getKey(1)); // 输出: key1
     */
    
    set(key: K, value: V): void {
        this._m1.set(key, value);
        this._m2.set(value, key);
    }

    /**
     * 根据键获取对应的值。
     * @param key - 要获取值的键。
     * @returns 返回对应键的值，如果键不存在则返回 `undefined`。
     * 
     * @example 测试案例
     * const bidirectionalMap = new BidirectionalMap<string, number>();
     * bidirectionalMap.set('key1', 1);
     * console.log(bidirectionalMap.get('key1')); // 输出: 1
     */
    get(key: K): V | undefined {
        return this._m1.get(key);
    }

    /**
     * 根据值获取对应的键。
     * @param value - 要获取键的值。
     * @returns 返回对应值的键，如果值不存在则返回 `undefined`。
     * 
     * @example 测试案例
     * const bidirectionalMap = new BidirectionalMap<string, number>();
     * bidirectionalMap.set('key1', 1);
     * console.log(bidirectionalMap.getKey(1)); // 输出: key1
     */
    getKey(value: V): K | undefined {
        return this._m2.get(value);
    }

    /**
     * 删除指定键的键值对。
     * 同时从键到值和值到键的两个映射中删除相应的映射。
     * @param key - 要删除的键。
     * @returns 如果删除成功则返回 `true`，否则返回 `false`。
     * 
     * @example 测试案例
     * const bidirectionalMap = new BidirectionalMap<string, number>();
     * bidirectionalMap.set('key1', 1);
     * console.log(bidirectionalMap.delete('key1')); // 输出: true
     * console.log(bidirectionalMap.get('key1')); // 输出: undefined
     * console.log(bidirectionalMap.getKey(1)); // 输出: undefined
     */
    delete(key: K): boolean {
        const value = this._m1.get(key);
        if (value === undefined) {
            return false;
        }
        this._m1.delete(key);
        this._m2.delete(value);
        return true;
    }

    /**
     * 对 `BidirectionalMap` 中的每个键值对执行给定的回调函数。
     * @param callbackfn - 回调函数，接收值、键和当前 `BidirectionalMap` 对象作为参数。
     * @param thisArg - 可选的 `this` 绑定对象，用于回调函数。
     * 
     * @example 测试案例
     * const bidirectionalMap = new BidirectionalMap<string, number>();
     * bidirectionalMap.set('key1', 1);
     * bidirectionalMap.set('key2', 2);
     * bidirectionalMap.forEach((value, key) => {
     *     console.log(`Key: ${key}, Value: ${value}`);
     * });
     * // 输出: Key: key1, Value: 1
     * //       Key: key2, Value: 2
     */
    forEach(callbackfn: (value: V, key: K, map: BidirectionalMap<K, V>) => void, thisArg?: any): void {
        this._m1.forEach((value, key) => {
            callbackfn.call(thisArg, value, key, this);
        });
    }

    /**
     * 返回一个迭代器，用于遍历 `BidirectionalMap` 中的所有键。
     * @returns 一个迭代器，可用于遍历所有键。
     * 
     * @example 测试案例
     * const bidirectionalMap = new BidirectionalMap<string, number>();
     * bidirectionalMap.set('key1', 1);
     * bidirectionalMap.set('key2', 2);
     * const keysIterator = bidirectionalMap.keys();
     * for (const key of keysIterator) {
     *     console.log(key);
     * }
     * // 输出: key1
     * //       key2
     */
    keys(): IterableIterator<K> {
        return this._m1.keys();
    }

    /**
     * 返回一个迭代器，用于遍历 `BidirectionalMap` 中的所有值。
     * @returns 一个迭代器，可用于遍历所有值。
     * 
     * @example 测试案例
     * const bidirectionalMap = new BidirectionalMap<string, number>();
     * bidirectionalMap.set('key1', 1);
     * bidirectionalMap.set('key2', 2);
     * const valuesIterator = bidirectionalMap.values();
     * for (const value of valuesIterator) {
     *     console.log(value);
     * }
     * // 输出: 1
     * //       2
     */
    values(): IterableIterator<V> {
        return this._m1.values();
    }
}
