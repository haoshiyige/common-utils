
import { createStorage as create, CreateStorageParams, createStorageIndexedDB as createIndexedDB } from './storage/storageCache';
import { cacheConfig } from "./config";
export type Options = Partial<CreateStorageParams>;
const { DEFAULT_CACHE_TIME, enableStorageEncryption, prefixKey } = cacheConfig;

const createOptions = (storage: Storage, options: Options = {}): Options => {
  return {
    // No encryption in debug mode
    hasEncrypt: enableStorageEncryption,
    storage,
    prefixKey: prefixKey,
    ...options,
  };
};
// const WebStorage = create(createOptions(sessionStorage));
const createStorage = (storage: Storage = sessionStorage, options: Options = {}) => {
  return create(createOptions(storage, options));
};

export const createSessionStorage = (options: Options = {}) => {
  return createStorage(sessionStorage, { ...options, timeout: DEFAULT_CACHE_TIME });
};

export const createLocalStorage = (options: Options = {}) => {
  return createStorage(localStorage, { ...options, timeout: DEFAULT_CACHE_TIME });
};
export const createIndexedDBStorage = (options: Options = {}) => {
  return createIndexedDB({ ...options, timeout: DEFAULT_CACHE_TIME, storageType: "INDEXEDDB" });
}