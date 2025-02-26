import { isArray, isString } from "@nin/shared"
import { enumStore } from "./store/index"
import { EnumStorePlugin } from "./store/types"
import {
    EnumItem,
    EnumFactoryOptions,
    SelectOptions,
    SortOptions,
    ValidationResult,
    TransformOptions,
    PaginationOptions,
    PaginationResult,
    ExportOptions,
    CompareOptions,
    SearchOptions,
    ValidationRule,
    GroupOptions,
    CacheOptions,
    DiffResult,
    Statistics,
    SerializeOptions,
    AggregateOptions,
    HistoryRecord,
    ObserverCallback,
    IndexConfig,
    QueryOptions,
    MigrationConfig,
    CacheStrategy,
    TreeOptions,
    TreeNode,
    TreeSearchOptions,
    TreeSearchContext,
    TreeSearchResult,
} from './types';
import { EnumUtils } from './utils';

/**
 * 表示枚举项的基本结构
 * @template T - 枚举值的类型，可以是字符串或数字
 * 创建枚举工厂实例
 * @param enumObj - 枚举对象，可以是简单的键值对或复杂对象
 * @param options - 配置选项
 * @param options.labelKeys - 用于提取标签的键或函数
 * @param options.valueKeys - 用于提取值的键或函数
 * @param options.key - 用于提取键的键或函数
 */
export class EnumFactory<T extends string | number> {

    private name: string;
    /** 原始枚举对象 */
    public originList: Record<string, string | { [key: string]: any }>;
    /** 所有枚举键的数组 */
    public keys: string[];
    /** 处理后的枚举项列表 */
    public disposedList: any[];
    /** 所有标签的数组 */
    public labels: string[];
    /** 所有值的数组 */
    public values: (string | T)[];
    /** 通过键映射的枚举项 Map */
    private entriesMapByKey: Map<string, EnumItem<T>>;
    /** 通过标签映射的枚举项 Map */
    private entriesMapByLabel: Map<string, EnumItem<T>>;
    /** 通过值映射的枚举项 Map */
    private entriesMapByValue: Map<T, EnumItem<T>>;
    private strictMode: boolean = false;
    private defaultLang: string = 'zh'; // 假设默认语言是英语
    private plugins: EnumStorePlugin[] = [];
    private isEnumStore: boolean = true;

    /**
     * @description 构造函数，用于初始化枚举工厂
     * @param enumObj - 枚举对象，可以是简单的键值对或复杂对象
     * @param options - 配置选项
     * @param options.labelKeys - 用于提取标签的键或函数
     * @param options.valueKeys - 用于提取值的键或函数
     * @param options.key - 用于提取键的键或函数
     * @param options.isEnumFactory - 用于提取键的键或函数
     */
    constructor(
        name: string,
        enumObj: Record<string, string | { [key: string]: any }>,
        options: {
            labelKeys?: ((item: any) => string) | string | string[],
            valueKeys?: ((item: any) => T) | string | string[],
            key?: ((item: any) => string) | string,
            isEnumStore?: boolean
        } = {}
    ) {
        const { labelKeys = ["label"], valueKeys = ["value"], key = "key", isEnumStore = true } = options;
        this.name = name;
        this.originList = enumObj;
        this.isEnumStore = isEnumStore;
        const entries = Object.entries(enumObj);
        this.keys = [];
        this.labels = [];
        this.values = [];
        this.disposedList = [];
        // 创建Maps用于快速查找
        this.entriesMapByKey = new Map();
        this.entriesMapByLabel = new Map();
        this.entriesMapByValue = new Map();
        if (entries.length === 0) return;
        if (typeof enumObj[entries[0][0]] === 'string') {
            this._processSimpleEnum(entries);
        } else {
            this._processObjectEnum(entries, { labelKeys, valueKeys, key });
        }
        if ((this.isEnumStore)) {
            enumStore.register(this.name, this);
        }
    }



    /**
     * 设置严格模式
     * @param mode 是否启用严格模式
     */
    public setStrictMode(mode: boolean): void {
        this.strictMode = mode;
        console.log(`Strict mode has been set to ${this.strictMode}`);
    }

    /**
     * 设置默认语言
     * @param lang 语言代码
     */
    public setDefaultLang(lang: string): void {
        this.defaultLang = lang;
    }

    /**
     * 使用插件
     * @param plugin 插件实例
     */
    public use(plugin: EnumStorePlugin): void {
        this.plugins.push(plugin);
    }


    /**
     * @description 处理简单字符串枚举
     * @private
     * @param entries - 枚举项条目数组
     */
    private _processSimpleEnum(entries: [string, string | { [key: string]: any }][]): void {
        for (const [k, text] of entries) {
            const entry: EnumItem<any> = { key: k, label: text as string };
            this.entriesMapByKey.set(k, entry);
            this.entriesMapByLabel.set(text as string, entry);
            this.keys.push(k);
            this.labels.push(text as string);
            this.values.push(text as string);
        }
    }
    /**
    * @description 处理复杂对象枚举
    * @private
    * @param entries - 枚举项条目数组
    * @param options - 处理选项
    */
    private _processObjectEnum(entries: [string, string | { [key: string]: any }][], options: { labelKeys: ((item: any) => string) | string | string[], valueKeys: ((item: any) => T) | string | string[], key: ((item: any) => string) | string }): void {
        for (const [_, item] of entries) {
            const itemKey = EnumUtils.getValueFromConfig(item, options.key) as string;
            let itemText = EnumUtils.getValueFromConfig(item, options.labelKeys) as string;
            let itemValue: T | undefined = EnumUtils.getValueFromConfig(item, options.valueKeys) as T;
            const entry: EnumItem<T> = { key: itemKey, label: itemText, value: itemValue, };
            this.entriesMapByKey.set(itemKey, entry);
            this.entriesMapByLabel.set(itemText, entry);
            this.labels.push(itemText);
            this.keys.push(itemKey);
            // @ts-ignore
            this.disposedList.push({ ...item, ...entry, })
            if (itemValue !== undefined) {
                this.values.push(itemValue);
                this.entriesMapByValue.set(itemValue, entry);
            }
        }
    }




    /**
      * @description 根据键获取枚举项
      * @param key - 要查找的键
      * @returns 匹配的枚举项，如果不存在则返回 undefined
      */
    public getByKey(key: string): EnumItem<T> | undefined {
        return this.entriesMapByKey.get(key);
    }

    /**
    * @description 根据标签获取枚举项
    * @param text - 要查找的标签文本
    * @returns 匹配的枚举项，如果不存在则返回 undefined
    */
    public getByLabel(text: string): EnumItem<T> | undefined {
        return this.entriesMapByLabel.get(text);
    }

    /**
      * @description 根据值获取枚举项
      * @param value - 要查找的值
      * @returns 匹配的枚举项，如果不存在则返回 undefined
      */
    public getByValue(value: T): EnumItem<T> | undefined {
        return this.entriesMapByValue.get(value);
    }

    /**
     * @description 表格数据格式化函数
     * @param r - 行数据（未使用）
     * @param c - 列数据（未使用）
     * @param val - 要格式化的值
     * @returns 格式化后的标签文本
     */
    tableFormatter(r: any, c: any, val: string | T): string {
        let entry: EnumItem<T> | undefined;
        if (typeof val === 'string') {
            entry = this.entriesMapByKey.get(val) || this.entriesMapByLabel.get(val);
        } else {
            entry = this.entriesMapByValue.get(val);
        }
        return entry ? entry.label : 'notfound';
    }

    /**
     * @description 获取所有枚举项的列表
     */
    getAllItems(): EnumItem<T>[] {
        return Array.from(this.entriesMapByKey.values());
    }

    /**
     * @description 检查是否存在某个键
     */
    hasKey(key: string): boolean {
        return this.entriesMapByKey.has(key);
    }

    /**
     * @description 检查是否存在某个值
     */
    hasValue(value: T): boolean {
        return this.entriesMapByValue.has(value);
    }

    /**
     * @description 检查是否存在某个标签
     */
    hasLabel(text: string): boolean {
        return this.entriesMapByLabel.has(text);
    }

    /**
     * @description 获取所有键的列表
     */
    public getKeys(): string[] {
        return [...this.entriesMapByKey.keys()];
    }

    /**
     * @description 获取所有标签的列表
     */
    public getLabels(): string[] {
        return [...this.entriesMapByLabel.keys()];
    }

    /**
     * @description 获取所有值的列表
     */
    public getValues(): (string | T)[] {
        return [...this.entriesMapByValue.keys()];
    }

    /**
     * @description 根据索引获取枚举项
     */
    public getByIndex(index: number): EnumItem<T> | undefined {
        if (index >= 0 && index < this.keys.length) {
            return this.getByKey(this.keys[index]);
        }
        return undefined;
    }

    /**
     * 获取指定范围的枚举项
     * @param range - 范围数组 [开始索引, 结束索引]
     * @returns 指定范围的枚举项数组
     */
    getRange(start: number, end: number): EnumItem<T>[] {
        return this.keys.slice(start, end).map(key => this.getByKey(key)).filter(item => item) as EnumItem<T>[];
    }

