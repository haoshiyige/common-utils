/**
 * 枚举项的基本结构
 * @template T - 枚举值的类型，可以是字符串或数字
 */
export interface EnumItem<T extends string | number> {
    /** 枚举项的唯一键 */
    key: string;
    /** 枚举项的显示标签 */
    label: string;
    /** 枚举项的值（可选） */
    value?: T;
    /** 其他可能的属性 */
    [key: string]: any;
}

/**
 * 枚举工厂配置选项
 */
export interface EnumFactoryOptions {
    /** 用于提取标签的键或函数 */
    labelKeys?: ((item: any) => string) | string | string[];
    /** 用于提取值的键或函数 */
    valueKeys?: ((item: any) => any) | string | string[];
    /** 用于提取键的键或函数 */
    key?: ((item: any) => string) | string;
}

/**
 * 选择框选项配置
 */
export interface SelectOptions {
    /** 值字段名称 */
    valueField?: string;
    /** 标签字段名称 */
    labelField?: string;
    /** 额外需要包含的字段 */
    extraFields?: string[];
}

/**
 * 排序配置
 */
export interface SortOptions<T extends string | number> {
    /** 排序字段 */
    field: 'key' | 'label' | 'value' | ((a: EnumItem<T>, b: EnumItem<T>) => number);
    /** 排序方向 */
    direction?: 'asc' | 'desc';
}

/**
 * 验证结果
 */
export interface ValidationResult {
    /** 是否有效 */
    isValid: boolean;
    /** 错误信息 */
    errors: string[];
}

/**
 * 枚举项过滤条件
 */
export interface FilterOptions<T> {
    key?: string | RegExp;
    label?: string | RegExp;
    value?: T | ((value: T) => boolean);
    [key: string]: any;
}

/**
 * 枚举项转换选项
 */
export interface TransformOptions {
    /** 是否包含未定义的值 */
    includeUndefined?: boolean;
    /** 自定义转换函数 */
    transform?: (item: any) => any;
}

/**
 * 分页选项
 */
export interface PaginationOptions {
    pageNum: number;
    pageSize: number;
    /** 是否返回总数 */
    withTotal?: boolean;
}

/**
 * 分页结果
 */
export interface PaginationResult<T> {
    items: T[];
    total?: number;
    pageNum: number;
    pageSize: number;
    totalPages?: number;
}




/**
 * 导出选项
 */
export interface ExportOptions {
    /** 导出格式 */
    format?: 'json' | 'csv' | 'object';
    /** 是否美化输出 */
    pretty?: boolean;
    /** 要导出的字段 */
    fields?: string[];
    /** 自定义分隔符(CSV格式) */
    separator?: string;
}

/**
 * 比较选项
 */
export interface CompareOptions<T extends string | number> {
    /** 要比较的字段 */
    fields?: (keyof EnumItem<T>)[];
    /** 是否严格比较 */
    strict?: boolean;
}

/**
 * 搜索选项
 */
export interface SearchOptions {
    /** 搜索字段 */
    fields?: string[];
    /** 是否区分大小写 */
    caseSensitive?: boolean;
    /** 是否使用模糊匹配 */
    fuzzy?: boolean;
    /** 最大结果数 */
    limit?: number;
}

/**
 * 验证规则
 */
export interface ValidationRule<T extends string | number> {
    field: keyof EnumItem<T>;
    validator: (value: any) => boolean;
    message: string;
}






/**
 * 分组选项
 */
export interface GroupOptions<T extends string | number> {
    /** 分组字段或函数 */
    by: keyof EnumItem<T> | ((item: EnumItem<T>) => string);
    /** 排序方式 */
    sort?: 'asc' | 'desc';
    /** 是否保留空分组 */
    keepEmpty?: boolean;
}

/**
 * 缓存配置
 */
export interface CacheOptions {
    /** 缓存时间（毫秒） */
    ttl?: number;
    /** 是否自动刷新 */
    autoRefresh?: boolean;
}

/**
 * 差异项
 */
export interface DiffResult<T extends string | number> {
    added: EnumItem<T>[];
    removed: EnumItem<T>[];
    modified: Array<{
        key: string;
        before: EnumItem<T>;
        after: EnumItem<T>;
    }>;
}

/**
 * 统计信息
 */
export interface Statistics {
    total: number;
    byValue: Record<string, number>;
    byLabel: Record<string, number>;
    empty: number;
    distribution: Record<string, number>;
}







/**
 * 序列化选项
 */
export interface SerializeOptions {
    /** 序列化格式 */
    format?: 'json' | 'yaml' | 'xml';
    /** 是否压缩 */
    compress?: boolean;
    /** 是否包含元数据 */
    withMetadata?: boolean;
}

