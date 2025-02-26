import { URI } from '../uri';

/**
 * 用于将 `URI` 转换为字符串的函数类型。
 */
interface ResourceMapKeyFn {
    (resource: URI): string;
}

/**
 * 用于管理资源映射的类，实现了 `Map<URI, T>` 接口。
 * 它允许通过自定义的 `toKey` 函数来确定资源的唯一标识。
 * @template T - 值的类型。
 */

export class ResourceMap<T> implements Map<URI, T> {
    private static readonly defaultToKey = (resource: URI) => resource.toString();
    /**
     * 用于标识对象类型的属性，在 `toString` 方法中使用。
     */
    readonly [Symbol.toStringTag] = 'ResourceMap';
    private readonly map: Map<string, ResourceMapEntry<T>>;
    private readonly toKey: ResourceMapKeyFn;

    /**
     * 创建一个 `ResourceMap` 实例。
     * @param toKey - 自定义的 uri 标识函数，例如使用现有的 `IExtUri#getComparison` 工具。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceMap1 = new ResourceMap(toKeyFunc);
     * console.log(resourceMap1); // 输出: 一个空的 ResourceMap 实例
     */
    constructor(toKey?: ResourceMapKeyFn);

    /**
     * 从另一个 `ResourceMap` 创建一个新的 `ResourceMap` 实例。
     * @param other - 另一个 `ResourceMap` 实例，新的实例将基于此创建。
     * @param toKey - 自定义的 uri 标识函数，例如使用现有的 `IExtUri#getComparison` 工具。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const originalMap = new ResourceMap(toKeyFunc);
     * originalMap.set(new URI('original'), 1);
     * const newMap = new ResourceMap(originalMap, toKeyFunc);
     * console.log(newMap.get(new URI('original'))); // 输出: 1
     */
    constructor(other?: ResourceMap<T>, toKey?: ResourceMapKeyFn);

    /**
     * 从一组键值对创建一个 `ResourceMap` 实例。
     * @param entries - 一组包含 `URI` 和值的键值对。
     * @param toKey - 自定义的 uri 标识函数，例如使用现有的 `IExtUri#getComparison` 工具。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const entries = [[new URI('entry1'), 1], [new URI('entry2'), 2]];
     * const resourceMap2 = new ResourceMap(entries, toKeyFunc);
     * console.log(resourceMap2.get(new URI('entry1'))); // 输出: 1
     */
    constructor(entries?: readonly (readonly [URI, T])[], toKey?: ResourceMapKeyFn);

    constructor(arg?: ResourceMap<T> | ResourceMapKeyFn | readonly (readonly [URI, T])[], toKey?: ResourceMapKeyFn) {
        if (arg instanceof ResourceMap) {
            this.map = new Map(arg.map);
            this.toKey = toKey ?? ResourceMap.defaultToKey;
        } else if (isEntries(arg)) {
            this.map = new Map();
            this.toKey = toKey ?? ResourceMap.defaultToKey;

            for (const [resource, value] of arg) {
                this.set(resource, value);
            }
        } else {
            this.map = new Map();
            this.toKey = arg ?? ResourceMap.defaultToKey;
        }
    }

    /**
     * 设置资源映射中的键值对。
     * @param resource - 资源的 `URI`。
     * @param value - 要设置的值。
     * @returns 返回当前 `ResourceMap` 实例，以便进行链式调用。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceMap = new ResourceMap(toKeyFunc);
     * const uri = new URI('testSet');
     * const val = 10;
     * resourceMap.set(uri, val);
     * console.log(resourceMap.get(uri)); // 输出: 10
     */
    set(resource: URI, value: T): this {
        this.map.set(this.toKey(resource), new ResourceMapEntry(resource, value));
        return this;
    }

    /**
     * 获取资源映射中指定资源的对应值。
     * @param resource - 资源的 `URI`。
     * @returns 返回对应的值，如果不存在则返回 `undefined`。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceMap = new ResourceMap(toKeyFunc);
     * const uri = new URI('testGet');
     * resourceMap.set(uri, 20);
     * const result = resourceMap.get(uri);
     * console.log(result); // 输出: 20
     */
    get(resource: URI): T | undefined {
        return this.map.get(this.toKey(resource))?.value;
    }

    /**
     * 检查资源映射中是否包含指定的资源。
     * @param resource - 资源的 `URI`。
     * @returns 如果包含则返回 `true`，否则返回 `false`。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceMap = new ResourceMap(toKeyFunc);
     * const uri = new URI('testHas');
     * resourceMap.set(uri, 30);
     * const hasResult = resourceMap.has(uri);
     * console.log(hasResult); // 输出: true
     */
    has(resource: URI): boolean {
        return this.map.has(this.toKey(resource));
    }

    /**
     * 获取资源映射中键值对的数量。
     * @returns 返回键值对的数量。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceMap = new ResourceMap(toKeyFunc);
     * resourceMap.set(new URI('count1'), 1);
     * resourceMap.set(new URI('count2'), 2);
     * const size = resourceMap.size;
     * console.log(size); // 输出: 2
     */
    get size(): number {
        return this.map.size;
    }

    /**
     * 清空资源映射中的所有键值对。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceMap = new ResourceMap(toKeyFunc);
     * resourceMap.set(new URI('clear1'), 1);
     * resourceMap.clear();
     * console.log(resourceMap.size); // 输出: 0
     */
    clear(): void {
        this.map.clear();
    }

