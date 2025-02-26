import { ArrayUtils } from "../common/index";

/**
 * 创建一个处理树结构的辅助函数。
 *
 * @param handle - 处理每个树节点的回调函数。
 * @returns 返回一个新的函数，用于遍历树结构并调用给定的迭代函数。
 */

export function helperCreateTreeFunc<T>(handle: (parent: T | null, obj: T[], iterate: (item: T, index: number, items: T[], path: string[], parent: T | null, nodes: T[]) => void, context: any, path: string[], node: T[], parseChildren: string, opts: { children?: string }) => void): (obj: T[], iterate: (item: T, index: number, items: T[], path: string[], parent: T | null, nodes: T[]) => void, options?: { children?: string }, context?: any) => void {
    return function (obj: T[], iterate: (item: T, index: number, items: T[], path: string[], parent: T | null, nodes: T[]) => void, options?: { children?: string }, context?: any): void {
        const opts = options || {};
        const optChildren = opts.children || 'children';
        handle(null, obj, iterate, context, [], [], optChildren, opts);
    };
}


/**
 * 遍历树结构中的每个项目。
 *
 * @param parent - 当前项的父项。
 * @param obj - 要遍历的对象或数组。
 * @param iterate - 回调函数。
 * @param context - 上下文对象。
 * @param path - 当前路径。
 * @param node - 当前节点路径。
 * @param parseChildren - 子节点属性名称。
 * @param opts - 选项对象。
 */

export function eachTreeItem<T>(
    parent: T | null,
    obj: T[],
    iterate: (item: T, index: number, items: T[], path: string[], parent: T | null, nodes: T[]) => void,
    context: any,
    path: string[],
    node: T[],
    parseChildren: string,
    opts: { children?: string; mapChildren?: string }
): void {
    // @ts-ignore
    ArrayUtils.eachArrayOrObject(obj, (item: T, index: number) => {
        const paths = path.concat(['' + index]);
        const nodesCopy = node.concat([item]);
        iterate.call(context, item, index, obj, paths, parent, nodesCopy);
        // @ts-ignore
        if (item && parseChildren in item) {
            eachTreeItem(item, item[parseChildren as keyof T] as unknown as T[], iterate, context, paths, nodesCopy, parseChildren, opts);
        }
    });
}




/**
 * 查找树结构中匹配的第一个数据项。
 *
 * @param parent - 当前项的父项。
 * @param obj - 要查找的对象或数组。
 * @param iterate - 回调函数，用于判断是否找到匹配项。接收六个参数：(元素, 索引, 数组/对象, 路径, 父节点, 节点列表)。
 * @param context - 上下文对象，用于调用回调函数。
 * @param path - 当前路径。
 * @param node - 当前节点路径。
 * @param parseChildren - 子节点属性名称。
 * @param opts - 选项对象。
 * @returns 匹配项的信息，包含索引、元素、路径等。
 */

export function findTreeItem<T>(
    parent: T | null,
    obj: T[],
    iterate: (item: T, index: number, items: T[], path: string[], parent: T | null, nodes: T[]) => boolean,
    context: any,
    path: string[],
    node: T[],
    parseChildren: string,
    opts: { children?: string }
): { index: number; item: T; path: string[]; items: T[]; parent: T | null; nodes: T[] } | undefined {
    if (obj) {
        for (let index = 0, len = obj.length; index < len; index++) {
            const item = obj[index];
            const paths = path.concat(['' + index]);
            const nodesCopy = node.concat([item]);

            if (iterate.call(context, item, index, obj, paths, parent, nodesCopy)) {
                return { index, item, path: paths, items: obj, parent, nodes: nodesCopy };
            }
            // @ts-ignore
            if (parseChildren && item[parseChildren]) {
                // @ts-ignore
                const match = findTreeItem(item, item[parseChildren] as unknown as T[], iterate, context, paths, nodesCopy, parseChildren, opts);
                if (match) {
                    return match;
                }
            }
        }
    }
    return undefined;
}