    /**
     * 获取前n个数据项
     * 
     * 根据提供的数量参数n，返回存储库中前n个数据项的列表。如果某些键没有对应的数据项，则这些键会被忽略。
     * 
     * @param n - 需要获取的数据项的数量。
     * 
     * @returns 返回包含前n个数据项的数组。如果n大于可用数据项的数量，则返回所有可用的数据项。
     */
    getFirst(n: number): EnumItem<T>[] {
        return this.keys.slice(0, n).map(key => this.getByKey(key)).filter(item => item) as EnumItem<T>[];
    }

    /**
     * @description 根据标签搜索数据项
     * 
     * 在存储库中搜索具有特定标签的数据项。支持精确匹配和大小写敏感度选项。
     * 
     * @param searchText - 用于搜索的文本。
     * @param exactMatch - 是否需要精确匹配，默认为false，即允许部分匹配。
     * @param caseSensitive - 是否区分大小写，默认为false，即不区分大小写。
     * 
     * @returns 返回符合搜索条件的数据项列表。
     */
    public searchByLabel(searchText: string, exactMatch: boolean = false, caseSensitive: boolean = false): EnumItem<T>[] {
        let searchFunc;
        if (exactMatch) {
            // 精确匹配
            searchFunc = caseSensitive
                ? (text: string) => text === searchText
                : (text: string) => text.toLowerCase() === searchText.toLowerCase();
        } else {
            // 包含匹配
            searchFunc = caseSensitive
                ? (text: string) => text.includes(searchText)
                : (text: string) => text.toLowerCase().includes(searchText.toLowerCase());
        }
        return Array.from(this.entriesMapByLabel.values()).filter(entry => searchFunc(entry.label)).map(entry => entry);
    }
    /**
     * @description 根据值进行查找
     * @param searchValue 要查找的值
     * @param exactMatch 是否启用精确匹配，默认为false
     * @param caseSensitive 是否区分大小写，默认为false
     * @returns 返回匹配的枚举项列表
     */
    searchByValue(searchValue: T | string, exactMatch = false, caseSensitive = false): EnumItem<T>[] {
        let searchFunc;
        if (isString(searchValue)) {
            if (exactMatch) {
                // 精确匹配字符串
                searchFunc = caseSensitive ? (value: any) => value.toString() === searchValue
                    : (value: any) => value.toString().toLowerCase() === searchValue.toLowerCase();
            } else {
                // 包含匹配字符串
                searchFunc = caseSensitive ? (value: any) => value.toString().includes(searchValue)
                    : (value: any) => value.toString().toLowerCase().includes(searchValue.toLowerCase());
            }
        } else {
            // 对于非字符串类型的值，直接使用相等判断
            searchFunc = (value: any) => value === searchValue;
        }
        return Array.from(this.entriesMapByValue.values())
            .filter(entry => entry.value !== undefined && searchFunc(entry.value))
            .map(entry => entry);
    }
    /**
    *  @description 带高亮的文本搜索
    * @param searchText - 搜索文本
    * @param options - 搜索选项
    * @param options.caseSensitive - 是否区分大小写
    * @param options.exactMatch - 是否精确匹配
    * @param options.highlightColor - 高亮颜色
    * @returns 带高亮标记的枚举项数组
    */
    searchByTextWithHighlight(searchText: string, options: { caseSensitive?: boolean, exactMatch?: boolean, highlightColor?: string } = {}): EnumItem<T>[] {
        const { caseSensitive = false, exactMatch = false, highlightColor = '#ffff00' } = options;
        const searchFunc = exactMatch
            ? (text: string) => caseSensitive ? text === searchText : text.toLowerCase() === searchText.toLowerCase()
            : (text: string) => caseSensitive ? text.includes(searchText) : text.toLowerCase().includes(searchText.toLowerCase());
        return Array.from(this.entriesMapByLabel.values())
            .filter(entry => searchFunc(entry.label))
            .map(entry => {
                let highlightedText;
                if (exactMatch) {
                    // 对于精确匹配，直接替换整个字符串（如果匹配）
                    highlightedText = entry.label === searchText || (!caseSensitive && entry.label.toLowerCase() === searchText.toLowerCase())
                        ? `<mark style="background-color:${highlightColor};">${entry.label}</mark>`
                        : entry.label;
                } else {
                    // 对于模糊匹配，只高亮匹配的部分
                    const regExp = new RegExp(`(${searchText})`, caseSensitive ? 'g' : 'gi');
                    highlightedText = entry.label.replace(regExp, `<mark style="background-color:${highlightColor};">$1</mark>`);
                }
                return { ...entry, label: highlightedText };
            });
    }
    /**
     * @description 反转枚举项顺序
     */
    reverse(): void {
        this.keys.reverse();
        this.labels.reverse();
        this.values.reverse();
        this.disposedList.reverse();
    }

    /**
     * @description 基于自定义条件过滤枚举项
     * @param predicate - 过滤函数
     * @returns 过滤后的枚举项数组
     */
    public filter(predicate: (item: EnumItem<T>) => boolean): EnumItem<T>[] {
        return this.getAllItems().filter(predicate);
    }

    /**
     * @description 根据条件过滤枚举项
     * @param predicate - 过滤函数
     * @returns 过滤后的枚举项数组
     */
    public updateItem(oldKey: string, newItem: Partial<EnumItem<T>>): void {
        const existingItem = this.getByKey(oldKey);
        if (!existingItem) {
            throw new Error(`Item with key ${oldKey} does not exist.`);
        }
        const updatedItem = { ...existingItem, ...newItem };
        this.entriesMapByKey.set(updatedItem.key, updatedItem);
        this.entriesMapByLabel.set(updatedItem.label, updatedItem);
        if (updatedItem.value !== undefined) {
            this.entriesMapByValue.set(updatedItem.value, updatedItem);
        } else if (existingItem.value !== undefined) {
            this.entriesMapByValue.delete(existingItem.value);
        }
        // 更新相关数组
        const index = this.keys.indexOf(oldKey);
        this.keys[index] = updatedItem.key;
        this.labels[index] = updatedItem.label;
        this.values[index] = updatedItem.value as any;
    }


    /**
     * 获取所有枚举条目
     */
    public getAllEntries(): EnumItem<T>[] {
        return Array.from(this.entriesMapByKey.values());
    }
    /**
     * @description  删除枚举条目
     * @param key 要删除的条目的键
    */
    public deleteEntry(key: string): void {
        const entry = this.entriesMapByKey.get(key);
        if (!entry) return;
        this.entriesMapByKey.delete(key);
        this.entriesMapByLabel.delete(entry.label);
        if (entry.value !== undefined) {
            this.entriesMapByValue.delete(entry.value);
        }
        // 更新keys, labels, values数组
        this.keys = Array.from(this.entriesMapByKey.keys());
        this.labels = Array.from(this.entriesMapByLabel.keys());
        this.values = Array.from(this.entriesMapByValue.keys());
    }


    /**
     * @description 更新枚举项
     * @param key - 要更新的枚举项的键
     * @param newItem - 新的枚举项数据
     * @throws 如果指定的键不存在
     */
    public updateEntry(key: string, newItem: Partial<EnumItem<T>>): void {
        const originalEntry = this.entriesMapByKey.get(key);
        if (!originalEntry) return;
        const updatedEntry: EnumItem<T> = { ...originalEntry, ...newItem };
        this.entriesMapByKey.set(key, updatedEntry);
        // 更新相关映射
        this.entriesMapByLabel.delete(originalEntry.label);
        this.entriesMapByLabel.set(updatedEntry.label, updatedEntry);
        if (originalEntry.value !== undefined) {
            this.entriesMapByValue.delete(originalEntry.value);
        }
        if (updatedEntry.value !== undefined) {
            this.entriesMapByValue.set(updatedEntry.value, updatedEntry);
        }
    }



    /**
     * 将枚举项转换为下拉选择框选项格式
     * @param valueField - 值字段名称，默认为 'value'
     * @param labelField - 标签字段名称，默认为 'label'
     * @param extraFields - 额外需要包含的字段
     * @returns 选择框选项数组
     */
    public toSelectOptions(options: SelectOptions = {}): Array<Record<string, any>> {
        const {
            valueField = 'value',
            labelField = 'label',
            extraFields = []
        } = options;

        return this.disposedList.map(item => {
            const result: Record<string, any> = {
                [valueField]: item.value ?? item.key,
                [labelField]: item.label
            };

            extraFields.forEach(field => {
                if (field in item) {
                    result[field] = item[field];
                }
            });

            return result;
        });
    }

    /**
     * 将枚举项转换为键值对对象
     * @param valueType - 值的类型，'value' 使用 value 字段，'label' 使用 label 字段
     * @returns 键值对对象
     */
    public toObject(valueType: 'value' | 'label' = 'value'): Record<string, T | string> {
        return this.getAllItems().reduce((acc, item) => ({
            ...acc,
            [item.key]: valueType === 'value' ? (item.value ?? item.key) : item.label
        }), {});
    }

    /**
     * 按照指定字段对枚举项进行排序
     * @param field - 排序字段，可以是 'key', 'label', 'value' 或自定义函数
     * @param direction - 排序方向，'asc' 或 'desc'
     */
    public sort(options: SortOptions<T>): void {
        const { field, direction = 'asc' } = options;
        const sortFn = EnumUtils.createSortFunction(field);
        this.disposedList.sort((a, b) => direction === 'asc' ? sortFn(a, b) : sortFn(b, a));
        // 更新所有相关数组
        this.keys = this.disposedList.map(item => item.key);
        this.labels = this.disposedList.map(item => item.label);
        this.values = this.disposedList.map(item => item.value as T);
    }


