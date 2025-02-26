
import { checkNewCall } from "@nin/shared";

/**
 * @description `SetMap` 类提供了一种将键映射到值集合的结构。
 * 它允许向特定键对应的集合中添加和删除值，遍历特定键对应集合中的所有值，以及获取特定键对应的集合。
 * @template K - 键的类型。
 * @template V - 值的类型。
 */
@checkNewCall()
export class SetMap<K, V> {
    // 内部使用的 `Map`，用于存储键到值集合的映射
    private map = new Map<K, Set<V>>();
    /**
     * 向 `SetMap` 中添加一个键值对。
     * 如果键对应的集合不存在，则创建一个新的集合，然后将值添加到该集合中。
     * @param key - 要添加的键。
     * @param value - 要添加的值。
     * 
     * @example 测试案例
     * const setMap = new SetMap<string, number>();
     * setMap.add('key1', 1);
     * setMap.add('key1', 2);
     * const values = setMap.get('key1');
     * console.log(values.has(1)); // 输出: true
     * console.log(values.has(2)); // 输出: true
     */
    add(key: K, value: V): void {
        let values = this.map.get(key);

        if (!values) {
            values = new Set<V>();
            this.map.set(key, values);
        }

        values.add(value);
    }

    /**
     * 从 `SetMap` 中删除指定键对应集合中的一个值。
     * 如果删除值后集合为空，则同时删除该键。
     * @param key - 要删除值的键。
     * @param value - 要删除的值。
     * 
     * @example 测试案例
     * const setMap = new SetMap<string, number>();
     * setMap.add('key1', 1);
     * setMap.add('key1', 2);
     * setMap.delete('key1', 1);
     * const values = setMap.get('key1');
     * console.log(values.has(1)); // 输出: false
     * console.log(values.has(2)); // 输出: true
     * setMap.delete('key1', 2);
     * const isEmpty = setMap.get('key1').size === 0;
     * console.log(isEmpty); // 输出: true
     */
    delete(key: K, value: V): void {
        const values = this.map.get(key);

        if (!values) {
            return;
        }

        values.delete(value);

        if (values.size === 0) {
            this.map.delete(key);
        }
    }

    /**
     * 对特定键对应集合中的每个值执行给定的回调函数。
     * 如果键对应的集合不存在，则不执行任何操作。
     * @param key - 要遍历的键。
     * @param fn - 回调函数，接收集合中的每个值作为参数。
     * 
     * @example 测试案例
     * const setMap = new SetMap<string, number>();
     * setMap.add('key1', 1);
     * setMap.add('key1', 2);
     * setMap.forEach('key1', (value) => {
     *     console.log(value);
     * });
     * // 输出: 1
     * //       2
     */
    forEach(key: K, fn: (value: V) => void): void {
        const values = this.map.get(key);

        if (!values) {
            return;
        }

        values.forEach(fn);
    }

    /**
     * 获取特定键对应的只读集合。
     * 如果键对应的集合不存在，则返回一个空的集合。
     * @param key - 要获取集合的键。
     * @returns 返回一个只读集合，包含键对应的值。
     * 
     * @example 测试案例
     * const setMap = new SetMap<string, number>();
     * setMap.add('key1', 1);
     * setMap.add('key1', 2);
     * const values = setMap.get('key1');
     * console.log(values.has(1)); // 输出: true
     * console.log(values.has(2)); // 输出: true
     */
    get(key: K): ReadonlySet<V> {
        const values = this.map.get(key);
        if (!values) {
            return new Set<V>();
        }
        return values;
    }
}
