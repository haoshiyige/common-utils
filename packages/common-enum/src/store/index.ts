import { EnumFactory } from '../enumFactory';
import { EnumStorePlugin, EnumStoreConfig } from './types';
import { EnumUtils } from "./utils/index"

export class EnumStore {
    private enumMap: Map<string, EnumFactory<any>> = new Map();
    private observers: Set<(key: string, action: string) => void> = new Set();
    private config: Required<EnumStoreConfig>;
    private plugins: Map<string, EnumStorePlugin> = new Map();
    private static _arrayCache: Map<string, Array<{ label: string; value: any; key: string }>> = new Map();
    private static _jsonCache: Map<string, string> = new Map();
    private static _valueIndex: Map<string, Map<any, { label: string; value: any; key: string }>> = new Map();
    private static _labelIndex: Map<string, Map<string, { label: string; value: any; key: string }>> = new Map();
    private static _pluginOnChangeCache: Map<string, boolean> = new Map();

    constructor() {
        this.config = {
            enableCache: true,
            storagePrefix: 'enum_store_',
        };
    }

    // 获取缓存的JSON数据，如果不存在则生成并缓存
    private getJsonCache(key: string): string {
        if (!EnumStore._jsonCache.has(key)) {
            const factory = EnumUtils.getEnumFactory(key, this.enumMap);
            EnumStore._jsonCache.set(key, JSON.stringify(factory));
        }
        return EnumStore._jsonCache.get(key)!;
    }

    /**
     * 获取指定枚举的所有选项
     * @param key 枚举键名
     * @returns 选项数组
     */
    public getOptions(key: string): Array<{ label: string; value: any }> {
        if (this.config.enableCache && EnumStore._arrayCache.has(key)) {
            return EnumStore._arrayCache.get(key)!.map(item => ({ label: item.label, value: item.value }));
        }
        const items = EnumUtils.getArray(this.enumMap, EnumStore._arrayCache, key);
        const options = items.map(item => ({
            label: item.label,
            value: item.value
        }));
        if (this.config.enableCache) {
            EnumStore._arrayCache.set(key, items);
        }
        return options;
    }

    /**
     * 获取指定枚举的所有值
     * @param key 枚举键名
     */
    public getValues(key: string): any[] {
        const items = EnumUtils.getArray(this.enumMap, EnumStore._arrayCache, key);
        return items.map(item => item.value);
    }

    /**
     * 搜索枚举
     * @param key 枚举键名
     * @param searchText 搜索文本
     * @param fields 搜索字段，默认搜索 label
     */
    public search(key: string, searchText: string, fields: ('label' | 'value' | 'key')[] = ['label']): Array<{ label: string; value: any; key: string }> {
        const items = EnumUtils.getArray(this.enumMap, EnumStore._arrayCache, key);
        const lowerSearchText = searchText.toLowerCase();
        return items.filter(item => {
            return fields.some(field => {
                const fieldValue = String(item[field] || '').toLowerCase();
                return fieldValue.includes(lowerSearchText);
            });
        });
    }

    /**
     * 克隆枚举
     * @param sourceKey 源枚举键名
     * @param targetKey 目标枚举键名
     */
    public clone(sourceKey: string, targetKey: string): void {
        const factory = EnumUtils.getEnumFactory(sourceKey, this.enumMap);
        this.register(targetKey, factory.clone());
    }

    /**
     * 导出指定枚举为不同格式
     * @param key 枚举键名
     * @param format 导出格式
     */
    public exportEnum(key: string, format: 'json' | 'options' | 'map' = 'json'): any {
        switch (format) {
            case 'json':
                return this.getJsonCache(key);
            case 'options':
                return this.getOptions(key);
            case 'map':
                const items = EnumUtils.getArray(this.enumMap, EnumStore._arrayCache, key);
                return items.reduce<Record<string, string>>((acc, item) => {
                    if (item.value) {
                        acc[item.value] = item.label;
                    }
                    return acc;
                }, {});
            default:
                return this.getJsonCache(key);
        }
    }

    /**
     * 注册枚举工厂实例
     * @param key - 枚举键名
     * @param factory - 枚举工厂实例
     * @throws 如果键名已存在
     */
    public register<T extends string | number>(key: string, factory: EnumFactory<T>): void {
        if (this.enumMap.has(key)) {
            throw new Error(`Enum with key '${key}' already exists`);
        }
        this.enumMap.set(key, factory);
        EnumUtils.buildIndex(this.enumMap, EnumStore._valueIndex, EnumStore._labelIndex, key);
        EnumUtils.clearCache(EnumStore._arrayCache, EnumStore._jsonCache, key);
        this._notifyObservers(key, 'register');
    }

    /**
     * 获取枚举工厂实例
     * @param key - 枚举键名
     * @returns 枚举工厂实例
     * @throws 如果键名不存在
     */
    public get<T extends string | number>(key: string): EnumFactory<T> {
        return EnumUtils.getEnumFactory(key, this.enumMap);
    }

    /**
     * 获取当前配置
     */
    public getConfig(): Required<EnumStoreConfig> {
        return this.config;
    }

    /**
     * 更新枚举工厂实例
     * @param key - 枚举键名
     * @param factory - 新的枚举工厂实例
     * @throws 如果键名不存在
     */
    public update<T extends string | number>(key: string, factory: EnumFactory<T>): void {
        if (!this.enumMap.has(key)) {
            throw new Error(`Enum with key '${key}' not found`);
        }
        this.enumMap.set(key, factory);
        EnumUtils.buildIndex(this.enumMap, EnumStore._valueIndex, EnumStore._labelIndex, key);
        EnumUtils.clearCache(EnumStore._arrayCache, EnumStore._jsonCache, key);
        this._notifyObservers(key, 'update');
    }

