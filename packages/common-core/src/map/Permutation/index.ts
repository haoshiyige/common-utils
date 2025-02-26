/**
 * 表示数组中元素的重新排列（置换）。
 *
 * `Permutation` 类用于表示数组中元素的重新排列。它可以创建一个排序置换，应用置换以重新排列数组，
 * 以及生成一个逆置换来撤销之前的排列。
 */
export class Permutation {
  /**
   * 构造函数，创建一个新的 `Permutation` 实例。
   *
   * @param {readonly number[]} _indexMap - 一个只读数组，表示原数组中每个元素的新索引位置。
   *   `_indexMap[i]` 表示原数组中索引为 `i` 的元素在新排列中的索引。
   */
  constructor(private readonly _indexMap: readonly number[]) { }

  /**
   * 根据给定的比较函数创建一个排序置换。
   *
   * 该静态方法接收一个数组和一个比较函数，并返回一个 `Permutation` 实例，该实例表示按比较函数排序后的置换。
   *
   * @template T - 数组中元素的类型。
   * @param {readonly T[]} arr - 要排序的数组。
   * @param {(a: T, b: T) => number} compareFn - 用于比较两个元素的函数。
   *   该函数接受两个元素 `a` 和 `b`，并返回一个数字：
   *   - 如果 `a < b`，返回负数；
   *   - 如果 `a === b`，返回 0；
   *   - 如果 `a > b`，返回正数。
   * @returns {Permutation} - 一个 `Permutation` 实例，表示按比较函数排序后的置换。
   *
   * @example
   * // 示例：创建一个排序置换
   * const arr = [3, 1, 2];
   * const permutation = Permutation.createSortPermutation(arr, (a, b) => a - b);
   * console.log(permutation.apply(arr)); // 输出: [1, 2, 3]
   */
  public static createSortPermutation<T>(arr: readonly T[], compareFn: (a: T, b: T) => number): Permutation {
    const sortIndices = Array.from(arr.keys()).sort((index1, index2) => compareFn(arr[index1], arr[index2]));
    return new Permutation(sortIndices);
  }

  /**
   * 根据当前置换应用重新排列，返回一个新的数组。
   *
   * 该方法接收一个数组，并根据当前置换 `_indexMap` 对其进行重新排列，返回一个新的数组。
   *
   * @template T - 数组中元素的类型。
   * @param {readonly T[]} arr - 要重新排列的数组。
   * @returns {T[]} - 一个新的数组，其元素按照当前置换进行了重新排列。
   *
   * @example
   * // 示例：应用置换
   * const arr = [1, 2, 3];
   * const permutation = new Permutation([2, 0, 1]);
   * console.log(permutation.apply(arr)); // 输出: [3, 1, 2]
   *
   * @note
   * - 该方法不会修改原始数组，而是返回一个新的数组。
   * - 如果 `_indexMap` 中的索引超出 `arr` 的长度，可能会导致意外行为。
   */
  apply<T>(arr: readonly T[]): T[] {
    return arr.map((_, index) => arr[this._indexMap[index]])
  }

  /**
   * 返回一个新的置换，该置换可以撤销当前置换的效果。
   *
   * 该方法返回一个新的 `Permutation` 实例，该实例表示当前置换的逆置换。应用逆置换后，数组将恢复到原始顺序。
   *
   * @returns {Permutation} - 一个新的 `Permutation` 实例，表示当前置换的逆置换。
   *
   * @example
   * // 示例：获取逆置换
   * const arr = [1, 2, 3];
   * const permutation = new Permutation([2, 0, 1]);
   * const inversePermutation = permutation.inverse();
   * console.log(inversePermutation.apply(permutation.apply(arr))); // 输出: [1, 2, 3]
   *
   * @note
   * - 逆置换保证可以撤销当前置换的效果，即使 `_indexMap` 中存在重复或无效索引。
   */
  inverse(): Permutation {
    const inverseIndexMap = this._indexMap.slice()
    for (let i = 0; i < this._indexMap.length; i++) {
      inverseIndexMap[this._indexMap[i]] = i
    }
    return new Permutation(inverseIndexMap)
  }
}
