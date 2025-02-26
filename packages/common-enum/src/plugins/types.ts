// 插件基础接口
export interface EnumStorePlugin {
    name: string;
    init?: (store: any) => void;
    onEnumChange?: (key: string, action: string, data?: any) => void;
    destroy?: () => void;
}