    /**
     * 批量添加枚举项
     * @param items - 要添加的枚举项数组
     * @throws 如果存在重复的键或值
     */
    public addBatch(items: Array<EnumItem<T>>): void {
        // 先验证所有项
        const validations = items.map(item => ({
            item,
            validation: this.validateItem(item)
        }));
        const invalidItems = validations.filter(v => !v.validation.isValid);
        if (invalidItems.length > 0) {
            throw new Error(`Invalid items found: ${invalidItems.map(i => `${i.item.key}: ${i.validation.errors.join(', ')}`).join('; ')}`);
        }
        // 添加验证通过的项
        items.forEach(this._addItem.bind(this));
    }


    /**
     * 添加单个枚举项
     */
    private _addItem(item: EnumItem<T>): void {
        this.entriesMapByKey.set(item.key, item);
        this.entriesMapByLabel.set(item.label, item);
        if (item.value !== undefined) {
            this.entriesMapByValue.set(item.value, item);
        }

        this.disposedList.push(item);
        this.keys.push(item.key);
        this.labels.push(item.label);
        if (item.value !== undefined) {
            this.values.push(item.value);
        }
    }

    /**
     * 获取指定枚举项的相邻项
     * @param key - 当前枚举项的键
     * @returns 相邻项对象，包含前一项和后一项
     */
    public getAdjacent(key: string): { prev?: EnumItem<T>, next?: EnumItem<T> } {
        const currentIndex = this.disposedList.findIndex(item => item.key === key);
        if (currentIndex === -1) return {};
        return {
            prev: currentIndex > 0 ? this.disposedList[currentIndex - 1] : undefined,
            next: currentIndex < this.disposedList.length - 1 ? this.disposedList[currentIndex + 1] : undefined
        };
    }

    /**
     * 导出为 JSON 字符串
     * @param pretty - 是否美化输出
     * @returns JSON 字符串
     */
    public toJSON(pretty: boolean = false): string {
        return JSON.stringify(this.disposedList, null, pretty ? 2 : 0);
    }

    /**
     * 从 JSON 字符串导入枚举项
     * @param json - JSON 字符串
     * @throws 如果 JSON 格式无效
     */
    static fromJSON<T extends string | number>(json: string): EnumFactory<T> {
        try {
            const data = JSON.parse(json);
            if (!isArray(data)) {
                throw new Error('JSON must be an array of enum items');
            }
            const enumObj = data.reduce((acc: Record<string, any>, item: EnumItem<T>) => {
                if (!item.key || !item.label) {
                    throw new Error('Invalid enum item format');
                }
                acc[item.key] = item;
                return acc;
            }, {} as Record<string, EnumItem<T>>);
            return new EnumFactory<T>(this.name, enumObj, { isEnumStore: false });
        } catch (error) {
            // @ts-ignore
            throw new Error(`Failed to parse JSON: ${error.message}`);
        }
    }

    /**
     * 创建枚举项的深拷贝
     * @returns 新的枚举工厂实例
     */
    public clone(): EnumFactory<T> {
        const clonedEnum = new EnumFactory<T>(this.name, {});
        clonedEnum.entriesMapByKey = new Map(this.entriesMapByKey);
        clonedEnum.entriesMapByLabel = new Map(this.entriesMapByLabel);
        clonedEnum.entriesMapByValue = new Map(this.entriesMapByValue);
        clonedEnum.keys = [...this.keys];
        clonedEnum.labels = [...this.labels];
        clonedEnum.values = [...this.values];
        clonedEnum.disposedList = JSON.parse(JSON.stringify(this.disposedList));
        clonedEnum.originList = { ...this.originList };
        return clonedEnum;
    }

