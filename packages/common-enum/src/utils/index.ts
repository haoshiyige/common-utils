import { EnumItem } from '../types';
import { isFunction, isArray } from "@nin/shared";
/**
 * 工具函数集合
 */
export class EnumUtils {
    /**
      * @description 从配置中获取值
      * @private
      * @param item - 枚举项
      * @param config - 配置项，可以是函数、字符串或字符串数组
      * @returns 提取的值
      */
    static getValueFromConfig(item: any, config: ((item: any) => any) | string | string[]): any {
        if (isFunction(config)) {
            return config(item);
        } else if (isArray(config)) {
            return config.map(key => item[key]).filter(val => val !== undefined).join(" ");
        }
        return item[config];
    }
    
    /**
     * 创建排序函数
     */
    static createSortFunction<T extends string | number>(
        field: 'key' | 'label' | 'value' | ((a: EnumItem<T>, b: EnumItem<T>) => number)
    ): (a: EnumItem<T>, b: EnumItem<T>) => number {
        if (typeof field === 'function') return field;
        return (a: EnumItem<T>, b: EnumItem<T>) => {
            const aVal = a[field];
            const bVal = b[field];
            if (aVal === undefined && bVal === undefined) return 0;
            if (aVal === undefined) return 1;
            if (bVal === undefined) return -1;
            return String(aVal).localeCompare(String(bVal));
        };
    }
}