    /**
     * 删除资源映射中指定资源的键值对。
     * @param resource - 资源的 `URI`。
     * @returns 如果删除成功则返回 `true`，否则返回 `false`。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceMap = new ResourceMap(toKeyFunc);
     * const uri = new URI('delete1');
     * resourceMap.set(uri, 1);
     * const deleteResult = resourceMap.delete(uri);
     * console.log(deleteResult); // 输出: true
     */
    delete(resource: URI): boolean {
        return this.map.delete(this.toKey(resource));
    }

    /**
     * 对资源映射中的每个键值对执行给定的回调函数。
     * @param clb - 回调函数，接收值、键和当前 `Map` 对象作为参数。
     * @param thisArg - 可选的 `this` 绑定对象，用于回调函数。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceMap = new ResourceMap(toKeyFunc);
     * resourceMap.set(new URI('forEach1'), 1);
     * resourceMap.set(new URI('forEach2'), 2);
     * resourceMap.forEach((value, key) => {
     *     console.log(`Key: ${key.toString()}, Value: ${value}`);
     * });
     * // 输出: Key: forEach1, Value: 1
     * //       Key: forEach2, Value: 2
     */
    forEach(clb: (value: T, key: URI, map: Map<URI, T>) => void, thisArg?: any): void {
        if (typeof thisArg !== 'undefined') {
            clb = clb.bind(thisArg);
        }
        for (const [_, entry] of this.map) {
            clb(entry.value, entry.uri, <any>this);
        }
    }

    /**
     * 返回一个迭代器，用于遍历资源映射中的所有值。
     * @returns 一个迭代器，可用于遍历所有值。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceMap = new ResourceMap(toKeyFunc);
     * resourceMap.set(new URI('value1'), 1);
     * resourceMap.set(new URI('value2'), 2);
     * const valuesIterator = resourceMap.values();
     * for (const value of valuesIterator) {
     *     console.log(value);
     * }
     * // 输出: 1
     * //       2
     */
    // @ts-ignore
    *values(): IterableIterator<T> {
        for (const entry of this.map.values()) {
            yield entry.value;
        }
    }

    /**
     * 返回一个迭代器，用于遍历资源映射中的所有键（`URI`）。
     * @returns 一个迭代器，可用于遍历所有键。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceMap = new ResourceMap(toKeyFunc);
     * resourceMap.set(new URI('key1'), 1);
     * resourceMap.set(new URI('key2'), 2);
     * const keysIterator = resourceMap.keys();
     * for (const key of keysIterator) {
     *     console.log(key.toString());
     * }
     * // 输出: key1
     * //       key2
     */
    // @ts-ignore

    *keys(): IterableIterator<URI> {
        for (const entry of this.map.values()) {
            yield entry.uri;
        }
    }

    /**
     * 返回一个迭代器，用于遍历资源映射中的所有键值对。
     * @returns 一个迭代器，可用于遍历所有键值对。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceMap = new ResourceMap(toKeyFunc);
     * resourceMap.set(new URI('entry1'), 1);
     * resourceMap.set(new URI('entry2'), 2);
     * const entriesIterator = resourceMap.entries();
     * for (const [key, value] of entriesIterator) {
     *     console.log(`Key: ${key.toString()}, Value: ${value}`);
     * }
     * // 输出: Key: entry1, Value: 1
     * //       Key: entry2, Value: 2
     */
    // @ts-ignore

    *entries(): IterableIterator<[URI, T]> {
        for (const entry of this.map.values()) {
            yield [entry.uri, entry.value];
        }
    }

    /**
     * 返回一个迭代器，用于遍历资源映射中的所有键值对。
     * 等同于 `entries` 方法。
     * @returns 一个迭代器，可用于遍历所有键值对。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceMap = new ResourceMap(toKeyFunc);
     * resourceMap.set(new URI('iterator1'), 1);
     * resourceMap.set(new URI('iterator2'), 2);
     * const iterator = resourceMap[Symbol.iterator]();
     * for (const [key, value] of iterator) {
     *     console.log(`Key: ${key.toString()}, Value: ${value}`);
     * }
     * // 输出: Key: iterator1, Value: 1
     * //       Key: iterator2, Value: 2
     */
    // @ts-ignore
    *[Symbol.iterator](): IterableIterator<[URI, T]> {
        for (const [_, entry] of this.map) {
            yield [entry.uri, entry.value];
        }
    }
}

/**
 * `ResourceMap` 中的条目类。
 * 表示资源映射中的一个键值对。
 * @template T - 值的类型。
 */

class ResourceMapEntry<T> {
    constructor(readonly uri: URI, readonly value: T) { }
}

/**
 * 判断参数是否为 `readonly (readonly [URI, T])[]` 类型。
 * @template T - 值的类型。
 * @param arg - 要判断的参数。
 * @returns 如果参数是 `readonly (readonly [URI, T])[]` 类型，则返回 `true`，否则返回 `false`。
 * 
 * @example 测试案例
 * const arr: readonly (readonly [URI, number])[] = [[new URI('test'), 1]];
 * const isArr = isEntries(arr);
 * console.log(isArr); // 输出: true
 * const notArr = new ResourceMap<number>();
 * const isNotArr = isEntries(notArr);
 * console.log(isNotArr); // 输出: false
 */

function isEntries<T>(arg: ResourceMap<T> | ResourceMapKeyFn | readonly (readonly [URI, T])[] | undefined): arg is readonly (readonly [URI, T])[] {
    return Array.isArray(arg);
}