    /**
     * 验证枚举项是否有效
     * @param item - 要验证的枚举项
     * @returns 验证结果对象
     */
    public validateItem(item: Partial<EnumItem<T>>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        if (!item.key) {
            errors.push('键值不能为空');
        }
        if (!item.label) {
            errors.push('标签不能为空');
        }
        if (item.key && this.hasKey(item.key)) {
            errors.push('键值已存在');
        }
        if (item.value !== undefined && this.hasValue(item.value as T)) {
            errors.push('值已存在');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }



    /**
      *  @description 更新内部数组
      */
    private _updateArraysFromDisposedList(): void {
        this.keys.length = 0;
        this.labels.length = 0;
        this.values.length = 0;

        this.disposedList.forEach(item => {
            this.keys.push(item.key);
            this.labels.push(item.label);
            if (item.value !== undefined) {
                this.values.push(item.value);
            }
        });
    }
    /**
     * @description 分页获取枚举项
     * 该方法根据提供的分页选项对枚举项进行分页处理，并返回分页结果。
     * 
     * @param options - 分页选项，包含以下属性：
     * @param options.pageNum - 页码，默认为 1。
     * @param options.pageSize - 每页的项数，默认为 10。
     * @param options.withTotal - 是否包含总项数和总页数信息，默认为 true。
     * 
     * @returns 分页结果对象，包含以下属性：
     * @returns result.items - 分页后的枚举项数组。
     * @returns result.pageNum - 当前页码。
     * @returns result.pageSize - 每页的项数。
     * @returns result.total - 总项数（如果 withTotal 为 true）。
     * @returns result.totalPages - 总页数（如果 withTotal 为 true）。
     * 
     * @example
     * ```typescript
     * // 示例使用
     * const enumFactory = new EnumFactory({...});
     * const paginationOptions: PaginationOptions = { pageNum: 2, pageSize: 5, withTotal: true };
     * const paginationResult = enumFactory.paginate(paginationOptions);
     * console.log(paginationResult);
     * // 输出可能如下：
     * // {
     * //   items: [枚举项数组],
     * //   pageNum: 2,
     * //   pageSize: 5,
     * //   total: 20,
     * //   totalPages: 4
     * // }
     * ```
     */
    public paginate(options: PaginationOptions): PaginationResult<EnumItem<T>> {
        const { pageNum = 1, pageSize = 10, withTotal = true } = options;
        const start = (pageNum - 1) * pageSize;
        const end = start + pageSize;
        const items = this.disposedList.slice(start, end);
        const result: PaginationResult<EnumItem<T>> = { items, pageNum, pageSize };
        if (withTotal) {
            result.total = this.disposedList.length;
            result.totalPages = Math.ceil(this.disposedList.length / pageSize);
        }
        return result;
    }

    /**
    * 将枚举项转换为 Map 对象
    * 该方法根据指定的键字段和值字段，将枚举项列表转换为一个 Map 对象。
    * 可以通过指定 `keyField` 和 `valueField` 来确定 Map 中的键和值的来源。
    *
    * @param keyField - 用于作为 Map 的键的枚举项字段，默认为 'key'。
    * @param valueField - 用于作为 Map 的值的枚举项字段，默认为 'value'。
    * 
    * @returns 转换后的 Map 对象，键为 `keyField` 对应的枚举项属性，值为 `valueField` 对应的枚举项属性。
    * 
    * @example
    * ```typescript
    * // 示例使用
    * const enumFactory = new EnumFactory({...});
    * // 假设枚举项的结构为 { key: 'item1', label: 'Item One', value: 1 }
    * const map = enumFactory.toMap();
    * console.log(map);
    * // 输出可能如下：
    * // Map(1) { 'item1' => 1 }
    * 
    * const mapWithCustomFields = enumFactory.toMap('label', 'key');
    * console.log(mapWithCustomFields);
    * // 输出可能如下：
    * // Map(1) { 'Item One' => 'item1' }
    * ```
    */

    // public toMap(keyField: keyof EnumItem<T> = 'key', valueField: keyof EnumItem<T> = 'value'): Map<any, any> {
    //     return new Map(this.disposedList.map(item => [item[keyField], item[valueField]]));
    // }

    /**
     * 批量更新枚举项
     * @param updates - 更新数据，键为枚举项的key，值为要更新的数据
     */
    public batchUpdate(updates: Record<string, Partial<EnumItem<T>>>): void {
        Object.entries(updates).forEach(([key, updateData]) => {
            const item = this.getByKey(key);
            if (item) this.updateItem(key, updateData);
        });
    }

    /**
     * 移动枚举项位置
     * @param fromKey - 要移动的项的键
     * @param toKey - 目标位置的项的键
     */
    public moveItem(fromKey: string, toKey: string): void {
        const fromIndex = this.disposedList.findIndex(item => item.key === fromKey);
        const toIndex = this.disposedList.findIndex(item => item.key === toKey);
        if (fromIndex === -1 || toIndex === -1) return;
        const [item] = this.disposedList.splice(fromIndex, 1);
        this.disposedList.splice(toIndex, 0, item);
        this._updateArraysFromDisposedList();
    }

    /**
     * 对枚举项进行转换
     * @param options - 转换选项
     * @returns 转换后的数组
     */
    public transform<R>(options: TransformOptions = {}): R[] {
        const { includeUndefined = false, transform } = options;
        return this.disposedList.filter(item => includeUndefined || item.value !== undefined).map(item => transform ? transform(item) : item as unknown as R);
    }


    /**
     * 交换两个枚举项的位置
     * @param key1 - 第一个项的键
     * @param key2 - 第二个项的键
     */
    public swapItems(key1: string, key2: string): void {
        const index1 = this.disposedList.findIndex(item => item.key === key1);
        const index2 = this.disposedList.findIndex(item => item.key === key2);
        if (index1 === -1 || index2 === -1) return;
        [this.disposedList[index1], this.disposedList[index2]] = [this.disposedList[index2], this.disposedList[index1]];
        this._updateArraysFromDisposedList();
    }

    /**
     * 获取统计信息
     * @returns 统计信息对象
     */
    public getStats(): Record<string, number> {
        return {
            total: this.disposedList.length,
            withValue: this.disposedList.filter(item => item.value !== undefined).length,
            withoutValue: this.disposedList.filter(item => item.value === undefined).length
        };
    }

    /**
     * 导出枚举数据
     * 此方法根据提供的导出选项将枚举数据导出为不同的格式。支持的格式包括 JSON、CSV 和对象。
     *
     * @param options - 导出选项，包含以下属性：
     * @param options.format - 导出格式，默认为 'json'，可选值为 'json'、'csv'、'object' 等。
     * @param options.pretty - 是否格式化输出，仅适用于 'json' 格式，默认为 false。
     * @param options.fields - 要导出的字段列表，默认为 ['key', 'label', 'value']。
     * @param options.separator - 仅适用于 CSV 格式，字段之间的分隔符，默认为 ','。
     *
     * @returns 导出的数据，格式为字符串。
     *
     * @throws Error 如果使用了不支持的导出格式，将抛出错误。
     *
     * @example
     * ```typescript
     * const enumFactory = new EnumFactory({...});
     * const exportOptions: ExportOptions = { format: 'json', pretty: true };
     * try {
     *     const exportedData = enumFactory.export(exportOptions);
     *     console.log(exportedData);
     * } catch (error) {
     *     console.error(error.message);
     * }
     * ```
    */

    public export(options: ExportOptions = {}): string {
        const {
            format = 'json',
            pretty = false,
            fields = ['key', 'label', 'value'],
            separator = ','
        } = options;
        const data = this.disposedList.map(item =>
            fields.reduce((acc, field) => ({
                ...acc,
                [field]: item[field]
            }), {} as Record<string, any>)
        );
        switch (format) {
            case 'json':
                try {
                    return JSON.stringify(data, null, pretty ? 2 : 0);
                } catch (jsonError) {
                    // @ts-ignore
                    throw new Error(`Failed to export data in JSON format: ${jsonError.message}`);
                }
            case 'csv':
                try {
                    const header = fields.join(separator);
                    const rows = data.map(item => fields.map(field => String(item[field] ?? '')).join(separator));
                    return [header, ...rows].join('\n');
                } catch (csvError) {
                    // @ts-ignore
                    throw new Error(`Failed to export data in CSV format: ${csvError.message}`);
                }
            case 'object':
                try {
                    return JSON.stringify(data.reduce((acc, item) => ({ ...acc, [item.key]: item }), {}));
                } catch (objectError) {
                    // @ts-ignore
                    throw new Error(`Failed to export data in object format: ${objectError.message}`);
                }
            // case 'xml':
            //     try {
            //         // 示例：使用一个假设的 xml 转换函数 xmlConverter，实际使用时需要实现或引入相关库
            //         const xmlData = xmlConverter(data);
            //         return xmlData;
            //     } catch (xmlError) {
            //         throw new Error(`Failed to export data in XML format: ${xmlError.message}`);
            //     }
            // case 'yaml':
            //     try {
            //         // 示例：使用一个假设的 yaml 转换函数 yamlConverter，实际使用时需要实现或引入相关库
            //         const yamlData = yamlConverter(data);
            //         return yamlData;
            //     } catch (yamlError) {
            //         throw new Error(`Failed to export data in YAML format: ${yamlError.message}`);
            //     }
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }
    /**
     * 比较两个枚举项
     * @param item1 - 第一个枚举项
     * @param item2 - 第二个枚举项
     * @param options - 比较选项
     * @returns 是否相等
     */
    public compareItems(item1: EnumItem<T>, item2: EnumItem<T>, options: CompareOptions<T> = {}): boolean {
        const { fields = ['key', 'label', 'value'], strict = true } = options;
        return fields.every(field => {
            if (strict) return item1[field] === item2[field];
            return String(item1[field]) === String(item2[field]);
        });
    }

    /**
     * 执行枚举项的搜索操作。
     * 该方法根据提供的查询字符串和搜索选项，在枚举项列表中查找匹配的项。
     * 可以指定搜索的字段、是否区分大小写、是否进行模糊搜索和结果数量限制。
     *
     * @param query - 要搜索的字符串。
     * @param options - 搜索选项，包含以下属性：
     * @param options.fields - 搜索时要检查的字段列表，默认为 ['key', 'label']。
     * @param options.caseSensitive - 是否区分大小写，默认为 false。
     * @param options.fuzzy - 是否进行模糊搜索，默认为 true。
     * @param options.limit - 结果数量的限制，默认为无限制。
     *
     * @returns 匹配的枚举项数组。
     *
     * @example
     * ```typescript
     * const enumFactory = new EnumFactory({...});
     * // 假设枚举项列表包含：[{ key: 'item1', label: 'Item One', value: 1 }, { key: 'item2', label: 'Another Item', value: 2 }]
     * // 执行搜索
     * const searchOptions: SearchOptions = { fields: ['label'], caseSensitive: false, fuzzy: true, limit: 1 };
     * const searchResults = enumFactory.search('item', searchOptions);
     * console.log(searchResults);
     * // 输出可能如下：
     * // [{ key: 'item1', label: 'Item One', value: 1 }]
     * ```
     */
    public search(query: string, options: SearchOptions = {}): EnumItem<T>[] {
        const {
            fields = ['key', 'label'],
            caseSensitive = false,
            fuzzy = true,
            limit
        } = options;
        const searchQuery = caseSensitive ? query : query.toLowerCase();
        const results = this.disposedList.filter(item => {
            return fields.some(field => {
                const value = String(item[field] ?? '');
                const compareValue = caseSensitive ? value : value.toLowerCase();
                if (fuzzy) return compareValue.includes(searchQuery);
                return compareValue === searchQuery;
            });
        });
        return limit ? results.slice(0, limit) : results;
    }

    /**
     * 添加自定义验证规则
     * @param rules - 验证规则数组
     */
    private validationRules: ValidationRule<T>[] = [];

    public addValidationRules(rules: ValidationRule<T>[]): void {
        this.validationRules.push(...rules);
    }

    /**
     * 使用自定义规则验证枚举项
     * @param item - 要验证的枚举项
     * @returns 验证结果
     */
    public validateWithRules(item: EnumItem<T>): ValidationResult {
        const errors: string[] = [];
        for (const rule of this.validationRules) {
            const value = item[rule.field];
            if (!rule.validator(value)) {
                errors.push(rule.message);
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 获取重复项
     * @param field - 要检查的字段
     * @returns 重复的项
     */
    public getDuplicates(field: keyof EnumItem<T>): EnumItem<T>[] {
        const valueMap = new Map<any, EnumItem<T>[]>();
        this.disposedList.forEach(item => {
            const value = item[field];
            if (!valueMap.has(value)) {
                valueMap.set(value, []);
            }
            valueMap.get(value)!.push(item);
        });
        return Array.from(valueMap.values()).filter(items => items.length > 1).flat();
    }

    /**
     * 合并另一个枚举工厂实例
     * @param other - 要合并的枚举工厂实例
     * @param strategy - 合并策略
     */
    public merge(other: EnumFactory<T>, strategy: 'skip' | 'override' | 'throw' = 'skip'): void {
        other.disposedList.forEach(item => {
            const exists = this.hasKey(item.key);
            if (exists) {
                switch (strategy) {
                    case 'skip':
                        return;
                    case 'override':
                        this.updateItem(item.key, item);
                        break;
                    case 'throw':
                        throw new Error(`Duplicate key found: ${item.key}`);
                }
            } else {
                this._addItem(item);
            }
        });
    }

    /**
     * 创建枚举项的快照
     * @returns 快照数据
     */
    public createSnapshot(): string {
        return JSON.stringify({
            disposedList: this.disposedList,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 从快照恢复
     * @param snapshot - 快照数据
     */
    public restoreFromSnapshot(snapshot: string): void {
        try {
            const { disposedList } = JSON.parse(snapshot);
            this.entriesMapByKey.clear();
            this.entriesMapByLabel.clear();
            this.entriesMapByValue.clear();
            this.disposedList.length = 0;
            this.keys.length = 0;
            this.labels.length = 0;
            this.values.length = 0;
            disposedList.forEach(this._addItem.bind(this));
        } catch (error: unknown) {
            throw new Error(`Failed to restore from snapshot: ${(error as Error).message}`);
        }
    }

    /**
     * 批量操作
     * @param operations - 操作数组
     */
    public batch(operations: Array<{
        type: 'add' | 'update' | 'delete';
        key?: string;
        data?: Partial<EnumItem<T>>;
    }>): void {
        const snapshot = this.createSnapshot();
        try {
            operations.forEach(op => {
                switch (op.type) {
                    case 'add':
                        if (op.data) {
                            this._addItem(op.data as EnumItem<T>);
                        }
                        break;
                    case 'update':
                        if (op.key && op.data) {
                            this.updateItem(op.key, op.data);
                        }
                        break;
                    case 'delete':
                        if (op.key) {
                            this.deleteEntry(op.key);
                        }
                        break;
                }
            });
        } catch (error) {
            // 如果出错，恢复到操作前的状态
            this.restoreFromSnapshot(snapshot);
            throw error;
        }
    }

    private cache: Map<string, { value: any; timestamp: number }> = new Map();

    /**
     * 高级分组功能
     * @param options - 分组选项
     * @returns 分组结果
     */
    public groupBy(options: GroupOptions<T>): Record<string, EnumItem<T>[]> {
        const { by, sort = 'asc', keepEmpty = false } = options;
        const groups: Record<string, EnumItem<T>[]> = {};
        this.disposedList.forEach(item => {
            const key = typeof by === 'function' ? by(item) : String(item[by]);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });
        // 排序处理
        Object.keys(groups).forEach(key => {
            if (!keepEmpty && groups[key].length === 0) {
                delete groups[key];
                return;
            }
            groups[key].sort((a, b) => {
                const comparison = a.label.localeCompare(b.label);
                return sort === 'asc' ? comparison : -comparison;
            });
        });
        return groups;
    }

    /**
     * 带缓存的获取方法
     * @param key - 缓存键
     * @param fetcher - 数据获取函数
     * @param options - 缓存选项
     * @returns 缓存的结果
     */
    public getCached<R>(key: string, fetcher: () => R, options: CacheOptions = {}): R {
        const { ttl = 5000, autoRefresh = false } = options;
        const now = Date.now();
        const cached = this.cache.get(key);
        if (cached && now - cached.timestamp < ttl) {
            return cached.value;
        }
        const value = fetcher();
        this.cache.set(key, { value, timestamp: now });
        if (autoRefresh) {
            setTimeout(() => {
                this.cache.delete(key);
            }, ttl);
        }
        return value;
    }

    /**
     * 比较两个枚举工厂实例的差异
     * @param other - 要比较的枚举工厂实例
     * @returns 差异结果
     */
    public diff(other: EnumFactory<T>): DiffResult<T> {
        const result: DiffResult<T> = {
            added: [],
            removed: [],
            modified: []
        };
        // 检查新增和修改的项
        other.disposedList.forEach(item => {
            const existing = this.getByKey(item.key);
            if (!existing) {
                result.added.push(item);
            } else if (!this.compareItems(item, existing)) {
                result.modified.push({
                    key: item.key,
                    before: existing,
                    after: item
                });
            }
        });
        // 检查删除的项
        this.disposedList.forEach(item => {
            if (!other.getByKey(item.key)) result.removed.push(item);
        });
        return result;
    }

    /**
     * 获取详细统计信息
     * @returns 统计信息
     */
    public getDetailedStats(): Statistics {
        const stats: Statistics = {
            total: this.disposedList.length,
            byValue: {},
            byLabel: {},
            empty: 0,
            distribution: {}
        };
        this.disposedList.forEach(item => {
            // 值统计
            const value = String(item.value ?? 'undefined');
            stats.byValue[value] = (stats.byValue[value] || 0) + 1;
            // 标签统计
            stats.byLabel[item.label] = (stats.byLabel[item.label] || 0) + 1;
            // 空值统计
            if (item.value === undefined) {
                stats.empty++;
            }
            // 分布统计
            const valueType = typeof item.value;
            stats.distribution[valueType] = (stats.distribution[valueType] || 0) + 1;
        });
        return stats;
    }

    /**
     * 创建枚举项的迭代器
     */
    public *[Symbol.iterator](): Iterator<EnumItem<T>> {
        yield* this.disposedList;
    }

    /**
     * 批量验证
     * @param items - 要验证的枚举项数组
     * @returns 验证结果
     */
    public validateBatch(items: Array<Partial<EnumItem<T>>>): Array<{
        item: Partial<EnumItem<T>>;
        result: ValidationResult;
    }> {
        return items.map(item => ({
            item,
            result: this.validateWithRules(item as EnumItem<T>)
        }));
    }

    /**
     * 创建枚举项的深层代理
     * @param key - 枚举项的键
     * @returns 代理对象
     */
    public createProxy(key: string): EnumItem<T> {
        const item = this.getByKey(key);
        if (!item) {
            throw new Error(`Item with key ${key} not found`);
        }
        return new Proxy(item, {
            get: (target, prop) => {
                if (prop === 'value' && target.value === undefined) {
                    return target.key;
                }
                return target[prop as keyof typeof target];
            },
            set: (target, prop, value) => {
                if (prop in target) {
                    this.updateItem(key, { [prop as keyof typeof target]: value });
                    return true;
                }
                return false;
            }
        });
    }

    private history: HistoryRecord<T>[] = [];
    private observers: Set<ObserverCallback<T>> = new Set();
    private metadata: Map<string, any> = new Map();
    // ... existing code ...
    /**
     * 添加观察者
     * @param callback - 观察者回调函数
     * @returns 取消订阅函数
     */
    public subscribe(callback: ObserverCallback<T>): () => void {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }
    /**
     * 通知所有观察者
     */
    private notifyObservers(action: 'add' | 'update' | 'delete', item: EnumItem<T>, metadata?: any): void {
        this.observers.forEach(observer => observer(action, item, metadata));
    }

    /**
     * 记录历史
     */
    private addHistory(record: HistoryRecord<T>): void {
        this.history.push({ ...record, timestamp: Date.now() });
    }

    /**
     * 获取操作历史
     * @param limit - 限制返回的记录数
     */
    public getHistory(limit?: number): HistoryRecord<T>[] {
        const records = [...this.history];
        return limit ? records.slice(-limit) : records;
    }

    /**
     * 设置元数据
     */
    public setMetadata(key: string, value: any): void {
        this.metadata.set(key, value);
    }

    /**
     * 获取元数据
     */
    public getMetadata(key: string): any {
        return this.metadata.get(key);
    }

    /**
     * 序列化枚举工厂
     */
    public serialize(options: SerializeOptions = {}): string {
        const { format = 'json', compress = false, withMetadata = false } = options;
        const data = {
            items: this.disposedList,
            ...(withMetadata ? { metadata: Object.fromEntries(this.metadata) } : {})
        };
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, compress ? 0 : 2);
            case 'yaml':
                // 需要安装 js-yaml 依赖
                throw new Error('YAML format not implemented');
            case 'xml':
                // 需要安装 xml 相关依赖
                throw new Error('XML format not implemented');
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }


    /**
     * 创建枚举项的时间序列
     */
    public createTimeSeries(timeField: keyof EnumItem<T>, valueField: keyof EnumItem<T>, interval: 'day' | 'week' | 'month' = 'day'): Array<{ time: string; value: any }> {
        return this.disposedList.sort((a, b) => new Date(a[timeField]).getTime() - new Date(b[timeField]).getTime()).map(item => ({
            time: new Date(item[timeField]).toISOString(),
            value: item[valueField]
        }));
    }

    /**
     * 聚合计算
     */
    public aggregate(options: AggregateOptions<T>): Record<string, any> {
        const { groupBy, aggregate, fn } = options;
        const groups = this.groupBy({ by: groupBy });
        const result: Record<string, any> = {};
        for (const [key, items] of Object.entries(groups)) {
            const values = items.map(item => item[aggregate]);

            if (typeof fn === 'function') {
                result[key] = fn(values);
            } else {
                switch (fn) {
                    case 'sum':
                        result[key] = values.reduce((a, b) => Number(a) + Number(b), 0);
                        break;
                    case 'avg':
                        result[key] = values.reduce((a, b) => Number(a) + Number(b), 0) / values.length;
                        break;
                    case 'count':
                        result[key] = values.length;
                        break;
                    case 'min':
                        result[key] = Math.min(...values.map(Number));
                        break;
                    case 'max':
                        result[key] = Math.max(...values.map(Number));
                        break;
                }
            }
        }

        return result;
    }
    /**
     * 批量更新带有乐观锁
     */
    public batchUpdateWithLock(updates: Array<{ key: string; data: Partial<EnumItem<T>>; version: number }>): { success: string[]; failed: string[] } {
        const result = { success: [], failed: [] };
        updates.forEach(({ key, data, version }) => {
            const item = this.getByKey(key);
            if (!item || item.version !== version) {
                result.failed.push(key as never);
                return;
            }
            try {
                this.updateItem(key, { ...data, version: version + 1 });
                result.success.push(key as never);
            } catch {
                result.failed.push(key as never);
            }
        });
        return result;
    }

    /**
      * 创建枚举项的依赖图
      */
    public createDependencyGraph(dependencyField: keyof EnumItem<T>): Map<string, Set<string>> {
        const graph = new Map<string, Set<string>>();
        this.disposedList.forEach(item => {
            const dependencies = item[dependencyField];
            if (isArray(dependencies)) {
                graph.set(item.key, new Set(dependencies));
            }
        });
        return graph;
    }
    /**
       * 检查循环依赖
       */
    public checkCircularDependencies(dependencyField: keyof EnumItem<T>): string[][] {
        const graph = this.createDependencyGraph(dependencyField);
        const cycles: string[][] = [];
        const visited = new Set<string>();
        const path: string[] = [];
        function dfs(node: string) {
            if (path.includes(node)) {
                const cycle = path.slice(path.indexOf(node));
                cycles.push(cycle);
                return;
            }
            if (visited.has(node)) return;
            visited.add(node);
            path.push(node);
            const dependencies = graph.get(node) || new Set();
            dependencies.forEach(dep => dfs(dep));
            path.pop();
        }
        graph.forEach((_, node) => dfs(node));
        return cycles;
    }

    /**
    * @description 创建枚举项的树形结构
    */
    public createTree(parentField: keyof EnumItem<T>, childrenField: string = 'children'): Record<string, any>[] {
        const items = [...this.disposedList];
        const map = new Map<string, any>();
        const roots: Record<string, any>[] = [];
        items.forEach(item => {
            map.set(item.key, { ...item, [childrenField]: [] });
        });
        items.forEach(item => {
            const node = map.get(item.key);
            const parentKey = item[parentField];
            if (parentKey && map.has(parentKey)) {
                map.get(parentKey)[childrenField].push(node);
            } else {
                roots.push(node);
            }
        });
        return roots;
    }

    /**
    * 执行自定义聚合操作
    */
    public customAggregate<R>(aggregator: (items: EnumItem<T>[]) => R, filter?: (item: EnumItem<T>) => boolean): R {
        const items = filter ? this.disposedList.filter(filter) : this.disposedList;
        return aggregator(items);
    }

    private indexes: Map<string, Map<string, Set<string>>> = new Map();
    private version: number = 1;
    private migrations: MigrationConfig<T>[] = [];

    /**
     * @description 创建索引
     * 
     * 根据提供的配置创建一个索引来加速数据查询。
     * 如果设置了唯一约束(unique=true)，则确保索引字段的组合值是唯一的。
     * 
     * @param config - 索引配置对象，包含以下属性：
     * - fields: (string[]) 必须，用于创建索引的数据项中的字段名数组。
     * - unique: (boolean) 可选，默认为false。如果设置为true，则要求索引字段的组合值必须唯一。
     * - name: (string) 可选，索引名称，默认使用fields数组连接后的字符串作为名称。
     * 
     * @throws 当unique设置为true且发现重复值时，抛出错误提示违反唯一性约束。
     */
    public createIndex(config: IndexConfig): void {
        const { fields, unique = false, name = fields.join('_') } = config;
        const index = new Map<string, Set<string>>();

        this.disposedList.forEach(item => {
            const indexKey = fields.map(field => item[field]).join('|');
            if (!index.has(indexKey)) {
                index.set(indexKey, new Set());
            }
            if (unique && index.get(indexKey)!.size > 0) {
                throw new Error(`Unique constraint violation for index ${name}`);
            }
            index.get(indexKey)!.add(item.key);
        });

        this.indexes.set(name, index);
    }

    /**
     * 高级查询
     * 
     * 提供灵活的数据查询能力，包括过滤、排序、分页和字段选择。
     * 
     * @param options - 查询选项对象，包含以下属性：
     * - where: ({[key: string]: any}) 可选。用于过滤结果的条件。支持字符串匹配、正则表达式、函数等。
     * - orderBy: ([string, 'asc' | 'desc'][]) 可选。指定排序规则的数组，每个元素是一个元组，第一个元素是字段名，第二个元素是排序方向。
     * - offset: (number) 可选。指定从第几条记录开始返回。
     * - limit: (number) 可选。限制返回的最大记录数。
     * - select: (string[]) 可选。指定需要返回的字段名数组。
     * 
     * @returns 返回符合查询条件的记录列表。
     * 
     * @example
     * 
     *       * // 简单查询所有记录
     *   let result = repo.query({});
     *   console.log(result);
    *
     *   // 查询名字为'John Doe'的记录
     *   result = repo.query({ where: { name: 'John Doe' } });
     *   console.log(result);
    *
     *   // 查询年龄大于等于30的记录，并按年龄升序排序
     *   result = repo.query({
     *       where: { age: (age) => age >= 30 },
     *       orderBy: [['age', 'asc']]
     *   });
     *   console.log(result);
    *
     *   // 分页获取数据，跳过第一条，限制返回两条
     *   result = repo.query({ offset: 1, limit: 2 });
     *   console.log(result);
    *
     *   // 只选择特定字段
     *   result = repo.query({ select: ['name'] });
     *   console.log(result);
     * 
     * 
     */
    public query(options: QueryOptions<T>): EnumItem<T>[] {
        let result = [...this.disposedList];
        // 应用where条件
        if (options.where) {
            result = result.filter(item => {
                return Object.entries(options.where!).every(([key, value]) => {
                    if (value instanceof RegExp) {
                        return value.test(String(item[key]));
                    }
                    if (typeof value === 'function') {
                        return value(item[key]);
                    }
                    return item[key] === value;
                });
            });
        }
        // 应用排序
        if (options.orderBy) {
            result.sort((a, b) => {
                for (const [field, direction] of options.orderBy!) {
                    const aVal = a[field];
                    const bVal = b[field];
                    const comparison = String(aVal).localeCompare(String(bVal));
                    if (comparison !== 0) {
                        return direction === 'asc' ? comparison : -comparison;
                    }
                }
                return 0;
            });
        }
        // 应用分页
        if (options.offset) {
            result = result.slice(options.offset);
        }
        if (options.limit) {
            result = result.slice(0, options.limit);
        }
        // 选择字段
        if (options.select) {
            result = result.map(item => {
                const selected: Partial<EnumItem<T>> = {};
                options.select!.forEach(field => {
                    selected[field] = item[field];
                });
                return selected as EnumItem<T>;
            });
        }
        return result;
    }

    /**
     * 添加数据迁移
     * 
     * 将新的迁移配置添加到现有的迁移列表中，并根据版本号对所有迁移进行排序。
     * 这有助于确保在执行数据迁移时按照正确的顺序处理。
     * 
     * @param migration - 迁移配置对象，包含以下属性：
     * - version: (number) 必须。表示迁移的版本号，用于确定迁移执行的顺序。
     * - migrate: ((data: T[]) => void) 必须。实际执行迁移操作的函数，接收当前的数据列表作为参数。
     */
    public addMigration(migration: MigrationConfig<T>): void {
        this.migrations.push(migration);
        this.migrations.sort((a, b) => a.version - b.version);
    }

    /**
     * 执行数据迁移
     * @param targetVersion - 目标版本
     */
    public async migrate(targetVersion: number): Promise<void> {
        const currentVersion = this.version;

        if (targetVersion > currentVersion) {
            // 升级
            for (const migration of this.migrations) {
                if (migration.version <= currentVersion) continue;
                if (migration.version > targetVersion) break;
                this.disposedList = await migration.up(this.disposedList);
            }
        } else if (targetVersion < currentVersion) {
            // 降级
            for (const migration of this.migrations.reverse()) {
                if (migration.version > currentVersion) continue;
                if (migration.version <= targetVersion) break;
                this.disposedList = await migration.down(this.disposedList);
            }
        }

        this.version = targetVersion;
        this._updateArraysFromDisposedList();
    }


    /**
     * 从缓存恢复
     * @param key - 缓存键
     * @param strategy - 缓存策略
     */
    public restoreFromCache(key: string, strategy: CacheStrategy = 'memory'): boolean {
        let data: string | null = null;
        switch (strategy) {
            case 'memory':
                const cached = this.cache.get(key);
                data = cached?.value ?? null;
                break;
            case 'localStorage':
                data = localStorage.getItem(key);
                break;
            case 'sessionStorage':
                data = sessionStorage.getItem(key);
                break;
        }
        if (data) {
            const parsed = JSON.parse(data);
            this.disposedList = parsed.items;
            if (parsed.metadata) {
                this.metadata = new Map(Object.entries(parsed.metadata));
            }
            this._updateArraysFromDisposedList();
            return true;
        }
        return false;
    }

    /**
     * 批量导入数据
     * @param items - 要导入的数据
     * @param options - 导入选项
     */
    public async bulkImport(
        items: Array<Partial<EnumItem<T>>>,
        options: {
            skipValidation?: boolean;
            batchSize?: number;
            onProgress?: (progress: number) => void;
        } = {}
    ): Promise<{ success: number; failed: number; errors: Error[] }> {
        const { skipValidation = false, batchSize = 100, onProgress } = options;
        const result = { success: 0, failed: 0, errors: [] as Error[] };
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            try {
                if (!skipValidation) {
                    const validations = this.validateBatch(batch);
                    const invalid = validations.filter(v => !v.result.isValid);
                    if (invalid.length > 0) {
                        throw new Error(`Validation failed for ${invalid.length} items`);
                    }
                }
                await Promise.all(batch.map(async item => {
                    try {
                        this._addItem(item as EnumItem<T>);
                        result.success++;
                    } catch (error) {
                        result.failed++;
                        result.errors.push(error as Error);
                    }
                }));
                if (onProgress) onProgress((i + batch.length) / items.length);
            } catch (error) {
                result.failed += batch.length;
                result.errors.push(error as Error);
            }
        }

        return result;
    }

    /**
     * 创建枚举项的快照并返回差异
     * @param snapshot - 快照数据
     */
    public diffWithSnapshot(snapshot: string): {
        added: EnumItem<T>[];
        removed: EnumItem<T>[];
        modified: Array<{ key: string; changes: Partial<EnumItem<T>> }>;
    } {
        const snapshotData = JSON.parse(snapshot);
        const currentKeys = new Set(this.keys);
        const snapshotKeys = new Set(snapshotData.items.map((item: { key: any; }) => item.key));

        const added = this.disposedList.filter(item => !snapshotKeys.has(item.key));
        const removed = snapshotData.items.filter((item: { key: string; }) => !currentKeys.has(item.key));
        const modified = this.disposedList
            .filter(current => {
                const snapshot = snapshotData.items.find((item: { key: any; }) => item.key === current.key);
                return snapshot && !this.compareItems(current, snapshot);
            })
            .map(item => ({
                key: item.key,
                changes: this.getItemChanges(
                    item,
                    snapshotData.items.find((i: { key: any; }) => i.key === item.key)
                )
            }));

        return { added, removed, modified };
    }

    /**
     * 获取两个枚举项之间的差异
     */
    private getItemChanges(current: EnumItem<T>, previous: EnumItem<T>): Partial<EnumItem<T>> {
        const changes: Partial<EnumItem<T>> = {};
        Object.keys(current).forEach(key => {
            if (current[key] !== previous[key]) {
                changes[key] = current[key];
            }
        });
        return changes;
    }

    /**
     * 将枚举列表转换为树形结构
     * @param options - 树形结构配置选项
     * @returns 树形结构数组
     * @example
     * 
     * ```
     * // 基本树形结构转换
     * const tree = enumFactory.toTree({
     *    parentField: 'parentId',
     *      childrenField: 'children',
     *      rootParentValue: null
     *  });
     * 
     * // 带有自定义转换的树形结构
     * const customTree = enumFactory.toTree({
     * parentField: 'parentId',
     * fieldMapping: {
     *  key: 'id',
     *  label: 'name'
     * },
     * transform: (node) => ({
     *  ...node,
     *  title: `${node.label} (${node.key})`,
     *  expanded: false
     * }),
     * sort: (a, b) => a.label.localeCompare(b.label),
     * withTreeInfo: true
     * });
     */
    public toTree(options: TreeOptions<T>): TreeNode<T>[] {
        const {
            parentField,
            childrenField = 'children',
            rootParentValue = null,
            fieldMapping = {},
            transform,
            sort,
            keepEmptyChildren = false,
            withTreeInfo = false
        } = options;
        // 创建节点映射
        const nodeMap = new Map<string, TreeNode<T>>();
        const roots: TreeNode<T>[] = [];

        // 第一次遍历：创建所有节点
        this.disposedList.forEach(item => {
            // 应用字段映射和转换
            const node: TreeNode<T> = transform
                ? transform(item)
                : Object.entries(item).reduce((acc, [key, value]) => ({
                    ...acc,
                    [fieldMapping[key] || key]: value
                }), {} as TreeNode<T>);

            // 初始化子节点数组
            node[childrenField] = [];
            nodeMap.set(item.key, node);
        });

        // 第二次遍历：构建树形结构
        this.disposedList.forEach(item => {
            const node = nodeMap.get(item.key)!;
            const parentKey = item[parentField];
            if (parentKey === rootParentValue) {
                roots.push(node);
            } else {
                const parentNode = nodeMap.get(parentKey as string);
                if (parentNode) {
                    parentNode[childrenField].push(node);
                } else {
                    // 处理孤立节点
                    roots.push(node);
                }
            }
        });
        // 递归处理树节点
        const processNode = (
            node: TreeNode<T>,
            level: number = 0,
            parentPath: string[] = []
        ): void => {
            const currentPath = [...parentPath, node.key];
            const children = node[childrenField] as TreeNode<T>[];
            // 添加树形结构信息
            if (withTreeInfo) {
                node.treeInfo = {
                    level,
                    path: currentPath,
                    isLeaf: children.length === 0,
                    parentKey: parentPath[parentPath.length - 1],
                    index: children.length,
                    siblings: children.length
                };
            }
            // 排序子节点
            if (sort && children.length > 0) {
                children.sort(sort);
            }
            // 更新子节点索引和同级节点数量
            children.forEach((child, index) => {
                if (withTreeInfo) {
                    // @ts-ignore
                    child.treeInfo = {
                        ...child.treeInfo,
                        index,
                        siblings: children.length
                    };
                }
                processNode(child, level + 1, currentPath);
            });
            // 处理空子节点数组
            if (!keepEmptyChildren && children.length === 0) {
                delete node[childrenField];
            }
        };
        // 排序根节点
        if (sort) {
            roots.sort(sort);
        }
        // 处理所有根节点
        roots.forEach((root, index) => {
            if (withTreeInfo) {
                // @ts-ignore
                root.treeInfo = {
                    ...root.treeInfo,
                    index,
                    siblings: roots.length
                };
            }
            processNode(root);
        });
        return roots;
    }

    /**
     * 在树形结构中查找节点
     * @param predicate - 查找条件函数，接收节点和上下文参数
     * @param options - 查找选项
     * @param options.mode - 搜索模式，'dfs'(深度优先) 或 'bfs'(广度优先)，默认 'dfs'
     * @param options.findAll - 是否查找所有匹配项，默认 false
     * @param options.maxDepth - 最大搜索深度，默认 Infinity
     * @param options.includeAncestors - 是否包含祖先节点，默认 false
     * @param options.includeDescendants - 是否包含后代节点，默认 false
     * @param options.resultTransform - 结果转换函数
     * @returns 查找结果数组
     * 
     * @example
     * // 基本查找
     * const result = enumFactory.findInTree(
     *   node => node.key === 'targetKey',
     *   { parentField: 'parentId' }
     * );
     * 
     * // 高级查找示例
     * const results = enumFactory.findInTree(
     *   (node, context) => {
     *     return node.value > 100 && 
     *            context.depth < 3 &&
     *            context.ancestors.some(a => a.type === 'folder');
     *   },
     *   {
     *     parentField: 'parentId',
     *     mode: 'bfs',
     *     findAll: true,
     *     includeAncestors: true,
     *     maxDepth: 3
     *   }
     * );
     * 
     * // 使用结果转换
     * const transformedResults = enumFactory.findInTree(
     *   node => node.type === 'file',
     *   {
     *     parentField: 'parentId',
     *     resultTransform: (node, context) => ({
     *       id: node.key,
     *       path: context.path.map(n => n.label).join('/')
     *     })
     *   }
     * );
     * 
     * @test
     * it('should find node by key', () => {
     *   const result = enumFactory.findInTree(node => node.key === 'key1');
     *   expect(result[0].node.key).toBe('key1');
     * });
     * 
     * it('should respect maxDepth option', () => {
     *   const results = enumFactory.findInTree(
     *     () => true,
     *     { maxDepth: 2, findAll: true }
     *   );
     *   expect(results.every(r => r.depth <= 2)).toBe(true);
     * });
     */
    public findInTree(predicate: (node: TreeNode<T>, context: TreeSearchContext<T>) => boolean, options: TreeSearchOptions<T> = {
        parentField: ""
    }): TreeSearchResult<T>[] {
        const {
            mode = 'dfs',
            findAll = false,
            maxDepth = Infinity,
            includeAncestors = false,
            includeDescendants = false,
            resultTransform,
            ...treeOptions
        } = options;

        const tree = this.toTree(treeOptions);
        const results: TreeSearchResult<T>[] = [];
        let matchCount = 0;

        /**
         * 获取节点的所有子孙节点
         */
        const getDescendants = (node: TreeNode<T>): TreeNode<T>[] => {
            const descendants: TreeNode<T>[] = [];
            const stack = [...(node.children || [])];

            while (stack.length) {
                const current = stack.pop()!;
                descendants.push(current);
                if (current.children) {
                    stack.push(...current.children);
                }
            }

            return descendants;
        };

        /**
         * 深度优先搜索
         */
        const dfs = (
            nodes: TreeNode<T>[],
            path: TreeNode<T>[] = [],
            depth: number = 0
        ): void => {
            if (depth > maxDepth) return;

            for (const node of nodes) {
                const currentPath = [...path, node];
                const ancestors = path;
                const descendants = includeDescendants ? getDescendants(node) : [];

                const context: TreeSearchContext<T> = {
                    path: currentPath,
                    depth,
                    ancestors,
                    descendants,
                    matchCount
                };

                if (predicate(node, context)) {
                    const result: TreeSearchResult<T> = {
                        node: resultTransform
                            ? resultTransform(node, context)
                            : node,
                        path: currentPath,
                        ancestors: includeAncestors ? ancestors : [],
                        descendants: includeDescendants ? descendants : [],
                        depth,
                        index: matchCount,
                        treeInfo: undefined
                    };

                    results.push(result);
                    matchCount++;

                    if (!findAll) {
                        return;
                    }
                }

                if (node.children?.length) {
                    dfs(node.children, currentPath, depth + 1);
                }
            }
        };

        /**
         * 广度优先搜索
         */
        const bfs = (roots: TreeNode<T>[]): void => {
            const queue: Array<{
                node: TreeNode<T>;
                path: TreeNode<T>[];
                depth: number;
            }> = roots.map(node => ({ node, path: [node], depth: 0 }));

            while (queue.length) {
                const { node, path, depth } = queue.shift()!;

                if (depth > maxDepth) continue;

                const ancestors = path.slice(0, -1);
                const descendants = includeDescendants ? getDescendants(node) : [];

                const context: TreeSearchContext<T> = {
                    path,
                    depth,
                    ancestors,
                    descendants,
                    matchCount
                };

                if (predicate(node, context)) {
                    const result: TreeSearchResult<T> = {
                        node: resultTransform
                            ? resultTransform(node, context)
                            : node,
                        path,
                        ancestors: includeAncestors ? ancestors : [],
                        descendants: includeDescendants ? descendants : [],
                        depth,
                        index: matchCount,
                        treeInfo: undefined
                    };

                    results.push(result);
                    matchCount++;

                    if (!findAll) {
                        return;
                    }
                }

                if (node.children?.length) {
                    queue.push(
                        ...node.children.map(child => ({
                            node: child,
                            path: [...path, child],
                            depth: depth + 1
                        }))
                    );
                }
            }
        };

        // 执行搜索
        if (mode === 'dfs') {
            dfs(tree);
        } else {
            bfs(tree);
        }

        return results;
    }

    /**
     * 获取节点的所有祖先节点
     * @param key - 要查找的节点键
     * @param options - 树形结构配置选项
     * @param options.parentField - 父节点字段名
     * @returns 祖先节点数组，从近到远排序
     * 
     * @example
     * // 获取节点的所有祖先
     * const ancestors = enumFactory.getAncestors('nodeKey', {
     *   parentField: 'parentId'
     * });
     * 
     * // 处理祖先节点
     * ancestors.forEach(ancestor => {
     *   console.log(
     *     `Level ${ancestor.treeInfo.level}: ${ancestor.label}`
     *   );
     * });
     * 
     * @test
     * it('should return ancestors in correct order', () => {
     *   const ancestors = enumFactory.getAncestors('leaf', {
     *     parentField: 'parentId'
     *   });
     *   expect(ancestors.map(a => a.key)).toEqual(['parent', 'grandparent']);
     * });
     * 
     * it('should return empty array for root node', () => {
     *   const ancestors = enumFactory.getAncestors('root', {
     *     parentField: 'parentId'
     *   });
     *   expect(ancestors).toHaveLength(0);
     * });
   */
    public getAncestors(key: string, options: TreeOptions<T>): TreeNode<T>[] {
        // 确保必要的选项
        const treeOptions = {
            ...options,
            withTreeInfo: true
        };

        // 构建树并查找目标节点
        const targetNode = this.findInTree(
            node => node.key === key,
            {
                ...treeOptions,
                includeAncestors: true,
                mode: 'dfs'
            }
        )[0];

        if (!targetNode) {
            return [];
        }
        // 使用查找结果中的祖先节点信息
        return targetNode.ancestors.map(ancestor => ({
            ...ancestor,
            treeInfo: {
                ...ancestor.treeInfo,
                isLeaf: false,
                index: targetNode.ancestors.indexOf(ancestor),
                level: targetNode.ancestors.indexOf(ancestor),
                isAncestor: true,
                path: ancestor.treeInfo?.path || [],
                siblings: targetNode.ancestors.length // 添加默认值
            }
        }));
    }

    /**
     * 获取节点的完整路径信息
     * @param key - 节点键
     * @param options - 树形结构配置选项
     * @returns 包含祖先、当前节点、后代和层级的路径信息
     * 
     * @example
     * // 获取节点完整路径
     * const pathInfo = enumFactory.getNodePath('nodeKey', {
     *   parentField: 'parentId'
     * });
     * 
     * // 使用路径信息
     * if (pathInfo.node) {
     *   console.log(`当前节点: ${pathInfo.node.label}`);
     *   console.log(`层级: ${pathInfo.level}`);
     *   console.log(`祖先数量: ${pathInfo.ancestors.length}`);
     *   console.log(`后代数量: ${pathInfo.descendants.length}`);
     * }
     * 
     * @test
     * it('should return complete path info', () => {
     *   const pathInfo = enumFactory.getNodePath('middle', {
     *     parentField: 'parentId'
     *   });
     *   expect(pathInfo.ancestors).toHaveLength(1);
     *   expect(pathInfo.node?.key).toBe('middle');
     *   expect(pathInfo.descendants).toHaveLength(2);
     *   expect(pathInfo.level).toBe(1);
     * });
     */
    public getNodePath(key: string, options: TreeOptions<T>): {
        ancestors: TreeNode<T>[];
        node: TreeNode<T> | null;
        descendants: TreeNode<T>[];
        level: number;
    } {
        const searchResult = this.findInTree(node => node.key === key,
            {
                ...options,
                includeAncestors: true,
                includeDescendants: true,
                withTreeInfo: true,
                mode: 'dfs'
            }
        )[0];

        if (!searchResult) {
            return {
                ancestors: [],
                node: null,
                descendants: [],
                level: -1
            };
        }

        return {
            ancestors: searchResult.ancestors,
            node: searchResult.node,
            descendants: searchResult.descendants,
            level: searchResult.depth
        };
    }



    /**
     * 获取两个节点的最近公共祖先
     * @param key1 - 第一个节点的键
     * @param key2 - 第二个节点的键
     * @param options - 树形结构配置选项
     * @returns 最近公共祖先节点，如果不存在则返回 null
     * 
     * @example
     * // 查找两个节点的最近公共祖先
     * const lca = enumFactory.findLowestCommonAncestor(
     *   'node1',
     *   'node2',
     *   { parentField: 'parentId' }
     * );
     * 
     * if (lca) {
     *   console.log(`最近公共祖先: ${lca.label}`);
     * }
     * 
     * @test
     * it('should find lowest common ancestor', () => {
     *   const lca = enumFactory.findLowestCommonAncestor(
     *     'leaf1',
     *     'leaf2',
     *     { parentField: 'parentId' }
     *   );
     *   expect(lca?.key).toBe('parent');
     * });
     * 
     * it('should return null for nodes without common ancestor', () => {
     *   const lca = enumFactory.findLowestCommonAncestor(
     *     'root1',
     *     'root2',
     *     { parentField: 'parentId' }
     *   );
     *   expect(lca).toBeNull();
     * });
     */
    public findLowestCommonAncestor(key1: string, key2: string, options: TreeOptions<T>): TreeNode<T> | null {
        const path1 = this.getNodePath(key1, options);
        const path2 = this.getNodePath(key2, options);
        if (!path1.node || !path2.node) {
            return null;
        }
        const ancestors1 = new Set(path1.ancestors.map(a => a.key));
        // 从下往上查找第一个共同祖先
        for (let i = path2.ancestors.length - 1; i >= 0; i--) {
            if (ancestors1.has(path2.ancestors[i].key)) {
                return path2.ancestors[i];
            }
        }
        return null;
    }

    /**
      * 将枚举转换为数组
      * @param options 转换选项
      * @returns 转换后的数组
      * 
      * @example
      * ```typescript
      * // 基本使用
      * const array = enumFactory.toArray();
      * 
      * // 自定义字段
      * const array = enumFactory.toArray({
      *   fields: ['label', 'value']
      * });
      * 
      * // 自定义转换
      * const array = enumFactory.toArray({
      *   transform: item => ({
      *     text: item.label,
      *     id: item.value
      *   })
      * });
      * 
      * // 带过滤和排序
      * const array = enumFactory.toArray({
      *   filter: item => item.value > 0,
      *   sort: (a, b) => a.value - b.value
      * });
      * ```
      */
    public toArray<R = EnumItem<T>>(options: {
        /** 要包含的字段 */
        fields?: (keyof EnumItem<T>)[];
        /** 自定义转换函数 */
        transform?: (item: EnumItem<T>) => any;
        /** 过滤函数 */
        filter?: (item: EnumItem<T>) => boolean;
        /** 排序函数 */
        sort?: (a: EnumItem<T>, b: EnumItem<T>) => number;
        /** 是否包含空值 */
        includeEmpty?: boolean;
        /** 是否扁平化结果 */
        flatten?: boolean;
    } = {}): R[] {
        const {
            fields,
            transform,
            filter,
            sort,
            includeEmpty = false,
            flatten = false
        } = options;
        let items = this.disposedList;
        // 应用过滤
        if (filter) {
            items = items.filter(filter);
        }

        // 过滤空值
        if (!includeEmpty) {
            items = items.filter(item =>
                item.value !== undefined &&
                item.value !== null &&
                item.value !== ''
            );
        }

        // 应用排序
        if (sort) {
            items = items.sort(sort);
        }

        // 转换数据
        let result = items.map(item => {
            if (transform) {
                return transform(item);
            }

            if (fields) {
                return fields.reduce((acc, field) => {
                    acc[field] = item[field];
                    return acc;
                }, {} as any);
            }

            return item;
        });

        // 扁平化结果
        if (flatten) {
            result = result.flat(Infinity);
        }

        return result as R[];
    }

}