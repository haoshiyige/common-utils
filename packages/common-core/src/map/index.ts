import { FourKeyMap } from "./FourKeyMap";
import { mapsStrictEqualIgnoreOrder } from "./mapsStrictEqualIgnoreOrder";
import { SetMap } from "./SetMap";
import { ThreeKeyMap } from "./ThreeKeyMap";
import { TwoKeyMap } from "./TwoKeyMap";
import { CounterSet } from "./CounterSet";
import { BidirectionalMap } from "./BidirectionalMap";
import { MRUCache, } from "./MRUCache";
import { LinkedMap } from "./LinkedMap";
import { LRUCache } from "./LRUCache";
import { ResourceSet } from "./ResourceSet";
import { ResourceMap } from "./ResourceMap";

import { SkipList } from "./skipList/index";
import { Permutation } from "./Permutation/index";
import { ArrayQueue } from "./ArrayQueue/index";
import { CallbackIterable } from "./CallbackIterable/index";

import { Memory } from "../Algorithm/Memory"
import { binarySearchIndexOf } from "../Algorithm/Fisher-Yates/index"
import { LRUCache as LRUCacheNode } from "../Algorithm/LRUCache"

import { StopWatch } from "./stopwatch/index"

export class AlgorithmUtils {
    constructor() {

    }

    static StopWatch = StopWatch;
    static LRUCacheNode = LRUCacheNode;
    static Memory = Memory;
    static binarySearchIndexOf = binarySearchIndexOf;
    static Permutation = Permutation;
    static ArrayQueue = ArrayQueue;
    static CallbackIterable = CallbackIterable;
    static SkipList = SkipList;
    static FourKeyMap = FourKeyMap;
    static mapsStrictEqualIgnoreOrder = mapsStrictEqualIgnoreOrder;
    static SetMap = SetMap;
    static ThreeKeyMap = ThreeKeyMap;
    static TwoKeyMap = TwoKeyMap;
    static CounterSet = CounterSet;
    static BidirectionalMap = BidirectionalMap;

    static MRUCache = MRUCache;
    static LinkedMap = LinkedMap;
    static LRUCache = LRUCache;
    static ResourceSet = ResourceSet;
    static ResourceMap = ResourceMap;


    /**
      * 获取或设置 `Map` 中的值。
      * 如果 `Map` 中不存在指定的键，则将键值对添加到 `Map` 中。
      * @param map - 要操作的 `Map` 对象。
      * @param key - 要获取或设置的键。
      * @param value - 当键不存在时要设置的值。
      * @returns 返回 `Map` 中对应键的值。
      * 
      * @example 测试案例
      * const map = new Map<string, number>();
      * const key = 'testKey';
      * const value = 42;
      * const result = getOrSet(map, key, value);
      * console.log(result); // 输出: 42
      * console.log(map.get(key)); // 输出: 42
      */

    static getOrSet<K, V>(map: Map<K, V>, key: K, value: V): V {
        let result = map.get(key);
        if (result === undefined) {
            result = value;
            map.set(key, result);
        }
        return result;
    }

    /**
     * 将 `Map` 对象转换为字符串表示形式。
     * 字符串格式为 `Map(元素个数) {键1 => 值1, 键2 => 值2,...}`。
     * @param map - 要转换的 `Map` 对象。
     * @returns 返回 `Map` 的字符串表示。
     * 
     * @example 测试案例
     * const map = new Map<string, number>();
     * map.set('key1', 1);
     * map.set('key2', 2);
     * const str = mapToString(map);
     * console.log(str); // 输出: Map(2) {key1 => 1, key2 => 2}
     */

    static mapToString<K, V>(map: Map<K, V>): string {
        const entries: string[] = [];
        map.forEach((value, key) => { entries.push(`${key} => ${value}`); });
        return `Map(${map.size}) {${entries.join(', ')}}`;
    }

    /**
     * 将 `Set` 对象转换为字符串表示形式。
     * 字符串格式为 `Set(元素个数) {元素1, 元素2,...}`。
     * @param set - 要转换的 `Set` 对象。
     * @returns 返回 `Set` 的字符串表示。
     * 
     * @example 测试案例
     * const set = new Set<string>();
     * set.add('item1');
     * set.add('item2');
     * const str = setToString(set);
     * console.log(str); // 输出: Set(2) {item1, item2}
     */

    static setToString<K>(set: Set<K>): string {
        const entries: K[] = [];
        set.forEach(value => { entries.push(value); });
        return `Set(${set.size}) {${entries.join(', ')}}`;
    }


}




