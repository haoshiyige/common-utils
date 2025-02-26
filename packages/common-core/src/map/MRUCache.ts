
import { LinkedMap, Touch } from "./LinkedMap";
import { checkNewCall } from "@nin/shared";


/**
 * `Cache` 是一个抽象类，表示一个带有限制大小的缓存。
 *
 * 该类继承自 `LinkedMap<K, V>`，并提供了缓存的基本功能，如设置大小限制、调整淘汰比例等。
 * 它还定义了 `trim` 方法，用于根据不同的策略移除旧条目，但具体的实现由子类提供。
 *
 * @typeParam K - 缓存键的类型。
 * @typeParam V - 缓存值的类型。
 */
export abstract class Cache<K, V> extends LinkedMap<K, V> {
    protected _limit: number;  // 缓存的最大容量
    protected _ratio: number;  // 淘汰比例（0 到 1 之间）

    /**
     * 构造函数，初始化缓存的大小限制和淘汰比例。
     *
     * @param {number} limit - 缓存的最大容量。
     * @param {number} ratio - 淘汰比例，默认为 1（即当缓存超出限制时，完全清空）。
     */
    constructor(limit: number, ratio: number = 1) {
        super();
        this._limit = limit;
        this._ratio = Math.min(Math.max(0, ratio), 1);  // 确保 ratio 在 0 到 1 之间
    }

    /**
     * 获取缓存的最大容量。
     */
    get limit(): number {
        return this._limit;
    }

    /**
     * 设置缓存的最大容量，并检查是否需要修剪缓存。
     *
     * @param {number} limit - 新的最大容量。
     */
    set limit(limit: number) {
        this._limit = limit;
        this.checkTrim();  // 调整容量后检查是否需要修剪
    }

    /**
     * 获取淘汰比例。
     */
    get ratio(): number {
        return this._ratio;
    }

    /**
     * 设置淘汰比例，并检查是否需要修剪缓存。
     *
     * @param {number} ratio - 新的淘汰比例（0 到 1 之间）。
     */
    set ratio(ratio: number) {
        this._ratio = Math.min(Math.max(0, ratio), 1);  // 确保 ratio 在 0 到 1 之间
        this.checkTrim();  // 调整比例后检查是否需要修剪
    }

    /**
     * 获取缓存中的值，并根据 `touch` 参数决定是否将该条目视为“新”条目。
     *
     * @param {K} key - 要获取的键。
     * @param {Touch} touch - 是否将该条目视为“新”条目，默认为 `Touch.AsNew`。
     * @returns {V | undefined} - 如果存在该键，则返回对应的值；否则返回 `undefined`。
     */
    override get(key: K, touch: Touch = Touch.AsNew): V | undefined {
        return super.get(key, touch);
    }

    /**
     * 获取缓存中的值，但不更新其访问时间（即不将其视为“新”条目）。
     *
     * @param {K} key - 要获取的键。
     * @returns {V | undefined} - 如果存在该键，则返回对应的值；否则返回 `undefined`。
     */
    peek(key: K): V | undefined {
        return super.get(key, Touch.None);
    }

    /**
     * 将键值对插入缓存中，并将其视为“新”条目。
     *
     * @param {K} key - 要插入的键。
     * @param {V} value - 要插入的值。
     * @returns {this} - 返回当前缓存实例。
     */
    override set(key: K, value: V): this {
        super.set(key, value, Touch.AsNew);
        return this;
    }

    /**
     * 检查缓存是否超出限制，如果超出则调用 `trim` 方法进行修剪。
     */
    protected checkTrim() {
        if (this.size > this._limit) {
            this.trim(Math.round(this._limit * this._ratio));  // 根据淘汰比例修剪缓存
        }
    }

    /**
     * 抽象方法，用于根据不同的策略移除旧条目。
     *
     * 具体的实现由子类提供。
     *
     * @param {number} newSize - 修剪后的目标大小。
     */
    protected abstract trim(newSize: number): void;
}

/**
 * `MRUCache` 是 `Cache` 的具体实现，采用 MRU（Most Recently Used，最近最常使用）策略进行缓存淘汰。
 *
 * 当缓存超出限制时，会移除最近最常使用的条目。
 *
 * @typeParam K - 缓存键的类型。
 * @typeParam V - 缓存值的类型。
 */
@checkNewCall()
export class MRUCache<K, V> extends Cache<K, V> {

    /**
     * 构造函数，初始化 MRU 缓存的大小限制和淘汰比例。
     *
     * @param {number} limit - 缓存的最大容量。
     * @param {number} ratio - 淘汰比例，默认为 1（即当缓存超出限制时，完全清空）。
     */
    constructor(limit: number, ratio: number = 1) {
        super(limit, ratio);
    }

    /**
     * 实现 `trim` 方法，采用 MRU 策略移除最近最常使用的条目。
     *
     * @param {number} newSize - 修剪后的目标大小。
     */
    protected override trim(newSize: number) {
        this.trimNew(newSize);  // 移除最近最常使用的条目
    }

    /**
     * 将键值对插入缓存中，并在插入前检查是否需要修剪缓存。
     *
     * @param {K} key - 要插入的键。
     * @param {V} value - 要插入的值。
     * @returns {this} - 返回当前缓存实例。
     */
    override set(key: K, value: V): this {
        if (this._limit <= this.size && !this.has(key)) {
            this.trim(Math.round(this._limit * this._ratio) - 1);  // 如果缓存已满且键不存在，则先修剪
        }

        super.set(key, value);
        return this;
    }
}

