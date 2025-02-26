
class Node<K, V> {
    readonly forward: Node<K, V>[];
    constructor(readonly level: number, readonly key: K, public value: V) {
        this.forward = [];
    }
}

const NIL: undefined = undefined;


/**
* @description SkipList 是一种数据结构，它提供了一种高效的排序方式，并支持快速查找、插入和删除操作。
* 它使用了多层链表来实现跳跃式搜索，从而减少了在单链表中线性查找的时间复杂度。
* 该实现遵循 Map<K, V> 接口，允许键值对的存储与检索。
*/



export class SkipList<K, V> implements Map<K, V> {
    readonly [Symbol.toStringTag] = 'SkipList';
    /**
     * 最大层级数，用于确定跳表的高度。
     * @private
     */
    private _maxLevel: number;

    /**
     * 当前跳表的实际层级数。
     * @private
     */
    private _level: number = 0;

    /**
     * 跳表的头部节点，不存储实际的数据，仅作为定位其他节点的起点。
     * @private
     */
    private _header: Node<K, V>;

    /**
     * 跳表中存储的元素数量。
     * @private
     */
    private _size: number = 0;

    /**
     * 构造一个新的 SkipList 实例。
     * 
     * @param comparator - 用于比较两个键的函数，必须返回一个负数、零或正数，表示第一个参数小于、等于或大于第二个参数。
     * @param capacity - 跳表预期的最大容量，默认为 2^16，这将决定跳表的最大层级数。
     */
    constructor(readonly comparator: (a: K, b: K) => number, capacity: number = 2 ** 16) {
        this._maxLevel = Math.max(1, Math.log2(capacity) | 0);
        this._header = <any>new Node(this._maxLevel, NIL, NIL);
    }

    /**
     * 获取跳表中元素的数量。
     */
    get size(): number {
        return this._size;
    }

    /**
     * 清空跳表中的所有元素。
     */
    clear(): void {
        this._header = <any>new Node(this._maxLevel, NIL, NIL);
        this._size = 0;
    }

    /**
     * 检查跳表中是否存在指定的键。
     *
     * @param key - 要检查的键。
     * @returns 如果存在则返回 true，否则返回 false。
     */
    has(key: K): boolean {
        return Boolean(SkipList._search(this, key, this.comparator));
    }

    /**
     * 获取与指定键关联的值。
     *
     * @param key - 要获取其值的键。
     * @returns 如果找到键，则返回对应的值；如果未找到，则返回 undefined。
     */
    get(key: K): V | undefined {
        return SkipList._search(this, key, this.comparator)?.value;
    }

    /**
     * 向跳表中插入或更新一个键值对。
     *
     * @param key - 键。
     * @param value - 值。
     * @returns 返回当前跳表实例，以便链式调用。
     */
    set(key: K, value: V): this {
        if (SkipList._insert(this, key, value, this.comparator)) {
            this._size += 1;
        }
        return this;
    }

    /**
     * 从跳表中移除指定的键及其关联的值。
     *
     * @param key - 要移除的键。
     * @returns 如果成功移除了键，则返回 true；如果未找到键，则返回 false。
     */
    delete(key: K): boolean {
        const didDelete = SkipList._delete(this, key, this.comparator);
        if (didDelete) {
            this._size -= 1;
        }
        return didDelete;
    }

    // --- iteration