/**
 * 映射树结构中的每个项目。
 *
 * @param parent - 当前项的父项。
 * @param obj - 要映射的对象或数组。
 * @param iterate - 回调函数，用于处理每个元素并返回新的元素。接收六个参数：(元素, 索引, 数组/对象, 路径, 父节点, 节点列表)。
 * @param context - 上下文对象，用于调用回调函数。
 * @param path - 当前路径。
 * @param node - 当前节点路径。
 * @param parseChildren - 子节点属性名称。
 * @param opts - 选项对象。
 * @returns 映射后的新数组。
 */

export function mapTreeItem<T>(
    parent: T | null,
    obj: T[],
    iterate: (item: T, index: number, items: T[], path: string[], parent: T | null, nodes: T[]) => T,
    context: any,
    path: string[],
    node: T[],
    parseChildren: string,
    opts: { mapChildren?: string }
): T[] {
    const mapChildren = opts.mapChildren || parseChildren;
    return obj.map((item, index) => {
        const paths = path.concat(['' + index]);
        const nodesCopy = node.concat([item]);
        let rest = iterate.call(context, item, index, obj, paths, parent, nodesCopy);
        // @ts-ignore
        if (rest && item && parseChildren && item[parseChildren]) {
            // Ensure that the parsed children are treated as an array of type T[]
            // @ts-ignore
            const children = item[parseChildren] as unknown as T[];
            // @ts-ignore
            rest[mapChildren as keyof typeof rest] = mapTreeItem(item, children, iterate, context, paths, nodesCopy, parseChildren, opts) as unknown as T;
        }
        return rest;
    });
}






/**
 * 查找树结构中符合条件的所有项目。
 *
 * @param matchParent - 是否匹配父节点。
 * @param parent - 当前项的父项。
 * @param obj - 要查找的对象或数组。
 * @param iterate - 回调函数，用于判断是否找到匹配项。接收六个参数：(元素, 索引, 数组/对象, 路径, 父节点, 节点列表)。
 * @param context - 上下文对象，用于调用回调函数。
 * @param path - 当前路径。
 * @param node - 当前节点路径。
 * @param parseChildren - 子节点属性名称。
 * @param opts - 选项对象。
 * @returns 匹配项的数组。
 */


export function searchTreeItem<T>(
    matchParent: boolean,
    parent: T | null,
    obj: T[],
    iterate: (item: T, index: number, items: T[], path: string[], parent: T | null, nodes: T[]) => boolean,
    context: any,
    path: string[],
    node: T[],
    parseChildren: string,
    opts: { original?: boolean; data?: string; mapChildren?: string; isEvery?: boolean }
): T[] {
    const rests: T[] = [];
    const hasOriginal = opts.original || false;
    const sourceData = opts.data;
    const mapChildren = opts.mapChildren || parseChildren;
    const isEvery = opts.isEvery || false;

    obj.forEach((item, index) => {
        const paths = path.concat(['' + index]);
        const nodesCopy = node.concat([item]);
        let isMatch = (matchParent && !isEvery) || iterate.call(context, item, index, obj, paths, parent, nodesCopy);
        // @ts-ignore
        const hasChild = parseChildren && item[parseChildren];

        if (isMatch || hasChild) {
            let rest: T;
            if (hasOriginal) {
                rest = item;
            } else {
                rest = Object.assign({}, item);
                if (sourceData) {
                    // @ts-ignore

                    rest[sourceData] = item;
                }
            }
            // @ts-ignore
            const childrenResult = searchTreeItem(isMatch, item, item[parseChildren] as unknown as T[], iterate, context, paths, nodesCopy, parseChildren, opts);
            if (childrenResult.length > 0 || isMatch) {
                // @ts-ignore
                rest[mapChildren as keyof typeof rest] = childrenResult;
                rests.push(rest);
            }
        }
    });

    return rests;
}

