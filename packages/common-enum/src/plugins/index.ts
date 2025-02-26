import { EnumStore, enumStore } from '../store';

/** Pinia 插件配置选项 */
interface PiniaPluginConfig {
    /** 是否自动同步数据 */
    autoSync?: boolean;
    /** 枚举存储实例 */
    enumStore?: EnumStore;
    /** store ID */
    storeId?: string;
    /** 是否开启调试日志 */
    debug?: boolean;
}

/** 创建 Pinia 插件 */
export const createPiniaPlugin = (config: PiniaPluginConfig = {}) => {
    console.log("🚀 ~ createPiniaPlugin ~ config:", config)
    const {
        storeId = 'enums',
        autoSync = true,
    } = config;
    /**
     * 批量更新状态
     */
    const batchUpdateState = (store: any, updates: Record<string, any[]>) => {
        if (Object.keys(updates).length === 0) return;
        store.$patch((state: Record<string, any>) => {
            state[storeId] = {
                ...state[storeId],
                ...Object.entries(updates).reduce((acc, [key, value]) => ({
                    ...acc,
                    [key]: Object.freeze(value)
                }), {})
            };
        });
    };

    /**
     * 同步初始数据
     */
    const syncInitialData = (store: any) => {
        if (!enumStore) return;
        const batchUpdate: Record<string, any[]> = {};
        enumStore.getKeys().forEach(key => {
            try {
                const enumData = enumStore.get(key);
                if (enumData) batchUpdate[key] = enumData.toArray();
            } catch (error) {
                console.error(`同步枚举 ${key} 失败:`, error);
            }
        });
        batchUpdateState(store, batchUpdate);
    };

    /**
     * 处理枚举变更
     */
    const handleEnumChange = (store: any, key: string, action: string) => {
        try {
            switch (action) {
                case 'register':
                case 'update': {
                    const enumData = enumStore?.get(key);
                    if (enumData) {
                        store.$patch((state: Record<string, any>) => {
                            state[storeId][key] = Object.freeze(enumData.toArray());
                        });
                        console.info(`${action} 枚举:`, key);
                    }
                    break;
                }
                case 'remove': {
                    store.$patch((state: Record<string, any>) => {
                        delete state[storeId][key];
                    });
                    console.info('删除枚举:', key);
                    break;
                }
                default:
                    console.info('未知的枚举操作:', action, key);
            }
        } catch (error) {
            console.error(`处理枚举变更失败 (${action}):`, key, error);
        }
    };

    /**
     * 初始化 store 辅助方法
     */
    const initStoreHelpers = (store: any) => {
        // 添加辅助方法
        // store["getEnum"] = (key: string) => store.$state[storeId][key];
        // store.getAllEnums = () => store.$state[storeId];
        // store.hasEnum = (key: string) => !!store.$state[storeId][key];
        // store.getEnumSize = () => Object.keys(store.$state[storeId]).length;
        // store.getEnumKeys = () => Object.keys(store.$state[storeId]);
    };

    // 返回插件函数
    return ({ store }: any) => {
        console.log("🚀 ~ return ~ store.$id !== storeId:", store.$id !== storeId, store.$id, storeId)
        if ((store.$id !== storeId)) return;
        // log.info('初始化插件')
        // 初始化状态结构
        if (!store.$state[storeId]) {
            store.$patch((state: Record<string, any>) => {
                state[storeId] = {};
            });
        }
        // 初始化辅助方法
        // initStoreHelpers(store);
        // 同步初始数据
        if (autoSync) syncInitialData(store);
        // 订阅枚举变更
        if (enumStore) {
            enumStore.subscribe((key: string, action: string) => {
                handleEnumChange(store, key, action);
            });
        }
    };
};
