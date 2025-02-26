import StorageAdapter from "../adapter/StorageAdapter";
import StorageHelper from "../adapter/StorageHelper";
/** 
 * WebStorage 类用于管理带可选加密和前缀的缓存。
 *
 * 该类提供了一种方便的方式来在 web 存储（sessionStorage 或 localStorage）中存储和检索数据，
 * 支持 AES 加密和键前缀。它还根据指定的时间处理数据过期。
 *
 * @class WebStorage
 * @example
 * const webStorage = new WebStorage(sessionStorage, 'APP_', true, new AesEncryption());
 */
export default class WebStorage {
    // private storage: Storage;
    private _prefixKey?: string;
    // private encryption: { encryptByAES: (data: string) => string; decryptByAES: (data: string) => string };
    private hasEncrypt: boolean;
    private _adapter: StorageAdapter;
    // 使用 LRUCache 缓存格式化的键和原始的 JSON 字符串或解析后的 Promise
    // private cache: LRUCache<string, { formattedKey: string, rawData: string | Promise<any> }>;
    // private cacheSize?: number;
    private _helper: StorageHelper;

    /**
     * 创建一个 WebStorage 实例，并初始化缓存。
     *
     * @param {Storage} storage - 使用的存储对象（sessionStorage 或 localStorage）。
     * @param {string} [prefixKey] - 可选的键前缀。用于命名空间划分。
     * @param {boolean} [hasEncrypt=true] - 是否对存储的数据进行 AES 加密。
     * @param {AesEncryption} [encryption] - AES 加密工具实例。如果不提供，则创建一个新的实例。
     */
    constructor({ storage, prefixKey, hasEncrypt = true, encryption, cacheSize = 1000, onExpire }: {
        storage: Storage,
        prefixKey?: string,
        hasEncrypt?: boolean,
        encryption?: { encryptByAES: (data: string) => string; decryptByAES: (data: string) => string },
        cacheSize?: number,
        onExpire?: (key: string, expiredData: any) => void;
    }) {
        // this.storage = storage;
        this._prefixKey = prefixKey;
        // this.encryption = encryption;
        this.hasEncrypt = hasEncrypt;
        // this.cacheSize = cacheSize;
        this._adapter = new StorageAdapter(storage);
        // 初始化 LRU 缓存，最大容量为 500 项
        // this.cache = new LRUCache<string, { formattedKey: string, rawData: string | Promise<any> }>(cacheSize);
        this._helper = new StorageHelper({ hasEncrypt, encryption, onExpire, cacheSize });
        // 初始化时加载现有缓存数据
        this._initializeCache();
    }



    /**
     * 同步设置缓存项，并可以选择设置过期时间。
     *
     * @param {string} key - 要存储数据的键。
     * @param {*} value - 要存储的数据。
     * @param {number | null} [expire=null] - 过期时间（以秒为单位）。如果为 null，则数据不会过期。
     * @throws {Error} 如果在设置存储项时发生错误，则抛出异常。
     */

    setItemSync(key: string, value: any, expire: number | null = null): void {
        const formattedKey = this._helper.getKey(key, this._prefixKey);
        // const data = this._prepareData(value, expire);
        const data = this._helper.prepareData(value, expire);
        const encryptedData = this._helper.encryptData(data);
        try {
            this._adapter.storage.setItem(formattedKey, encryptedData);
            this._setCache(key, formattedKey, data);
        } catch (error) {
            this._helper._handleError('设置存储项失败', error);
        }
    }

    /**
     * 异步设置缓存项，并可以选择设置过期时间。
     *
     * @param {string} key - 要存储数据的键。
     * @param {*} value - 要存储的数据。
     * @param {number | null} [expire=null] - 过期时间（以秒为单位）。如果为 null，则数据不会过期。
     * @returns {Promise<void>} - 一个 Promise 对象，表示设置操作的结果。
     */


    async setItemAsync(key: string, value: any, expire: number | null = null): Promise<void> {
        const formattedKey = this._helper.getKey(key, this._prefixKey);
        // const data = this._prepareData(value, expire);
        const data = this._helper.prepareData(value, expire);
        const encryptedData = this._helper.encryptData(data);
        try {
            this._adapter.storage.setItem(formattedKey, encryptedData);
            this._setCache(key, formattedKey, data);
        } catch (error) {
            this._helper._handleError('设置存储项失败', error);
        }
    }

    /**
     * 同步获取缓存项。
     *
     * @param {string} key - 要获取的键。
     * @param {*} [def=null] - 如果键不存在或已过期，默认返回的值。
     * @returns {T | null} - 缓存的值或默认值。
     */

