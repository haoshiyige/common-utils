/**
 * 定义缓存项的接口。
 *
 * @template V - 缓存项的值类型，默认为 `any`。
 */
export interface Cache<V = any> {
    /**
     * 缓存的值。
     */
    value?: V;

    /**
     * 超时定时器的 ID，用于自动移除过期的缓存项。
     */
    timeoutId?: ReturnType<typeof setTimeout>;

    /**
     * 缓存项的创建时间或过期时间戳（以毫秒为单位）。
     */
    time?: number;

    /**
     * 缓存项的存活时间（以毫秒为单位），表示从创建到过期的时间间隔。
     */
    alive?: number;
}

/**
 * 定义一个常量，表示缓存项没有存活时间（即永久缓存）。
 */
const NOT_ALIVE = 0;

/**
 * Memory 类用于实现基于内存的缓存系统，支持设置缓存项的存活时间和自动清理过期缓存。
 *
 * @template T - 缓存键的类型映射，表示缓存中可以存储的键的类型。
 * @template V - 缓存值的类型，默认为 `any`。
 */
export class Memory<T = any, V = any> {
    /**
     * 存储缓存项的对象，键为 `T` 中的键类型，值为 `Cache<V>` 类型。
     */
    private cache: { [key in keyof T]?: Cache<V> } = {};

    /**
     * 缓存项的默认存活时间（以毫秒为单位）。如果设置为 `NOT_ALIVE`，则表示缓存项不会自动过期。
     */
    private alive: number;

    /**
     * 构造函数，初始化缓存系统的默认存活时间。
     *
     * @param {number} alive - 缓存项的默认存活时间（以秒为单位）。如果未提供，则默认为 `NOT_ALIVE`，表示缓存项不会自动过期。
     */
    constructor(alive: number = NOT_ALIVE) {
        // 将存活时间转换为毫秒
        this.alive = alive * 1000;
    }

    /**
     * 获取当前缓存对象。
     *
     * @returns {Cache<V>[] | undefined} - 当前缓存对象。
     */
    get getCache() {
        return this.cache;
    }

    /**
     * 设置缓存对象，替换现有的缓存。
     *
     * @param {Cache<V>[]} cache - 新的缓存对象。
     */
    setCache(cache: { [key in keyof T]?: Cache<V> }) {
        this.cache = cache;
    }

    /**
     * 获取缓存中的值。
     *
     * @template K - 缓存键的类型，必须是 `T` 中的一个键。
     * @param {K} key - 要获取的缓存键。
     * @returns {V | undefined} - 缓存中的值，如果键不存在或已过期，则返回 `undefined`。
     */
    get<K extends keyof T>(key: K): V | undefined {
        const item = this.cache[key];
        if (!item) return undefined;

        // 检查缓存是否已过期
        if (item.time && item.time < new Date().getTime()) {
            this.remove(key);
            return undefined;
        }

        return item.value;
    }

    /**
     * 设置缓存中的值，并可选地设置缓存项的存活时间。
     *
     * @template K - 缓存键的类型，必须是 `T` 中的一个键。
     * @param {K} key - 要设置的缓存键。
     * @param {V} value - 要设置的缓存值。
     * @param {number} [expires] - 可选的缓存项存活时间（以秒为单位）。如果未提供，则使用默认的 `alive` 时间。
     * @returns {V} - 设置的缓存值。
     */
    set<K extends keyof T>(key: K, value: V, expires?: number): V {
        let item = this.get(key);

        // 如果未提供 `expires` 或 `expires` 为非正数，则使用默认的 `alive` 时间
        if (!expires || (expires as number) <= 0) {
            expires = this.alive;
        }

        // 如果缓存项已存在，清除旧的超时定时器并更新值
        if (item) {
            // @ts-ignore
            if (item.timeoutId) {
                // @ts-ignore
                clearTimeout(item.timeoutId);
                // @ts-ignore
                item.timeoutId = undefined;
            }
            // @ts-ignore
            item.value = value;
        } else {
            // 如果缓存项不存在，创建新的缓存项
            // @ts-ignore
            item = { value, alive: expires };
            // @ts-ignore
            this.cache[key] = item;
        }

        // 如果设置了存活时间，启动超时定时器
        if (expires) {
            const now = new Date().getTime();
            // @ts-ignore
            item.time = now + expires * 1000; // 将 `expires` 转换为毫秒
            // @ts-ignore
            item.timeoutId = setTimeout(() => {
                this.remove(key);
            }, expires * 1000); // 设置超时时间
        }

        return value;
    }

    /**
     * 从缓存中移除指定的键。
     *
     * @template K - 缓存键的类型，必须是 `T` 中的一个键。
     * @param {K} key - 要移除的缓存键。
     * @returns {V | undefined} - 被移除的缓存值，如果键不存在，则返回 `undefined`。
     */
    remove<K extends keyof T>(key: K): V | undefined {
        const item = this.get(key);
        Reflect.deleteProperty(this.cache, key); // 从缓存中删除键

        // 如果存在超时定时器，清除它
        // @ts-ignore
        if (item && item.timeoutId) {
            // @ts-ignore
            clearTimeout(item.timeoutId);
            // @ts-ignore
            return item.value;
        }
    }

    /**
     * 重置缓存，将传入的缓存对象替换为当前缓存，并处理过期项。
     *
     * @param {Cache<V>[]} cache - 新的缓存对象。
     */
    resetCache(cache: { [K in keyof T]: Cache }) {
        Object.keys(cache).forEach((key) => {
            const k = key as any as keyof T;
            const item = cache[k];

            // 如果缓存项有时间戳且未过期，重新设置缓存项
            if (item && item.time) {
                const now = new Date().getTime();
                const expire = item.time;
                if (expire > now) {
                    this.set(k, item.value, (expire - now) / 1000); // 将剩余时间转换为秒
                }
            }
        });
    }

    /**
     * 清空所有缓存项，并清除所有超时定时器。
     */
    clear() {
        Object.keys(this.cache).forEach((key) => {
            // @ts-ignore
            const item = this.cache[key];
            if (item && item.timeoutId) {
                clearTimeout(item.timeoutId); // 清除超时定时器
            }
        });
        this.cache = {}; // 清空缓存对象
    }
}