import { enumStore, getEnumFactory } from "./store/index";
import { EnumFactory } from "./enumFactory"
import { isString } from "@nin/shared"
import { EnumStorePlugin } from "./store/types"








export { createPiniaPlugin } from "./plugins/index"

/**
 * 枚举工厂配置选项
 */

export interface EnumFactoryOptions {
    /** 是否启用严格模式 */
    strict?: boolean;
    /** 默认语言 */
    defaultLang?: 'zh' | 'en' | string;
    /** 自定义插件列表 */
    plugins?: EnumStorePlugin[];
    labelKeys?: ((item: any) => string) | string | string[],
    valueKeys?: ((item: any) => any) | string | string[],
    key?: ((item: any) => string) | string,
    /** 是否自动注册到全局store */
    isEnumStore?: boolean
}

/**
 * 创建枚举工厂实例
 * @param name 枚举名称，必须提供
 * @param enumObj 枚举对象或数组，必须提供
 * @param options 配置选项
 * @returns EnumFactory实例
 */

function defineEnum(
    name: string, // 必须提供，且为string类型
    enumObj: Record<string, string | { [key: string]: any }>,
    options: EnumFactoryOptions = {
        strict: false,          // 默认不启用严格模式
        defaultLang: 'zh',      // 默认语言设置为英语
        isEnumStore: true,     // 默认自动注册到全局store
        plugins: []             // 默认插件列表为空
    }
) {
    if (!name || (!isString(name))) {
        throw new Error('Name is required and must be a string.');
    }

    if (!enumObj) {
        throw new Error('EnumObj is required.');
    }

    const factory = new EnumFactory(name, enumObj, options);
    // 应用配置
    if (options.strict !== undefined) {
        factory.setStrictMode(options.strict);
    }
    if (options.defaultLang) {
        factory.setDefaultLang(options.defaultLang);
    }
    // 注册插件
    if (options.plugins?.length) {
        options.plugins.forEach(plugin => factory.use(plugin));
    }
    return factory;
}

export {
    enumStore, defineEnum, getEnumFactory
}