    getItemSync<T>(key: string, def: null = null): T | null {
        const cachedEntry = this._getCacheEntry(key);
        if (cachedEntry) {
            console.log("同步方法--------走的缓存")
            // @ts-ignore
            return this._handleCachedEntrySync(cachedEntry, def);
        }
        const storedKey = this._helper.getKey(key, this._prefixKey);
        const val = this._adapter.getItemSync(storedKey);
        if (!val) return def;
        try {
            const decVal = this._helper.decryptData(val);
            const data = JSON.parse(decVal);
            if (this._helper.isNotExpired(data)) {
                this._setCache(key, storedKey, decVal);
                return data.value as T;
            } else {
                this.remove(key); // Remove expired data
                return def;
            }
        } catch (error) {
            this._helper._handleError('获取存储项失败', error);
            return def;
        }
    }

    /**
     * 异步获取缓存项。
     *
     * @param {string} key - 要获取的键。
     * @param {*} [def=null] - 如果键不存在或已过期，默认返回的值。
     * @returns {Promise<T | null>} - 缓存的值或默认值。
     */

    async getItemAsync<T>(key: string, def: T | null = null): Promise<T | null> {
        const cachedEntry = this._getCacheEntry(key);
        if (cachedEntry) {
            return this._handleCachedEntry(cachedEntry, def);
        }
        const storedKey = this._helper.getKey(key, this._prefixKey);
        const val = this._adapter.storage.getItem(storedKey);
        if (!val) return def;
        try {
            const data = await this._parseAndCacheData(storedKey, val);
            return data.value as T;
        } catch (error) {
            this._helper._handleError('获取存储项失败', error);
            return def;
        }
    }

    /**
     * 根据键删除缓存项。
     *
     * @param {string} key - 要删除的键。
     * @throws {Error} 如果在删除存储项时发生错误，则抛出异常。
     */
    remove(key: string): void {
        try {
            const formattedKey = this._helper.getKey(key, this._prefixKey);
            this._adapter.storage.removeItem(formattedKey);
            this._helper.deleteCache(key);
        } catch (error) {
            this._helper._handleError('删除存储项失败', error);
        }
    }

    /**
     * 清除所有与此实例相关的缓存。
     *
     * 如果指定了前缀，则只清除带有该前缀的项；否则清除所有项。
     *
     * @throws {Error} 如果在清除存储时发生错误，则抛出异常。
     */

    clear(): void {
        try {
            if (this._prefixKey) {
                this._clearWithPrefix();
            } else {
                this._adapter.storage.clear();
            }
            this._helper.clearCache();
        } catch (error) {
            this._helper._handleError('清除存储失败', error);
        }
    }

    /**
     * 获取所有与此实例相关的键。
     *
     * 如果指定了前缀，则只返回带有该前缀的键；否则返回所有键。
     *
     * @returns {string[]} - 包含所有键的数组。
     */

    allKeys(): string[] {
        const keys: string[] = [];
        const prefixPattern = this._prefixKey ? new RegExp(`^${this._prefixKey}_`, 'i') : null;
        for (let i = 0; i < this._adapter.storage.length; i++) {
            const key = this._adapter.storage.key(i);
            if (key && (!prefixPattern || prefixPattern.test(key))) {
                keys.push(key);
            }
        }
        return keys;
    }


    /**
     * 初始化缓存，加载存储中的现有数据。
     *
     * @private
     */
    
    private _initializeCache(): void {
        try {
            for (let i = 0; i < this._adapter.storage.length; i++) {
                const storedKey = this._adapter.storage.key(i);
                if (!storedKey) continue;
                // 如果指定了前缀，只处理带有该前缀的键
                if (this._prefixKey && !storedKey.startsWith(`${this._prefixKey}_`.toUpperCase())) {
                    continue;
                }
                const val = this._adapter.storage.getItem(storedKey);
                if (!val) continue;
                try {
                    // 解密数据（如果启用了加密）
                    const decVal = this._helper.decryptData(val)
                    // 直接将原始的 JSON 字符串存入缓存
                    const originalKey = storedKey.replace(new RegExp(`^${this._prefixKey}_`, 'i'), '').toLowerCase();
                    this._setCache(originalKey, storedKey, decVal);
                } catch (error) {
                    // 记录错误但继续初始化
                    console.warn(`初始化缓存时解析键 ${storedKey} 失败`, error);
                }
            }
        } catch (error) {
            this._helper._handleError('初始化缓存失败', error);
        }
    }


