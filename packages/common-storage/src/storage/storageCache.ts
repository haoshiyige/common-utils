import { cacheCipher } from "../config";
import { AesEncryption } from './cipher';
import IndexedDBStorage from "./core/IndexedDBStorage";
import WebStorage from "./core/WebStorage";
import { StorageType } from "../config"
export interface CreateStorageParams  {
  prefixKey: string;
  storage?: Storage;
  hasEncrypt: boolean;
  timeout?: number;
  storageType?: "INDEXEDDB" | "WEBSTORAGE";
  cacheName: string,
  key: string;
  iv: string;
}
export const createStorage = ({ prefixKey = 'WEBSTORAGE', storage = sessionStorage, key = cacheCipher.key, iv = cacheCipher.iv,
  timeout = null, hasEncrypt = true, storageType = "WEBSTORAGE" }: Partial<CreateStorageParams> = {}) => {

  if (hasEncrypt && [key.length, iv.length].some((item) => item !== 16)) {
    throw new Error('When hasEncrypt is true, the key or iv must be 16 bits!');
  }
  const encryption = new AesEncryption({ key, iv });
  if (storageType === StorageType.WEBSTORAGE) {
    return new WebStorage({ storage, prefixKey, hasEncrypt, encryption });
  }

};
export const createStorageIndexedDB = ({ prefixKey = 'INDEXEDDB_APP', storage = sessionStorage, key = cacheCipher.key, iv = cacheCipher.iv,
  timeout = null, hasEncrypt = true, storageType = "INDEXEDDB", cacheName = 'INDEXEDDB_APP' }: Partial<CreateStorageParams> = {}) => {

  if (hasEncrypt && [key.length, iv.length].some((item) => item !== 16)) {
    throw new Error('When hasEncrypt is true, the key or iv must be 16 bits!');
  }
  const encryption = new AesEncryption({ key, iv });
  if (storageType == StorageType.INDEXEDDB) {
    return new IndexedDBStorage({ prefixKey, hasEncrypt, encryption, cacheName });
  }
}
