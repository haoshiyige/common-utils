import { checkNewCall } from "@nin/shared";


/**
 * `LinkedMap` 中的条目类。
 * 表示双向链表中的一个节点，包含键、值以及前后节点的引用。
 * @template K - 键的类型。
 * @template V - 值的类型。
 */
interface Item<K, V> {
    previous: Item<K, V> | undefined;
    next: Item<K, V> | undefined;
    key: K;
    value: V;
}


/**
 * 用于描述 `LinkedMap` 中元素触摸操作的枚举类型。
 * `None` 表示不进行触摸操作，`AsOld` 表示将元素移动到链表头部，`AsNew` 表示将元素移动到链表尾部。
 */
export const enum Touch {
    None = 0, // 不调整位置
    AsOld = 1, // 将元素移动到最前面（最早插入的位置）
    AsNew = 2  // 将元素移动到最后面（最新插入的位置）
}

/**
 * `LinkedMap` 是一个有序的键值对集合，类似于 JavaScript 的 `Map`，但它保持了插入顺序，并提供了额外的功能，
 * 如根据触摸策略调整元素的位置、修剪旧或新的元素等。
 *
 * @template K - 键的类型。
 * @template V - 值的类型。
 */
@checkNewCall()
export class LinkedMap<K, V> implements Map<K, V> {
    readonly [Symbol.toStringTag] = 'LinkedMap';
    private _map: Map<K, Item<K, V>>; // 内部存储键值对的 Map
    private _head: Item<K, V> | undefined; // 链表的头部
    private _tail: Item<K, V> | undefined; // 链表的尾部
    private _size: number; // 当前元素的数量
    private _state: number; // 用于检测迭代期间是否发生了修改

    /**
     * 构造一个新的 `LinkedMap` 实例。
     */
    constructor() {
        this._map = new Map<K, Item<K, V>>();
        this._head = undefined;
        this._tail = undefined;
        this._size = 0;
        this._state = 0;
    }

    /**
     * 清空 `LinkedMap` 中的所有元素。
     */
    clear(): void {
        this._map.clear();
        this._head = undefined;
        this._tail = undefined;
        this._size = 0;
        this._state++;
    }

    /**
     * 检查 `LinkedMap` 是否为空。
     *
     * @returns {boolean} - 如果 `LinkedMap` 为空，则返回 `true`，否则返回 `false`。
     */
    isEmpty(): boolean {
        return !this._head && !this._tail;
    }

    /**
     * 获取 `LinkedMap` 中元素的数量。
     *
     * @returns {number} - 元素的数量。
     */
    get size(): number {
        return this._size;
    }

    /**
     * 获取 `LinkedMap` 中的第一个元素的值。
     *
     * @returns {V | undefined} - 第一个元素的值，如果 `LinkedMap` 为空则返回 `undefined`。
     */
    get first(): V | undefined {
        return this._head?.value;
    }

    /**
     * 获取 `LinkedMap` 中的最后一个元素的值。
     *
     * @returns {V | undefined} - 最后一个元素的值，如果 `LinkedMap` 为空则返回 `undefined`。
     */
    get last(): V | undefined {
        return this._tail?.value;
    }

    /**
     * 检查 `LinkedMap` 中是否存在指定的键。
     *
     * @param {K} key - 要检查的键。
     * @returns {boolean} - 如果存在该键，则返回 `true`，否则返回 `false`。
     */
    has(key: K): boolean {
        return this._map.has(key);
    }

    /**
     * 获取与指定键关联的值，并根据触摸策略调整其位置。
     *
     * @param {K} key - 要获取的键。
     * @param {Touch} touch - 触摸策略，默认为 `Touch.None`。
     * @returns {V | undefined} - 与键关联的值，如果不存在该键则返回 `undefined`。
     */
    get(key: K, touch: Touch = Touch.None): V | undefined {
        const item = this._map.get(key);
        if (!item) {
            return undefined;
        }
        if (touch !== Touch.None) {
            this.touch(item, touch);
        }
        return item.value;
    }

    /**
     * 设置与指定键关联的值，并根据触摸策略调整其位置。
     *
     * @param {K} key - 要设置的键。
     * @param {V} value - 要设置的值。
     * @param {Touch} touch - 触摸策略，默认为 `Touch.None`。
     * @returns {this} - 返回当前 `LinkedMap` 实例。
     */
    set(key: K, value: V, touch: Touch = Touch.None): this {
        let item = this._map.get(key);
        if (item) {
            item.value = value;
            if (touch !== Touch.None) {
                this.touch(item, touch);
            }
        } else {
            item = { key, value, next: undefined, previous: undefined };
            switch (touch) {
                case Touch.None:
                    this.addItemLast(item);
                    break;
                case Touch.AsOld:
                    this.addItemFirst(item);
                    break;
                case Touch.AsNew:
                    this.addItemLast(item);
                    break;
                default:
                    this.addItemLast(item);
                    break;
            }
            this._map.set(key, item);
            this._size++;
        }
        return this;
    }