    /**
     * 删除枚举工厂实例
     * @param key - 枚举键名
     */
    public remove(key: string): void {
        if (this.enumMap.delete(key)) {
            EnumUtils.clearCache(EnumStore._arrayCache, EnumStore._jsonCache, key);
            EnumStore._valueIndex.delete(key);
            EnumStore._labelIndex.delete(key);
            this._notifyObservers(key, 'remove');
        }
    }

    /**
     * 检查枚举是否存在
     * @param key - 枚举键名
     */
    public has(key: string): boolean {
        return this.enumMap.has(key);
    }

    /**
     * 获取所有注册的枚举键名
     */
    public getKeys(): string[] {
        return Array.from(this.enumMap.keys());
    }

    /**
     * 清空所有枚举
     */
    public clear(): void {
        this.enumMap.clear();
        EnumStore._arrayCache.clear();
        EnumStore._jsonCache.clear();
        EnumStore._valueIndex.clear();
        EnumStore._labelIndex.clear();
        this._notifyObservers('*', 'clear');
    }

    /**
     * 添加观察者
     * @param observer - 观察者回调函数
     * @returns 取消订阅函数
     */
    public subscribe(observer: (key: string, action: string) => void): () => void {
        this.observers.add(observer);
        return () => this.observers.delete(observer);
    }

    /**
     * 批量注册枚举
     * @param enums - 要注册的枚举对象
     */
    public registerBatch(enums: Record<string, EnumFactory<any>>): void {
        const keys = Object.keys(enums);
        keys.forEach(key => {
            if (this.enumMap.has(key)) {
                throw new Error(`Enum with key '${key}' already exists`);
            }
            const factory = enums[key];
            this.enumMap.set(key, factory);
        });
        keys.forEach(key => {
            if (!EnumStore._valueIndex.has(key) || !EnumStore._labelIndex.has(key)) {
                EnumUtils.buildIndex(this.enumMap, EnumStore._valueIndex, EnumStore._labelIndex, key);
            }
            EnumUtils.clearCache(EnumStore._arrayCache, EnumStore._jsonCache, key);
            this._notifyObservers(key, 'register');
        });
    }

    /**
     * 从导出的数据导入枚举
     * @param data - 导出的枚举数据
     */
    public import(data: string): void {
        try {
            const parsed = JSON.parse(data);
            Object.entries(parsed).forEach(([key, value]) => {
                this.enumMap.set(key, EnumFactory.fromJSON(JSON.stringify(value)));
                EnumUtils.buildIndex(this.enumMap, EnumStore._valueIndex, EnumStore._labelIndex, key);
                EnumUtils.clearCache(EnumStore._arrayCache, EnumStore._jsonCache, key);
            });
            Object.keys(parsed).forEach(key => {
                this._notifyObservers(key, 'import');
            });
        } catch (error) {
            console.error('Failed to import enum data:', error);
        }
    }

    /**
     * 通知所有观察者
     */
    private _notifyObservers(key: string, action: string, data?: any): void {
        this.observers.forEach(observer => observer(key, action));
        // 通知所有插件
        this.plugins.forEach((plugin, pluginName) => {
            if (EnumStore._pluginOnChangeCache.get(pluginName)) {
                plugin.onEnumChange!(key, action, data);
            }
        });
    }

    /**
     * 验证值是否在枚举中存在
     * @param key 枚举键名
     * @param value 要验证的值
     * @returns 是否存在
     */
    public validate(key: string, value: any): boolean {
        const index = this._getValueIndex(key);
        return index.has(value);
    }

    /**
     * 过滤枚举选项
     * @param key 枚举键名
     * @param predicate 过滤函数
     * @returns 过滤后的选项数组
     */
    public filter(key: string, predicate: (item: { label: string; value: any; key: string }) => boolean): Array<{ label: string; value: any; key: string }> {
        const items = EnumUtils.getArray(this.enumMap, EnumStore._arrayCache, key);
        return items.filter(predicate);
    }

    /**
     * 根据标签获取枚举值
     * @param key 枚举键名
     * @param label 标签文本
     * @returns 对应的枚举值
     */
    public getValueByLabel(key: string, label: string): any {
        const index = this._getLabelIndex(key);
        const item = index.get(label);
        return item?.value;
    }

    /**
     * 获取指定枚举的标签和值的映射对象
     * @param key 枚举键名
     * @returns Record<string, any> 标签和值的映射
     */
    public getLabelValueMap(key: string): Record<string, any> {
        const items = EnumUtils.getArray(this.enumMap, EnumStore._arrayCache, key);
        return items.reduce<Record<string, any>>((acc, item) => {
            acc[item.label] = item.value;
            return acc;
        }, {});
    }

    // 获取值索引
    private _getValueIndex(key: string): Map<any, { label: string; value: any; key: string }> {
        if (!EnumStore._valueIndex.has(key)) {
            EnumUtils.buildIndex(this.enumMap, EnumStore._valueIndex, EnumStore._labelIndex, key);
        }
        return EnumStore._valueIndex.get(key)!;
    }

    // 获取标签索引
    private _getLabelIndex(key: string): Map<string, { label: string; value: any; key: string }> {
        if (!EnumStore._labelIndex.has(key)) {
            EnumUtils.buildIndex(this.enumMap, EnumStore._valueIndex, EnumStore._labelIndex, key);
        }
        return EnumStore._labelIndex.get(key)!;
    }
}
const enumStore = new EnumStore();
function getEnumFactory(params: string | null | undefined) {
    if (params == null) { 
        // 检查 null 或 undefined
        console.error("params cannot be null or undefined");
        return null;
    }
    // 使用可选链操作符来简化代码
    return enumStore.get(params)?.disposedList ?? null;
}
export { enumStore, getEnumFactory };