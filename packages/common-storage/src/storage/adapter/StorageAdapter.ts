export default class StorageAdapter {
    storage: Storage;
    // 新增的方法，将所有localStorage的其他方法代理到这个类
    constructor(storage: Storage) {
        this.storage = storage;
    }
    /**
     * 同步获取项。
     *
     * @param {string} key - 要获取的键。
     * @returns {string | null} - 存储的值或 null。
     */
    getItemSync(key: string): string | null {
        return this.storage.getItem(key);
    }

    /**
     * 异步获取项。
     *
     * @param {string} key - 要获取的键。
     * @returns {Promise<string | null>} - 一个 Promise 对象，表示获取操作的结果。
     */
    getItemAsync(key: string): Promise<string | null> {
        return new Promise((resolve) => {
            resolve(this.storage.getItem(key));
        });
    }

    /**
     * 同步设置项。
     *
     * @param {string} key - 要设置的键。
     * @param {string} value - 要存储的值。
     */
    setItemSync(key: string, value: string): void {
        this.storage.setItem(key, value);
    }

    /**
     * 异步设置项。
     *
     * @param {string} key - 要设置的键。
     * @param {string} value - 要存储的值。
     * @returns {Promise<void>} - 一个 Promise 对象，表示设置操作的结果。
     */
    setItemAsync(key: string, value: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.storage.setItem(key, value);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}