    /**
     * 删除与指定键关联的元素。
     *
     * @param {K} key - 要删除的键。
     * @returns {boolean} - 如果成功删除元素，则返回 `true`，否则返回 `false`。
     */
    delete(key: K): boolean {
        return !!this.remove(key);
    }

    /**
     * 移除与指定键关联的元素，并返回其值。
     *
     * @param {K} key - 要移除的键。
     * @returns {V | undefined} - 被移除元素的值，如果不存在该键则返回 `undefined`。
     */
    remove(key: K): V | undefined {
        const item = this._map.get(key);
        if (!item) {
            return undefined;
        }
        this._map.delete(key);
        this.removeItem(item);
        this._size--;
        return item.value;
    }

    /**
     * 移除并返回 `LinkedMap` 中的第一个元素的值。
     *
     * @returns {V | undefined} - 第一个元素的值，如果 `LinkedMap` 为空则返回 `undefined`。
     */
    shift(): V | undefined {
        if (!this._head && !this._tail) {
            return undefined;
        }
        if (!this._head || !this._tail) {
            throw new Error('Invalid list');
        }
        const item = this._head;
        this._map.delete(item.key);
        this.removeItem(item);
        this._size--;
        return item.value;
    }

    /**
     * 对 `LinkedMap` 中的每个元素执行回调函数。
     *
     * @param {function(value: V, key: K, map: LinkedMap<K, V>): void} callbackfn - 回调函数。
     * @param {any} [thisArg] - 可选的 `this` 上下文。
     */
    // @ts-ignore
    forEach(callbackfn: (value: V, key: K, map: LinkedMap<K, V>) => void, thisArg?: any): void {
        const state = this._state;
        let current = this._head;
        while (current) {
            if (thisArg) {
                callbackfn.bind(thisArg)(current.value, current.key, this);
            } else {
                callbackfn(current.value, current.key, this);
            }
            if (this._state !== state) {
                throw new Error(`LinkedMap got modified during iteration.`);
            }
            current = current.next;
        }
    }

    /**
     * 返回一个迭代器，用于遍历 `LinkedMap` 中的所有键。
     *
     * @returns {IterableIterator<K>} - 迭代器。
     */
    // @ts-ignore

