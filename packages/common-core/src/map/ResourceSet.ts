import { URI } from '../uri';
import { ResourceMap } from "./ResourceMap";
import { checkNewCall } from "@nin/shared";

/**
 * 用于将 `URI` 转换为字符串的函数类型。
 */
interface ResourceMapKeyFn {
    (resource: URI): string;
}

/**
 * 用于管理资源集合的类，实现了 `Set<URI>` 接口。
 * 它基于 `ResourceMap` 实现，每个资源在集合中都有一个对应的自身值。
 */
@checkNewCall()
export class ResourceSet implements Set<URI> {
    /**
     * 用于标识对象类型的属性，在 `toString` 方法中使用。
     */
    readonly [Symbol.toStringTag]: string = 'ResourceSet';

    private readonly _map: ResourceMap<URI>;

    /**
     * 创建一个 `ResourceSet` 实例。
     * @param toKey - 自定义的 uri 标识函数，例如使用现有的 `IExtUri#getComparison` 工具。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceSet = new ResourceSet(toKeyFunc);
     * console.log(resourceSet.size); // 输出: 0
     */
    constructor(toKey?: ResourceMapKeyFn);

    /**
     * 从一组资源创建一个 `ResourceSet` 实例。
     * @param entries - 一组资源的 `URI`。
     * @param toKey - 自定义的 uri 标识函数，例如使用现有的 `IExtUri#getComparison` 工具。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const entries = [new URI('entry1'), new URI('entry2')];
     * const resourceSet = new ResourceSet(entries, toKeyFunc);
     * console.log(resourceSet.size); // 输出: 2
     */
    constructor(entries: readonly URI[], toKey?: ResourceMapKeyFn);

    /**
     * 创建一个 `ResourceSet` 实例。
     * @param entriesOrKey - 可以是一组资源的 `URI` 或者一个自定义的 uri 标识函数。
     * @param toKey - 自定义的 uri 标识函数，例如使用现有的 `IExtUri#getComparison` 工具。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const entries = [new URI('entry1')];
     * const resourceSet = new ResourceSet(entries, toKeyFunc);
     * console.log(resourceSet.has(new URI('entry1'))); // 输出: true
     */
    constructor(entriesOrKey?: readonly URI[] | ResourceMapKeyFn, toKey?: ResourceMapKeyFn) {
        if (!entriesOrKey || typeof entriesOrKey === 'function') {
            this._map = new ResourceMap(entriesOrKey);
        } else {
            this._map = new ResourceMap(toKey);
            entriesOrKey.forEach(this.add, this);
        }
    }

    /**
     * 获取资源集合中元素的数量。
     * 该数量等于内部 `ResourceMap` 的大小。
     * @returns 返回资源集合中元素的数量。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceSet = new ResourceSet(toKeyFunc);
     * resourceSet.add(new URI('add1'));
     * resourceSet.add(new URI('add2'));
     * const size = resourceSet.size;
     * console.log(size); // 输出: 2
     */
    get size(): number {
        return this._map.size;
    }

    /**
     * 向资源集合中添加一个资源。
     * 实际上是在内部的 `ResourceMap` 中设置键值对，键和值都是该资源的 `URI`。
     * @param value - 要添加的资源的 `URI`。
     * @returns 返回当前 `ResourceSet` 实例，以便进行链式调用。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceSet = new ResourceSet(toKeyFunc);
     * const uri = new URI('addTest');
     * resourceSet.add(uri);
     * console.log(resourceSet.has(uri)); // 输出: true
     */
    add(value: URI): this {
        this._map.set(value, value);
        return this;
    }

    /**
     * 清空资源集合中的所有元素。
     * 实际上是清空内部的 `ResourceMap`。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceSet = new ResourceSet(toKeyFunc);
     * resourceSet.add(new URI('clear1'));
     * resourceSet.clear();
     * console.log(resourceSet.size); // 输出: 0
     */
    clear(): void {
        this._map.clear();
    }

    /**
     * 从资源集合中删除一个资源。
     * 实际上是在内部的 `ResourceMap` 中删除对应的键值对。
     * @param value - 要删除的资源的 `URI`。
     * @returns 如果删除成功则返回 `true`，否则返回 `false`。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceSet = new ResourceSet(toKeyFunc);
     * const uri = new URI('delete1');
     * resourceSet.add(uri);
     * const deleteResult = resourceSet.delete(uri);
     * console.log(deleteResult); // 输出: true
     */
    delete(value: URI): boolean {
        return this._map.delete(value);
    }

