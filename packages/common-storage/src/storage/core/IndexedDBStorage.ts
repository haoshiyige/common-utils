import localforage from 'localforage';
import StorageHelper from '../adapter/StorageHelper';

export default class IndexedDBStorage {

    private storage: typeof localforage;

    private _helper: StorageHelper;

    private _prefixKey: string;

    private cacheName: string;
    
    constructor({ prefixKey, hasEncrypt = true, encryption, onExpire, cacheName }: {
        prefixKey: string;
        hasEncrypt?: boolean;
        encryption: { encryptByAES: (data: string) => string; decryptByAES: (data: string) => string };
        onExpire?: (key: string, expiredData: any) => void;
        cacheName: string
    }) {
        this.cacheName = cacheName;
        this.storage = localforage.createInstance({
            driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
            name: cacheName, // 可以考虑使用更具有描述性的名称
        });
        this._prefixKey = prefixKey;
        this._helper = new StorageHelper({ hasEncrypt, encryption, onExpire });
        // 启动初始化任务，但不阻塞构造函数的返回
        this._init();
    }

    /**
     * 异步设置缓存项，并可以选择设置过期时间。
     *
     * @param {string} key - 要存储数据的键。
     * @param {*} value - 要存储的数据。
     * @param {number} [expire] - 过期时间（单位`分`，默认`0`分钟，永久缓存）。
     * @returns {Promise<void>} - 一个 Promise 对象，表示设置操作的结果。
     */

    async setItemAsync(key: string, value: any, expire: number | null = null): Promise<void> {
        try {
            const data = this._helper.prepareData(value, expire);
            const encryptedData = this._helper.encryptData(data);
            await this.storage.setItem(this._helper.getKey(key, this._prefixKey), encryptedData);
            // 清除缓存中的旧数据
            this._helper.deleteCache(key);
            // this._helper.deleteCache(key);
        } catch (error) {
            console.error('Error setting item in storage:', error);
            throw error; // 直接传递捕获到的错误
        }
    }

    /**
     * 异步获取缓存项。
     *
     * @param {string} key - 要获取的键。
     * @param {*} [def=null] - 如果键不存在或已过期，默认返回的值。
     * @returns {Promise<T | null>} - 一个 Promise 对象，表示获取操作的结果。
     */
    async getItemAsync<T>(key: string, def: T | null = null): Promise<T | null> {
        // 先尝试从缓存中获取数据
        const cachedEntry = this._helper.getCache(key);
        if (cachedEntry) {
            console.log("=========走的缓存")
            return this._helper.handleCachedEntry<T>(key, cachedEntry, def);
        }
        try {
            // 异步从 localforage 获取数据
            const res = await this.storage.getItem<string>(this._helper.getKey(key, this._prefixKey));
            if (!res) return def;
            const decryptedData = this._helper.decryptData(res);
            let parsedData: { value: T; };
            try {
                parsedData = JSON.parse(decryptedData);
            } catch (parseError) {
                console.error(`Error parsing data for key ${key}:`, parseError);
                return def;
            }
            if (this._helper.isNotExpired(parsedData)) {
                // 将数据添加到缓存中
                this._helper.setCache(key, { data: parsedData });
                return parsedData.value as T;
            } else {
                // 清除过期数据
                await this.remove(key); // 等待 remove 完成
                return def;
            }
        } catch (error) {
            console.error('Error getting item from storage:', error);
            return def;
        }
    }

    /**
     * 异步从离线仓库中删除对应键名的值。
     *
     * @param {string} key - 键名。
     * @returns {Promise<boolean>} - 操作是否成功。
     */
    async remove(key: string): Promise<boolean> {
        try {
            await this.storage.removeItem(this._helper.getKey(key, this._prefixKey));
            // 从缓存中移除数据
            this._helper.deleteCache(key);
            return true;
        } catch (error) {
            console.error('Error removing item from storage:', error);
            return false;
        }
    }

    /**
     * 异步从离线仓库中删除所有的键名，重置数据库。
     *
     * @returns {Promise<boolean>} - 操作是否成功。
     */
    async clear(): Promise<boolean> {
        try {
            await this.storage.clear();
            // 清除所有缓存
            this._helper.clearCache();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    /**
     * 异步获取数据仓库中所有的key。
     *
     * @returns {Promise<string[]>} - 一个 Promise 对象，表示获取所有键的结果。
     */
    async allKeys(): Promise<string[]> {
        try {
            return await this.storage.keys();
        } catch (error) {
            console.error('Error fetching keys from storage:', error);
            throw new Error('Failed to fetch keys from storage');
        }
    }

    /**
     * 异步初始化数据。
     *
     * @returns {Promise<void>} - 一个 Promise 对象，表示初始化的结果。
     */
    private async _init(): Promise<void> {
        try {
            const keys = await this.storage.keys();
            for (const key of keys) {
                if (!key) continue;
                // 只处理带有指定前缀的键
                if (this._prefixKey && !key.startsWith(`${this._prefixKey}_`)) continue;
                try {
                    const item = await this.storage.getItem<string>(key);
                    if (!item) continue;
                    const decryptedData = this._helper.decryptData(item);
                    let parsedData: { value: any; };
                    try {
                        parsedData = JSON.parse(decryptedData);
                    } catch (parseError) {
                        console.error(`Error parsing data for key ${key}:`, parseError);
                        continue;
                    }
                    // 检查数据是否过期
                    if (this._helper.isNotExpired(parsedData)) {
                        // 将数据添加到缓存中
                        this._helper.setCache(key, { data: parsedData });
                    } else {
                        // 清除过期数据
                        await this.remove(key);
                    }
                } catch (error) {
                    console.error(`Error initializing item ${key}:`, error);
                }
            }
        } catch (error) {
            console.error('Error fetching keys from storage:', error);
        }
    }
}