/**
 * 聚合选项
 */
export interface AggregateOptions<T extends string | number> {
    /** 分组字段 */
    groupBy: keyof EnumItem<T>;
    /** 聚合字段 */
    aggregate: keyof EnumItem<T>;
    /** 聚合函数 */
    fn: 'sum' | 'avg' | 'count' | 'min' | 'max' | ((values: any[]) => any);
}

/**
 * 历史记录项
 */
export interface HistoryRecord<T extends string | number> {
    timestamp: number;
    action: 'add' | 'update' | 'delete';
    key: string;
    before?: EnumItem<T>;
    after?: EnumItem<T>;
    metadata?: Record<string, any>;
}

/**
 * 观察者回调
 */
export type ObserverCallback<T extends string | number> = (
    action: 'add' | 'update' | 'delete',
    item: EnumItem<T>,
    metadata?: any
) => void;





// ... existing types ...

/**
 * 索引配置
 */
export interface IndexConfig {
    /** 索引字段 */
    fields: string[];
    /** 是否唯一索引 */
    unique?: boolean;
    /** 索引名称 */
    name?: string;
}

/**
 * 查询选项
 */
export interface QueryOptions<T extends string | number> {
    /** 查询条件 */
    where?: Partial<Record<keyof EnumItem<T>, any>>;
    /** 排序字段 */
    orderBy?: Array<[keyof EnumItem<T>, 'asc' | 'desc']>;
    /** 限制返回数量 */
    limit?: number;
    /** 跳过数量 */
    offset?: number;
    /** 选择字段 */
    select?: Array<keyof EnumItem<T>>;
}

/**
 * 数据迁移配置
 */
export interface MigrationConfig<T extends string | number> {
    /** 版本号 */
    version: number;
    /** 升级函数 */
    up: (items: EnumItem<T>[]) => Promise<EnumItem<T>[]>;
    /** 降级函数 */
    down: (items: EnumItem<T>[]) => Promise<EnumItem<T>[]>;
}

/**
 * 缓存策略
 */
export type CacheStrategy = 'memory' | 'localStorage' | 'sessionStorage';





/**
* 树形结构配置选项
*/
export interface TreeOptions<T extends string | number> {
    /** 父级字段名 */
    parentField: keyof EnumItem<T>;
    /** 子级字段名 */
    childrenField?: string;
    /** 根节点的父级值 */
    rootParentValue?: any;
    /** 自定义字段映射 */
    fieldMapping?: Record<string, string>;
    /** 节点转换函数 */
    transform?: (node: EnumItem<T>) => any;
    /** 排序函数 */
    sort?: (a: any, b: any) => number;
    /** 是否在子节点为空时保留children字段 */
    keepEmptyChildren?: boolean;
    /** 是否包含额外的树形结构信息 */
    withTreeInfo?: boolean;
}

/**
 * 树节点结构
 */
export interface TreeNode<T extends string | number> extends EnumItem<T> {
    children?: TreeNode<T>[];
    /** 树形结构相关信息 */
    treeInfo?: {
        level: number;
        path: string[];
        isLeaf: boolean;
        parentKey?: string;
        index: number;
        siblings: number;
    };
    [key: string]: any;
}





/**
 * 树节点查找选项
 */
export interface TreeSearchOptions<T extends string | number> extends TreeOptions<T> {
    /** 搜索模式 */
    mode?: 'dfs' | 'bfs';
    /** 是否返回所有匹配项 */
    findAll?: boolean;
    /** 搜索深度限制 */
    maxDepth?: number;
    /** 是否包含祖先节点 */
    includeAncestors?: boolean;
    /** 是否包含子节点 */
    includeDescendants?: boolean;
    /** 自定义结果转换 */
    resultTransform?: (node: TreeNode<T>, context: TreeSearchContext<T>) => any;
}

/**
 * 树节点搜索上下文
 */
export interface TreeSearchContext<T extends string | number> {
    /** 当前节点的路径 */
    path: TreeNode<T>[];
    /** 当前深度 */
    depth: number;
    /** 当前节点的所有祖先 */
    ancestors: TreeNode<T>[];
    /** 当前节点的所有子孙 */
    descendants: TreeNode<T>[];
    /** 匹配的总数 */
    matchCount: number;
}

/**
 * 树节点搜索结果
 */
export interface TreeSearchResult<T extends string | number> {
    treeInfo: any;
    /** 匹配的节点 */
    node: TreeNode<T>;
    /** 节点路径 */
    path: TreeNode<T>[];
    /** 祖先节点 */
    ancestors: TreeNode<T>[];
    /** 子孙节点 */
    descendants: TreeNode<T>[];
    /** 深度 */
    depth: number;
    /** 在结果中的索引 */
    index: number;
}