    /**
     * 对跳表中的每个键值对执行一次提供的回调函数。
     *
     * @param callbackfn - 在每次迭代时执行的函数，接收三个参数：当前值、当前键和跳表本身。
     * @param thisArg - 执行回调函数时使用的 this 值（可选）。
     */
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        let node = this._header.forward[0];
        while (node) {
            // @ts-ignore
            callbackfn.call(thisArg, node.value, node.key, this);
            node = node.forward[0];
        }
    }

    /**
     * 返回一个新的迭代器对象，该对象包含跳表中所有键值对的数组。
     */
    // @ts-ignore
    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }

    /**
     * 返回一个新的迭代器对象，该对象包含跳表中所有键值对的数组。
     */
    // @ts-ignore
    *entries(): IterableIterator<[K, V]> {
        let node = this._header.forward[0];
        while (node) {
            yield [node.key, node.value];
            node = node.forward[0];
        }
    }

    /**
     * 返回一个新的迭代器对象，该对象包含跳表中所有的键。
     */
    // @ts-ignore
    public *keys(): IterableIterator<K> {
        let node = this._header.forward[0];
        while (node) {
            yield node.key;
            node = node.forward[0];
        }
    }

    /**
     * 返回一个新的迭代器对象，该对象包含跳表中所有的值。
     */
    // @ts-ignore
    *values(): IterableIterator<V> {
        let node = this._header.forward[0];
        while (node) {
            yield node.value;
            node = node.forward[0];
        }
    }

    /**
     * 返回一个字符串，表示跳表的内容，主要用于调试目的。
     */
    toString(): string {
        // debug string...
        let result = '[SkipList]:';
        let node = this._header.forward[0];
        while (node) {
            result += `node(${node.key}, ${node.value}, lvl:${node.level})`;
            node = node.forward[0];
        }
        return result;
    }

    // Private static methods for internal operations...

    /**
     * 内部静态方法，用于在跳表中查找给定的键。
     *
     * @param list - 要在其上执行查找的跳表。
     * @param searchKey - 要查找的键。
     * @param comparator - 用于比较键的函数。
     * @returns 如果找到了键，则返回对应的节点；如果未找到，则返回 undefined。
     * @private
     */


    private static _search<K, V>(list: SkipList<K, V>, searchKey: K, comparator: (a: K, b: K) => number): Node<K, V> | undefined {
        let x = list._header;
        for (let i = list._level - 1; i >= 0; i--) {
            while (x.forward[i] && comparator(x.forward[i].key, searchKey) < 0) {
                x = x.forward[i];
            }
        }
        x = x.forward[0];
        if (x && comparator(x.key, searchKey) === 0) {
            return x;
        }
        return undefined;
    }

    /**
     * 内部静态方法，用于向跳表中插入一个新的键值对，或者更新已存在的键的值。
     *
     * @param list - 要在其上执行插入或更新的跳表。
     * @param searchKey - 要插入或更新的键。
     * @param value - 要插入或更新的值。
     * @param comparator - 用于比较键的函数。
     * @returns 如果进行了插入操作，则返回 true；如果进行了更新操作，则返回 false。
     * @private
     */
    private static _insert<K, V>(list: SkipList<K, V>, searchKey: K, value: V, comparator: (a: K, b: K) => number): boolean {
        const update: Node<K, V>[] = [];
        let x = list._header;
        for (let i = list._level - 1; i >= 0; i--) {
            while (x.forward[i] && comparator(x.forward[i].key, searchKey) < 0) {
                x = x.forward[i];
            }
            update[i] = x;
        }
        x = x.forward[0];
        if (x && comparator(x.key, searchKey) === 0) {
            // update
            x.value = value;
            return false;
        } else {
            // insert
            const lvl = SkipList._randomLevel(list);
            if (lvl > list._level) {
                for (let i = list._level; i < lvl; i++) {
                    update[i] = list._header;
                }
                list._level = lvl;
            }
            x = new Node<K, V>(lvl, searchKey, value);
            for (let i = 0; i < lvl; i++) {
                x.forward[i] = update[i].forward[i];
                update[i].forward[i] = x;
            }
            return true;
        }
    }

    /**
     * 内部静态方法，用于随机生成新节点的层级数。
     *
     * @param list - 要为其生成层级数的跳表。
     * @param p - 生成更高层级的概率，默认为 0.5。
     * @returns 新节点的层级数。
     * @private
     */
    private static _randomLevel(list: SkipList<any, any>, p: number = 0.5): number {
        let lvl = 1;
        while (Math.random() < p && lvl < list._maxLevel) {
            lvl += 1;
        }
        return lvl;
    }

    /**
     * 内部静态方法，用于从跳表中删除一个键。
     *
     * @param list - 要在其上执行删除的跳表。
     * @param searchKey - 要删除的键。
     * @param comparator - 用于比较键的函数。
     * @returns 如果成功删除了键，则返回 true；如果未找到键，则返回 false。
     * @private
     */
    private static _delete<K, V>(list: SkipList<K, V>, searchKey: K, comparator: (a: K, b: K) => number): boolean {
        const update: Node<K, V>[] = [];
        let x = list._header;
        for (let i = list._level - 1; i >= 0; i--) {
            while (x.forward[i] && comparator(x.forward[i].key, searchKey) < 0) {
                x = x.forward[i];
            }
            update[i] = x;
        }
        x = x.forward[0];
        if (!x || comparator(x.key, searchKey) !== 0) {
            // not found
            return false;
        }
        for (let i = 0; i < list._level; i++) {
            if (update[i].forward[i] !== x) {
                break;
            }
            update[i].forward[i] = x.forward[i];
        }
        while (list._level > 0 && list._header.forward[list._level - 1] === NIL) {
            list._level -= 1;
        }
        return true;
    }

}