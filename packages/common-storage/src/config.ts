

export const cacheConfig = {
    enableStorageEncryption: true,
    DEFAULT_CACHE_TIME: 3000,
    prefixKey: "",
}


export const cacheCipher = {
    key: '_11111000001111@',
    iv: '@11111000001111_',
};


export enum StorageType {
    INDEXEDDB = "INDEXEDDB",
    WEBSTORAGE = "WEBSTORAGE"
}