    // 计算大小
    get size() {
        let totalSize = 0;
        for (let i = 0; i < this._adapter.storage.length; i++) {
            const key = this._adapter.storage.key(i);
            // @ts-ignore
            const value = this._adapter.storage.getItem(key);
            // 考虑键和值的长度，每个字符通常占用2字节（UTF - 16编码）
            // @ts-ignore
            totalSize += (key.length + value.length) * 2;
        }
        // 将字节数转换为千字节，保留两位小数
        // @ts-ignore
        const sizeInKB = ((totalSize / 1024).toFixed(2)) * 1;
        return sizeInKB;
    }

    /**
     * 处理缓存条目，返回解析后的数据或默认值（同步版本）。
     *
     * @param {{ formattedKey: string, rawData: string }} cachedEntry - 缓存条目。
     * @param {*} [def=null] - 默认返回的值。
     * @returns {T | null} - 解析后的数据或默认值。
     */
    private _handleCachedEntrySync<T>(cachedEntry: { formattedKey: string, rawData: string }, def: T | null = null): T | null {
        try {
            const data = JSON.parse(cachedEntry.rawData);
            if (this._helper.isNotExpired(data)) {
                const parsedData = data.value as T;
                // @ts-ignore
                this._setCache(cachedEntry.formattedKey, cachedEntry.formattedKey, Promise.resolve(parsedData));
                return parsedData;
            } else {
                this.remove(cachedEntry.formattedKey);
                return def;
            }
        } catch (error) {
            this._helper.deleteCache(cachedEntry.formattedKey);
            return def;
        }
    }

    /**
     * 将数据存入缓存。
     *
     * @param {string} key - 缓存的键。
     * @param {string} formattedKey - 格式化的键。
     * @param {string} rawData - 原始的 JSON 字符串。
     */
    private _setCache(key: string, formattedKey: string, rawData: string): void {
        this._helper.setCache(key, { formattedKey, rawData });
    }

    /**
     * 获取缓存条目。
     *
     * @param {string} key - 缓存的键。
     * @returns {{ formattedKey: string, rawData: string | Promise<any> } | undefined} - 缓存条目。
     */
    private _getCacheEntry(key: string): { formattedKey: string, rawData: string | Promise<any> } | undefined {
        return this._helper.getCache(key);
    }

    /**
     * 处理缓存条目，返回解析后的数据或默认值。
     *
     * @param {{ formattedKey: string, rawData: string | Promise<any> }} cachedEntry - 缓存条目。
     * @param {*} [def=null] - 默认返回的值。
     * @returns {Promise<T | null>} - 解析后的数据或默认值。
     */
    private async _handleCachedEntry<T>(cachedEntry: { formattedKey: string, rawData: string | Promise<any> }, def: T | null = null): Promise<T | null> {
        if (typeof cachedEntry.rawData === 'string') {
            try {
                const data = JSON.parse(cachedEntry.rawData);
                if (this._helper.isNotExpired(data)) {
                    const parsedData = data.value as T;
                    // @ts-ignore
                    this._setCache(cachedEntry.formattedKey, cachedEntry.formattedKey, Promise.resolve(parsedData));
                    return parsedData;
                } else {
                    this.remove(cachedEntry.formattedKey);
                    return def;
                }
            } catch (error) {
                this._helper.deleteCache(cachedEntry.formattedKey);
                return def;
            }
        } else if (cachedEntry.rawData instanceof Promise) {
            try {
                return await cachedEntry.rawData;
            } catch (error) {
                this._helper.deleteCache(cachedEntry.formattedKey);
                return def;
            }
        }
        return def;
    }

    /**
     * 解析并缓存数据。
     *
     * @param {string} storedKey - 存储的键。
     * @param {string} val - 存储的值。
     * @returns {Promise<any>} - 解析后的数据。
     */
    private async _parseAndCacheData(storedKey: string, val: string): Promise<any> {
        const decVal = this._helper.decryptData(val);
        const data = JSON.parse(decVal);
        if (this._helper.isNotExpired(data)) {
            this._setCache(storedKey.toLowerCase(), storedKey, decVal);
            return data;
        } else {
            this.remove(storedKey.toLowerCase());
            throw new Error('数据已过期');
        }
    }

    /**
     * 清除带有前缀的缓存项。
     *
     * @private
     */
    private _clearWithPrefix(): void {
        for (let i = 0; i < this._adapter.storage.length; i++) {
            const key = this._adapter.storage.key(i);
            if (key && key.startsWith(`${this._prefixKey}_`.toUpperCase())) {
                this._adapter.storage.removeItem(key);
            }
        }
    }
}