    /**
     * 对资源集合中的每个元素执行给定的回调函数。
     * 回调函数接收当前元素、当前元素自身（等同于第一个参数）和当前 `Set` 对象作为参数。
     * @param callbackfn - 回调函数。
     * @param thisArg - 可选的 `this` 绑定对象，用于回调函数。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceSet = new ResourceSet(toKeyFunc);
     * resourceSet.add(new URI('forEach1'));
     * resourceSet.add(new URI('forEach2'));
     * resourceSet.forEach((value, value2, set) => {
     *     console.log(`Value: ${value.toString()}, Value2: ${value2.toString()}, Set: ${set.toString()}`);
     * });
     * // 输出示例:
     * // Value: forEach1, Value2: forEach1, Set: ResourceSet
     * // Value: forEach2, Value2: forEach2, Set: ResourceSet
     */
    forEach(callbackfn: (value: URI, value2: URI, set: Set<URI>) => void, thisArg?: any): void {
        // @ts-ignore
        this._map.forEach((_value, key) => callbackfn.call(thisArg, key, key, this));
    }

    /**
     * 检查资源集合中是否包含指定的资源。
     * 实际上是检查内部 `ResourceMap` 中是否包含该键。
     * @param value - 要检查的资源的 `URI`。
     * @returns 如果包含则返回 `true`，否则返回 `false`。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceSet = new ResourceSet(toKeyFunc);
     * const uri = new URI('hasTest');
     * resourceSet.add(uri);
     * const hasResult = resourceSet.has(uri);
     * console.log(hasResult); // 输出: true
     */


    has(value: URI): boolean {
        return this._map.has(value);
    }

    /**
     * 返回一个迭代器，用于遍历资源集合中的所有元素，每个元素以 `[URI, URI]` 的形式返回。
     * 实际上是返回内部 `ResourceMap` 的 `entries` 迭代器。
     * @returns 一个迭代器，可用于遍历所有元素。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceSet = new ResourceSet(toKeyFunc);
     * resourceSet.add(new URI('entryIter1'));
     * resourceSet.add(new URI('entryIter2'));
     * const entriesIterator = resourceSet.entries();
     * for (const [uri1, uri2] of entriesIterator) {
     *     console.log(`URI1: ${uri1.toString()}, URI2: ${uri2.toString()}`);
     * }
     * // 输出示例:
     * // URI1: entryIter1, URI2: entryIter1
     * // URI1: entryIter2, URI2: entryIter2
     */
    // @ts-ignore

    public entries(): IterableIterator<[URI, URI]> {
        return this._map.entries();
    }

    /**
     * 返回一个迭代器，用于遍历资源集合中的所有元素（`URI`）。
     * 实际上是返回内部 `ResourceMap` 的 `keys` 迭代器。
     * @returns 一个迭代器，可用于遍历所有元素。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceSet = new ResourceSet(toKeyFunc);
     * resourceSet.add(new URI('keyIter1'));
     * resourceSet.add(new URI('keyIter2'));
     * const keysIterator = resourceSet.keys();
     * for (const key of keysIterator) {
     *     console.log(key.toString());
     * }
     * // 输出示例:
     * // keyIter1
     * // keyIter2
     */
    // @ts-ignore
    public keys(): IterableIterator<URI> {
        return this._map.keys();
    }

    /**
     * 返回一个迭代器，用于遍历资源集合中的所有元素（`URI`）。
     * 实际上是返回内部 `ResourceMap` 的 `keys` 迭代器，因为每个元素在 `ResourceSet` 中对应一个 `URI`。
     * @returns 一个迭代器，可用于遍历所有元素。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceSet = new ResourceSet(toKeyFunc);
     * resourceSet.add(new URI('valueIter1'));
     * resourceSet.add(new URI('valueIter2'));
     * const valuesIterator = resourceSet.values();
     * for (const value of valuesIterator) {
     *     console.log(value.toString());
     * }
     * // 输出示例:
     * // valueIter1
     * // valueIter2
     */
    // @ts-ignore
    public values(): IterableIterator<URI> {
        return this._map.keys();
    }

    /**
     * 返回一个迭代器，用于遍历资源集合中的所有元素（`URI`）。
     * 等同于 `keys` 方法，实际上是返回内部 `ResourceMap` 的 `keys` 迭代器。
     * @returns 一个迭代器，可用于遍历所有元素。
     * 
     * @example 测试案例
     * const toKeyFunc = (resource: URI) => resource.toString();
     * const resourceSet = new ResourceSet(toKeyFunc);
     * resourceSet.add(new URI('iter1'));
     * resourceSet.add(new URI('iter2'));
     * const iterator = resourceSet[Symbol.iterator]();
     * for (const uri of iterator) {
     *     console.log(uri.toString());
     * }
     * // 输出示例:
     * // iter1
     * // iter2
     */
    // @ts-ignore
    public [Symbol.iterator](): IterableIterator<URI> {
        return this.keys();
    }
}
