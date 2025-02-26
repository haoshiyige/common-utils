



interface TreeOptions {
    /**
     * 父节点标识字段名，默认为 'parentId'
     */
    parentKey?: string;

    /**
     * 节点唯一标识字段名，默认为 'id'
     */
    key?: string;

    /**
     * 子节点集合字段名，默认为 'children'
     */
    children?: string;

    /**
     * 数据字段名，如果需要从对象中提取特定数据，则设置此选项
     */
    data?: string;

    /**
     * 是否在转换后清除子节点字段，默认为 false
     */
    clear?: boolean;
}





/**
 * 将一个树结构数组转换为扁平化列表。
 *
 * @param array - 要转换的树结构数组。
 * @param options - 配置选项。
 * @returns 扁平化后的数组列表。
 * 
 * 配置选项:
 * - `parentKey`: 父节点标识字段名，默认为 'parentId'。
 * - `key`: 节点唯一标识字段名，默认为 'id'。
 * - `children`: 子节点集合字段名，默认为 'children'。
 * - `data`: 数据字段名，如果需要从对象中提取特定数据，则设置此选项。
 * - `clear`: 是否在转换后清除子节点字段，默认为 false。
 * 
 * 示例:
 * ```typescript
 * interface TreeNode {
 *   id: number;
 *   parentId?: number;
 *   children?: TreeNode[];
 *   name: string;
 * }
 * 
 * const treeData: TreeNode[] = [
 *   {
 *     id: 1,
 *     name: 'Node 1',
 *     children: [
 *       { id: 2, name: 'Child 1-1' },
 *       { id: 3, name: 'Child 1-2' }
 *     ]
 *   },
 *   {
 *     id: 4,
 *     name: 'Node 2'
 *   }
 * ];
 * 
 * const flatArray = toTreeArray(treeData, { clear: true });
 * console.log(flatArray);
 * // 输出:
 * // [
 * //   { id: 1, name: 'Node 1' },
 * //   { id: 2, name: 'Child 1-1' },
 * //   { id: 3, name: 'Child 1-2' },
 * //   { id: 4, name: 'Node 2' }
 * // ]
 * ```
 */


export function toTreeArray<T>(array: T[], options: TreeOptions = {}): T[] {
    const defaultOptions: TreeOptions = {
        parentKey: 'parentId',
        key: 'id',
        children: 'children',
        data: undefined,
        clear: false,
    };
    const opts: TreeOptions = { ...defaultOptions, ...options };
    const result: T[] = [];

    flattenTree(array);
    return result;
}



/**
 * 将一个树结构转成数组列表。
 *
 * @param array - 要转换的树结构数组。
 * @param options - 配置选项。
 * @returns 扁平化后的数组列表。
 * 
 * 配置选项:
 * - `parentKey`: 父节点标识字段名，默认为 'parentId'。
 * - `key`: 节点唯一标识字段名，默认为 'id'。
 * - `children`: 子节点集合字段名，默认为 'children'。
 * - `data`: 数据字段名，如果需要从对象中提取特定数据，则设置此选项。
 * - `clear`: 是否在转换后清除子节点字段，默认为 false。
 * 
 * 示例:
 * ```typescript
 * interface TreeNode {
 *   id: number;
 *   parentId?: number;
 *   children?: TreeNode[];
 *   name: string;
 * }
 * 
 * const treeData: TreeNode[] = [
 *   {
 *     id: 1,
 *     name: 'Node 1',
 *     children: [
 *       { id: 2, name: 'Child 1-1' },
 *       { id: 3, name: 'Child 1-2' }
 *     ]
 *   },
 *   {
 *     id: 4,
 *     name: 'Node 2'
 *   }
 * ];
 * 
 * const flatArray = toArrayTree(treeData, { clear: true });
 * console.log(flatArray);
 * // 输出:
 * // [
 * //   { id: 1, name: 'Node 1' },
 * //   { id: 2, name: 'Child 1-1' },
 * //   { id: 3, name: 'Child 1-2' },
 * //   { id: 4, name: 'Node 2' }
 * // ]
 * ```
 */
export function toArrayTree<T>(array: T[], options: TreeOptions = {}): T[] {
    const defaultOptions: TreeOptions = {
        parentKey: 'parentId',
        key: 'id',
        children: 'children',
        data: undefined,
        clear: false,
    };

    const opts = { ...defaultOptions, ...options };
    const result: T[] = [];

    function flattenTree(items: T[]): void {
        items.forEach((item) => {
            let newItem = item;
            // 如果指定了 data 字段，则取其值作为新的 item
            if (opts.data && (item as any)[opts.data]) {
                newItem = (item as any)[opts.data];
            }
            // 将当前项加入结果数组
            result.push(newItem);
            // 获取子节点
            // @ts-ignore
            const children = (item as any)[opts.children] as T[] | undefined;
            // 如果有子节点并且子节点不为空，则递归处理子节点
            if (children && children.length > 0) {
                flattenTree(children);
            }

            // 如果设置了 clear 并且存在子节点字段，则删除该字段
            if (opts.clear && children !== undefined) {
                // @ts-ignore
                delete (newItem as any)[opts.children];
            }
        });
    }

    flattenTree(array);
    return result;
}
