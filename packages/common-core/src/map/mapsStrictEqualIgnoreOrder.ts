/**
 * @descriptionF 比较两个 `Map` 对象是否严格相等，忽略键值对的顺序。
 * 该函数首先检查两个 `Map` 是否为同一对象，如果是则直接返回 `true`。
 * 然后检查两个 `Map` 的大小是否相同，若不同则返回 `false`。
 * 接着遍历第一个 `Map`，检查第二个 `Map` 中是否存在相同的键且对应的值相等，若不满足则返回 `false`。
 * 最后遍历第二个 `Map`，检查第一个 `Map` 中是否存在所有的键，若不满足则返回 `false`。
 * 如果所有检查都通过，则返回 `true`。
 * @param a - 要比较的第一个 `Map` 对象。
 * @param b - 要比较的第二个 `Map` 对象。
 * @returns 如果两个 `Map` 对象严格相等（忽略键值对顺序），则返回 `true`，否则返回 `false`。
 * 
 * @example 测试案例
 * const map1 = new Map();
 * map1.set('key1', 'value1');
 * map1.set('key2', 'value2');
 * 
 * const map2 = new Map();
 * map2.set('key2', 'value2');
 * map2.set('key1', 'value1');
 * 
 * const result1 = mapsStrictEqualIgnoreOrder(map1, map2);
 * console.log(result1); // 输出: true
 * 
 * const map3 = new Map();
 * map3.set('key1', 'value1');
 * map3.set('key3', 'value3');
 * 
 * const result2 = mapsStrictEqualIgnoreOrder(map1, map3);
 * console.log(result2); // 输出: false
 */

export function mapsStrictEqualIgnoreOrder(a: Map<unknown, unknown>, b: Map<unknown, unknown>): boolean {
    if (a === b) return true;
    if (a.size !== b.size) return false;
    for (const [key, value] of a) {
        if (!b.has(key) || b.get(key) !== value) return false;
    }
    for (const [key] of b) {
        if (!a.has(key)) return false;
    }
    return true;
}
