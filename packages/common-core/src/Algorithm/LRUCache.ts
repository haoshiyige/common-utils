/**
 * 定义双向链表的节点类。
 */
class Node<V> {
    public key: any;
    public value: V;
    public prev: Node<V> | null = null;
    public next: Node<V> | null = null;
    constructor(key: any, value: V) {
        this.key = key;
        this.value = value;
    }
}

/**
 * LRU 缓存实现，支持高效率的 get 和 set 操作，并且在达到容量限制时自动移除最久未使用的项。
 * 
 * 使用案例：
 * ```typescript
 * const cache = new LRUCache<string, number>(2);
 * cache.set('one', 1);
 * cache.set('two', 2);
 * console.log(cache.get('one')); // 输出: 1
 * cache.set('three', 3); // 移除了 'two'
 * console.log(cache.get('two')); // 输出: undefined
 * ```
 * 
 * 测试案例：
 * ```typescript
 * const testCache = new LRUCache<string, number>(2);
 * testCache.set('one', 1);
 * testCache.set('two', 2);
 * console.log(testCache.get('one')); // 应输出: 1
 * testCache.set('three', 3); // 此操作将移除 'two'
 * console.log(testCache.get('two')); // 应输出: undefined
 * console.log(testCache.get('three')); // 应输出: 3
 * testCache.delete('one');
 * console.log(testCache.get('one')); // 应输出: undefined
 * testCache.clear();
 * console.log(testCache.get('three')); // 应输出: undefined
 * ```
 */
export class LRUCache<K, V> {
    private cache: Map<K, Node<V>>; // 键到节点的映射
    private head: Node<V> | null;   // 双向链表的头部（最久未使用的节点）
    private tail: Node<V> | null;   // 双向链表的尾部（最近使用的节点）
    private capacity: number;

    /**
     * 创建一个新的 LRUCache 实例。
     *
     * @param {number} capacity - 缓存的最大容量。
     */
    constructor(capacity: number) {
        this.cache = new Map<K, Node<V>>();
        this.head = null;
        this.tail = null;
        this.capacity = capacity;
    }

    /**
     * 获取缓存中的值。
     *
     * @param {K} key - 要获取的键。
     * @returns {V | undefined} - 缓存中的值或 undefined。
     */
    get(key: K): V | undefined {
        const node = this.cache.get(key);
        if (!node) return undefined;
        // 更新节点为最近使用
        this.moveToTail(node);
        return node.value;
    }

    /**
     * 设置缓存中的值。
     *
     * @param {K} key - 要设置的键。
     * @param {V} value - 要设置的值。
     */
    set(key: K, value: V): void {
        const node = this.cache.get(key);
        if (node) {
            // 如果键已存在，更新值并移动到最近使用的位置
            node.value = value;
            this.moveToTail(node);
        } else {
            // 如果达到容量限制，移除最久未使用的项
            if (this.cache.size >= this.capacity) {
                this.removeOldest();
            }
            // 创建新节点并添加到缓存和链表尾部
            const newNode = new Node<V>(key, value);
            this.cache.set(key, newNode);
            this.addToTail(newNode);
        }
    }

    /**
     * 删除缓存中的值。
     *
     * @param {K} key - 要删除的键。
     */
    delete(key: K): void {
        const node = this.cache.get(key);
        if (node) {
            this.removeFromList(node);
            this.cache.delete(key);
        }
    }

    /**
     * 清空缓存。
     */
    clear(): void {
        this.cache.clear();
        this.head = null;
        this.tail = null;
    }

    /**
     * 将节点移动到链表尾部（表示最近使用）。
     *
     * @param {Node<V>} node - 要移动的节点。
     */
    private moveToTail(node: Node<V>): void {
        if (node === this.tail) return; // 如果已经是最近使用的节点，无需移动
        // 如果是头节点，更新头节点
        if (node === this.head) {
            this.head = node.next;
        }
        // 从链表中移除节点
        this.removeFromList(node);
        // 将节点添加到链表尾部
        this.addToTail(node);
    }

    /**
     * 从链表中移除节点。
     *
     * @param {Node<V>} node - 要移除的节点。
     */
    private removeFromList(node: Node<V>): void {
        if (node.prev) {
            node.prev.next = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        node.prev = null;
        node.next = null;
    }

    /**
     * 将节点添加到链表尾部。
     *
     * @param {Node<V>} node - 要添加的节点。
     */
    private addToTail(node: Node<V>): void {
        if (this.tail) {
            this.tail.next = node;
            node.prev = this.tail;
            this.tail = node;
        } else {
            this.head = this.tail = node;
        }
    }

    /**
     * 移除最久未使用的节点。
     */
    private removeOldest(): void {
        if (!this.head) return;
        const oldestKey = this.head.key;
        const oldestNode = this.head;
        // 从链表中移除最久未使用的节点
        this.removeFromList(oldestNode);
        // 从缓存中移除对应的键
        this.cache.delete(oldestKey);
        // 更新头节点
        this.head = this.head.next;
        if (!this.head) {
            this.tail = null; // 如果链表为空，重置尾节点
        }
    }
}

// // 测试案例
// console.log("=== 测试案例 ===");
// const testCache = new LRUCache<string, number>(2);
// testCache.set('one', 1);
// testCache.set('two', 2);
// console.log('Get one:', testCache.get('one')); // 应输出: 1
// testCache.set('three', 3); // 此操作将移除 'two'
// console.log('Get two:', testCache.get('two')); // 应输出: undefined
// console.log('Get three:', testCache.get('three')); // 应输出: 3
// testCache.delete('one');
// console.log('Get one after delete:', testCache.get('one')); // 应输出: undefined
// testCache.clear();
// console.log('Get three after clear:', testCache.get('three')); // 应输出: undefined

// // 使用案例
// console.log("\n=== 使用案例 ===");
// const cache = new LRUCache<string, number>(2);
// cache.set('one', 1);
// cache.set('two', 2);
// console.log('Get one:', cache.get('one')); // 输出: 1
// cache.set('three', 3); // 移除了 'two'
// console.log('Get two:', cache.get('two')); // 输出: undefined