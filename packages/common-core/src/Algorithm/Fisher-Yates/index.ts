/**
 * 使用二分查找算法在有序数组中查找指定值。
 *
 * @param list - 有序数组。
 * @param val - 要查找的值。
 * @returns 找到的值的索引，如果没有找到则返回 -1。
 */
export function binarySearchIndexOf<T>(list: T[], val: T): number {
    if (list.length === 0 || val < list[0] || val > list[list.length - 1]) {
        return -1; // 目标值不在数组范围内，直接返回 -1
    }
    let left = 0;
    let right = list.length - 1;
    while (left <= right) {
        const mid = left + ((right - left) >> 1); // 防止溢出的写法：(left + right) / 2
        if (list[mid] === val) {
            return mid;
        } else if (list[mid] < val) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}