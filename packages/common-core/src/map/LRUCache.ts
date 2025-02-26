import { Cache } from "./MRUCache"
import { checkNewCall } from "@nin/shared";




/**
 * `LRUCache` 是 `Cache` 的具体实现，采用 LRU（Least Recently Used，最近最少使用）策略进行缓存淘汰。
 *
 * 当缓存超出限制时，会移除最久未使用的条目。
 *
 * @typeParam K - 缓存键的类型。
 * @typeParam V - 缓存值的类型。
 */
@checkNewCall()
export class LRUCache<K, V> extends Cache<K, V> {

    /**
     * 构造函数，初始化 LRU 缓存的大小限制和淘汰比例。
     *
     * @param {number} limit - 缓存的最大容量。
     * @param {number} ratio - 淘汰比例，默认为 1（即当缓存超出限制时，完全清空）。
     */

    constructor(limit: number, ratio: number = 1) {
        super(limit, ratio);
    }

    /**
     * 实现 `trim` 方法，采用 LRU 策略移除最久未使用的条目。
     *
     * @param {number} newSize - 修剪后的目标大小。
     */

    protected override trim(newSize: number) {
        this.trimOld(newSize);  // 移除最久未使用的条目
    }

    /**
     * 将键值对插入缓存中，并检查是否需要修剪缓存。
     *
     * @param {K} key - 要插入的键。
     * @param {V} value - 要插入的值。
     * @returns {this} - 返回当前缓存实例。
     */

    override set(key: K, value: V): this {
        super.set(key, value);
        this.checkTrim();  // 插入后检查是否需要修剪
        return this;
    }

}
