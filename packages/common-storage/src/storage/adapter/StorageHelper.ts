import { isUndefinedOrNull } from '@nin/shared';
import { LRUCache } from "@nin/common-core";
import dayjs from 'dayjs';
export default class StorageHelper {
    private cache: LRUCache<string, any>;
    private hasEncrypt: boolean;
    private encryption: { encryptByAES: (data: string) => string; decryptByAES: (data: string) => string };
    private onExpire?: (key: string, expiredData: any) => void;
    private cacheSize?: number
    constructor({
        hasEncrypt = true,
        encryption,
        onExpire,
        cacheSize = 1000
    }: {
        hasEncrypt?: boolean;
        encryption: { encryptByAES: (data: string) => string; decryptByAES: (data: string) => string };
        onExpire?: (key: string, expiredData: any) => void;
        cacheSize?: number
    }) {
        this.cache = new LRUCache<string, any>(cacheSize);
        this.hasEncrypt = hasEncrypt;
        this.encryption = encryption;
        this.onExpire = onExpire;
        this.cacheSize = cacheSize;
    }

    /**
    * 生成带有前缀（如果有）并转换为大写的键。
    *
    * 
    * @param {string} key - 需要格式化的原始键。
    * @returns {string} - 带有前缀并转换为大写的键。
    */
    getKey(key: string, prefixKey?: string): string {
        // return `${prefixKey}${key}`.toUpperCase();
        return `${prefixKey ? `${prefixKey}_` : ''}${key}`.toUpperCase();
    }

    /**
    * 检查数据是否未过期。
    *
    * @param {any} data - 数据对象。
    * @returns {boolean} - 是否未过期。
    */
    isNotExpired(data: any): boolean {
        console.log("🚀 ~ StorageHelper ~ isNotExpired ~ data:", data)
        return isUndefinedOrNull(data.expire) || data.expire >= Date.now();
    }

    // 处理缓存中的数据
    handleCachedEntry<T>(key: string, cachedEntry: any, def: T | null = null): T | null {
        if (this.isNotExpired(cachedEntry.data)) {
            return cachedEntry.data.value as T;
        } else {
            // Remove expired data from cache
            this.cache.delete(key);
            if (this.onExpire) {
                this.onExpire(key, cachedEntry.data);
            }
            return def;
        }
    }

    /**
     * 异步加密数据（如果启用了加密）。
     *
     * @param {string} data - 要加密的数据。
     * @returns {Promise<string>} - 加密后的数据。
     */
    encryptData(data: string): string {
        try {
            return this.hasEncrypt ? this.encryption.encryptByAES(data) : data;
        } catch (error) {
            this._handleError('加密数据失败', error);
            throw error;
        }
    }

    /**
     * 解密数据（如果启用了解密数据）。
     *
     * @param {string} encryptedData - 要解密的数据。
     * @returns {Promise<string>} -解密后的数据。
     */
    decryptData(encryptedData: string): string {
        try {
            return this.hasEncrypt ? this.encryption.decryptByAES(encryptedData) : encryptedData;
        } catch (error) {
            this._handleError('加密数据失败', error);
            throw error;
        }
    }

    // 设置缓存
    setCache(key: string, value: any): void {
        this.cache.set(key, value);
    }

    // 从缓存中获取数据
    getCache(key: string): any | undefined {
        return this.cache.get(key);
    }

    // 从缓存中删除数据
    deleteCache(key: string): void {
        this.cache.delete(key);
    }

    // 清除所有缓存
    clearCache(): void {
        this.cache.clear();
    }



    /**
      * 准备要存储的数据。
      *
      * @param {*} value - 要存储的数据。
      * @param {number} [expire=0] - 过期时间（单位`分`，默认`0`分钟，永久缓存）。
      * @returns {string} - 准备好的 JSON 字符串。
    */
    prepareData(value: any, expire: number | null = null): string {
        const expireTime = !isUndefinedOrNull(expire) ? new Date().getTime() + expire * 60 * 1000 : null;
        if (this._calculateExpireTime(expire)) {

        }
        return JSON.stringify({
            value,
            time: Date.now(),
            expire: this._calculateExpireTime(expire), // 单位转换为毫秒
            isEncrypted: true,
            expireTime: this._expireTime(expire),
            cacheTime: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss')
        });
    }



    /**
     * 处理错误并记录日志。
     *
     * @param {string} message - 错误信息。
     * @param {any} error - 错误对象。
     */
    _handleError(message: string, error: any): void {
        console.error(message, error);
        throw new Error(message);
    }

    private _calculateExpireTime(expireMinutes: number | null | undefined): number | null {
        if (isUndefinedOrNull(expireMinutes)) {
            return null;
        }
        return new Date().getTime() + expireMinutes * 60 * 1000;
    }
    private _expireTime(expireMinutes: number | null | undefined): string | null {
        if (isUndefinedOrNull(expireMinutes)) {
            return null;
        }
        return dayjs(new Date().getTime() + expireMinutes * 60 * 1000).format('YYYY-MM-DD HH:mm:ss');
    }
}