    keys(): IterableIterator<K> {
        const map = this;
        const state = this._state;
        let current = this._head;
        const iterator: IterableIterator<K> = {
            [Symbol.iterator]() {
                return iterator;
            },
            next(): IteratorResult<K> {
                if (map._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                if (current) {
                    const result = { value: current.key, done: false };
                    current = current.next;
                    return result;
                } else {
                    return { value: undefined, done: true };
                }
            }
        };
        return iterator;
    }

    /**
     * 返回一个迭代器，用于遍历 `LinkedMap` 中的所有值。
     *
     * @returns {IterableIterator<V>} - 迭代器。
     */
    // @ts-ignore
    values(): IterableIterator<V> {
        const map = this;
        const state = this._state;
        let current = this._head;
        const iterator: IterableIterator<V> = {
            [Symbol.iterator]() {
                return iterator;
            },
            next(): IteratorResult<V> {
                if (map._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                if (current) {
                    const result = { value: current.value, done: false };
                    current = current.next;
                    return result;
                } else {
                    return { value: undefined, done: true };
                }
            }
        };
        return iterator;
    }

    /**
     * 返回一个迭代器，用于遍历 `LinkedMap` 中的所有键值对。
     *
     * @returns {IterableIterator<[K, V]>} - 迭代器。
     */
    // @ts-ignore
    entries(): IterableIterator<[K, V]> {
        const map = this;
        const state = this._state;
        let current = this._head;
        const iterator: IterableIterator<[K, V]> = {
            [Symbol.iterator]() {
                return iterator;
            },
            next(): IteratorResult<[K, V]> {
                if (map._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                if (current) {
                    const result: IteratorResult<[K, V]> = { value: [current.key, current.value], done: false };
                    current = current.next;
                    return result;
                } else {
                    return { value: undefined, done: true };
                }
            }
        };
        return iterator;
    }

    /**
     * 返回一个迭代器，用于遍历 `LinkedMap` 中的所有键值对（等同于 `entries()`）。
     *
     * @returns {IterableIterator<[K, V]>} - 迭代器。
     */
    // @ts-ignore
    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }

    /**
     * 修剪 `LinkedMap`，保留最新的 `newSize` 个元素，移除较早的元素。
     *
     * @param {number} newSize - 保留的元素数量。
     */
    protected trimOld(newSize: number) {
        if (newSize >= this.size) {
            return;
        }
        if (newSize === 0) {
            this.clear();
            return;
        }
        let current = this._head;
        let currentSize = this.size;
        while (current && currentSize > newSize) {
            this._map.delete(current.key);
            current = current.next;
            currentSize--;
        }
        this._head = current;
        this._size = currentSize;
        if (current) {
            current.previous = undefined;
        }
        this._state++;
    }

    /**
     * 修剪 `LinkedMap`，保留最早的 `newSize` 个元素，移除较新的元素。
     *
     * @param {number} newSize - 保留的元素数量。
     */
    protected trimNew(newSize: number) {
        if (newSize >= this.size) {
            return;
        }
        if (newSize === 0) {
            this.clear();
            return;
        }
        let current = this._tail;
        let currentSize = this.size;
        while (current && currentSize > newSize) {
            this._map.delete(current.key);
            current = current.previous;
            currentSize--;
        }
        this._tail = current;
        this._size = currentSize;
        if (current) {
            current.next = undefined;
        }
        this._state++;
    }

    /**
     * 在链表的头部插入一个新节点。
     *
     * @param {Item<K, V>} item - 要插入的节点。
     */
    private addItemFirst(item: Item<K, V>): void {
        // 第一次插入
        if (!this._head && !this._tail) {
            this._tail = item;
        } else if (!this._head) {
            throw new Error('Invalid list');
        } else {
            item.next = this._head;
            this._head.previous = item;
        }
        this._head = item;
        this._state++;
    }

    /**
     * 在链表的尾部插入一个新节点。
     *
     * @param {Item<K, V>} item - 要插入的节点。
     */
    private addItemLast(item: Item<K, V>): void {
        // 第一次插入
        if (!this._head && !this._tail) {
            this._head = item;
        } else if (!this._tail) {
            throw new Error('Invalid list');
        } else {
            item.previous = this._tail;
            this._tail.next = item;
        }
        this._tail = item;
        this._state++;
    }

    /**
     * 从链表中移除一个节点。
     *
     * @param {Item<K, V>} item - 要移除的节点。
     */
    private removeItem(item: Item<K, V>): void {
        if (item === this._head && item === this._tail) {
            this._head = undefined;
            this._tail = undefined;
        }
        else if (item === this._head) {
            if (!item.next) {
                throw new Error('Invalid list');
            }
            item.next.previous = undefined;
            this._head = item.next;
        }
        else if (item === this._tail) {
            if (!item.previous) {
                throw new Error('Invalid list');
            }
            item.previous.next = undefined;
            this._tail = item.previous;
        }
        else {
            const next = item.next;
            const previous = item.previous;
            if (!next || !previous) {
                throw new Error('Invalid list');
            }
            next.previous = previous;
            previous.next = next;
        }
        item.next = undefined;
        item.previous = undefined;
        this._state++;
    }

    /**
     * 根据触摸策略调整节点的位置。
     *
     * @param {Item<K, V>} item - 要调整的节点。
     * @param {Touch} touch - 触摸策略。
     */
    private touch(item: Item<K, V>, touch: Touch): void {
        if (!this._head || !this._tail) {
            throw new Error('Invalid list');
        }
        if (touch !== Touch.AsOld && touch !== Touch.AsNew) {
            return;
        }

        if (touch === Touch.AsOld) {
            if (item === this._head) {
                return;
            }

            const next = item.next;
            const previous = item.previous;

            // 解链该节点
            if (item === this._tail) {
                previous!.next = undefined;
                this._tail = previous;
            }
            else {
                next!.previous = previous;
                previous!.next = next;
            }

            // 插入到头部
            item.previous = undefined;
            item.next = this._head;
            this._head.previous = item;
            this._head = item;
            this._state++;
        } else if (touch === Touch.AsNew) {
            if (item === this._tail) {
                return;
            }

            const next = item.next;
            const previous = item.previous;

            // 解链该节点
            if (item === this._head) {
                next!.previous = undefined;
                this._head = next;
            } else {
                next!.previous = previous;
                previous!.next = next;
            }

            item.next = undefined;
            item.previous = this._tail;
            this._tail.next = item;
            this._tail = item;
            this._state++;
        }
    }

    /**
     * 将 `LinkedMap` 序列化为 JSON 格式的数组。
     *
     * @returns {[K, V][]} - 包含所有键值对的数组。
     */
    toJSON(): [K, V][] {
        const data: [K, V][] = [];

        this.forEach((value, key) => {
            data.push([key, value]);
        });

        return data;
    }

    /**
     * 从 JSON 格式的数组反序列化并填充 `LinkedMap`。
     *
     * @param {[K, V][]} data - 包含键值对的数组。
     */
    fromJSON(data: [K, V][]): void {
        this.clear();

        for (const [key, value] of data) {
            this.set(key, value);
        }
    }
}

