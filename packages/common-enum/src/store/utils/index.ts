
import { EnumFactory } from '../../enumFactory';


// EnumUtils.ts
export class EnumUtils {
   /**
    * 获取枚举工厂实例
    * @param key - 枚举键名
    * @param enumMap - 枚举映射
    * @returns 枚举工厂实例
    * @throws 如果键名不存在
    */
   static getEnumFactory<T extends string | number>(key: string, enumMap: Map<string, EnumFactory<T>>): EnumFactory<T> {
      const factory = enumMap.get(key);
      if (!factory) {
         throw new Error(`Enum with key '${key}' not found`);
      }
      return factory;
   }
   /**
    * 获取缓存的数组
    * @param enumMap - 枚举映射
    * @param arrayCache - 数组缓存
    * @param key - 枚举键名
    * @returns 选项数组
    */
   static getArray(enumMap: Map<string, EnumFactory<any>>, arrayCache: Map<string, any>, key: string): Array<{ label: string; value: any; key: string }> {
      if (!arrayCache.has(key)) {
         const factory = EnumUtils.getEnumFactory(key, enumMap);
         arrayCache.set(key, factory.toArray());
      }
      return arrayCache.get(key)!;
   }

   /**
    * 清除指定键的缓存
    * @param arrayCache - 数组缓存
    * @param jsonCache - JSON 缓存
    * @param key - 枚举键名
    */
   static clearCache(arrayCache: Map<string, Array<{ label: string; value: any; key: string }>>, jsonCache: Map<string, string>, key: string): void {
      arrayCache.delete(key);
      jsonCache.delete(key);
   }

   /**
    * 构建索引
    * @param enumMap - 枚举映射
    * @param valueIndex - 值索引
    * @param labelIndex - 标签索引
    * @param key - 枚举键名
    */
   static buildIndex(enumMap: Map<string, EnumFactory<any>>, valueIndex: Map<string, Map<any, { label: string; value: any; key: string }>>, labelIndex: Map<string, Map<string, { label: string; value: any; key: string }>>, key: string): void {
      const factory = EnumUtils.getEnumFactory(key, enumMap);
      const items = factory.toArray();
      const vi = new Map<any, { label: string; value: any; key: string }>();
      const li = new Map<string, { label: string; value: any; key: string }>();
      items.forEach(item => {
         // @ts-ignore
         vi.set(item.value, item);
         // @ts-ignore
         li.set(item.label, item);
      });
      valueIndex.set(key, vi);
      labelIndex.set(key, li);
   }

   // 其他需要抽离的方法...
}

