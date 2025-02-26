/**
 * 枚举工厂管理器配置
 */
export interface EnumFactoryManagerConfig {
    /** 是否启用缓存 */
    enableCache?: boolean;
    /** 缓存过期时间（毫秒） */
    cacheTTL?: number;
    /** 是否自动加载 */
    autoLoad?: boolean;
    /** 存储键前缀 */
    storagePrefix?: string;
}


/**
 * 枚举存储插件接口
 */
export interface EnumStorePlugin {
    /** 插件名称 */
    name: string;
    /** 初始化插件 */
    init?: (store: any) => void;
    /** 处理枚举变更 */
    onEnumChange?: (key: string, action: string, data?: any) => void;
    /** 销毁插件 */
    destroy?: () => void;
}


/**
 * 枚举存储配置
 */
export interface EnumStoreConfig {
    /** 是否启用缓存 */
    enableCache?: boolean;
    /** 缓存过期时间（毫秒） */
    // cacheTTL?: number;
    /** 存储键前缀 */
    storagePrefix?: string;
    // /** 是否持久化到localStorage */
    // persistent?: boolean;
    // /** 全局配置 */
    // global?: {
    //     /** 是否自动加载持久化数据 */
    //     autoLoad?: boolean;
    //     /** 是否启用调试模式 */
    //     debug?: boolean;
    //     /** 最大缓存数量 */
    //     maxCacheSize?: number;
    // };
}