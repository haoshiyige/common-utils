import { checkNewCall } from "@nin/shared";
/**
 * 一个基于数组实现的队列（Queue），支持从头部和尾部进行元素的添加和移除操作。
 * 队列中的元素存储在一个只读数组中，通过维护两个索引（`firstIdx` 和 `lastIdx`）来跟踪队列的头和尾。
 *
 * @template T - 队列中元素的类型。
 */
@checkNewCall()
export class ArrayQueue<T> {
  /**
   * 指向队列头部的第一个有效元素的索引。
   *
   * @private
   */
  private firstIdx = 0
  /**
   * 指向队列尾部的最后一个有效元素的索引。
   * @private
   */
  private lastIdx: number

  /**
   * 构造函数，创建一个基于给定数组的队列。
   *
   * @param {readonly T[]} items - 用于初始化队列的只读数组。
   * @constructor
   * @example
   * const queue = new ArrayQueue([1, 2, 3, 4, 5]);
   */
  constructor(private readonly items: readonly T[]) {
    this.lastIdx = this.items.length - 1
  }

  /**
   * 获取队列中当前元素的数量。
   *
   * @returns {number} - 队列中的元素数量。
   * @example
   * const queue = new ArrayQueue([1, 2, 3, 4, 5]);
   * console.log(queue.length); // 5
   */
  get length(): number {
    return this.lastIdx - this.firstIdx + 1
  }

  /**
   * 从队列头部开始，持续移除满足谓词条件的元素，直到遇到不满足条件的元素为止。
   * 如果没有元素被移除，则返回 `null`。
   *
   * @param {(value: T) => boolean} predicate - 用于确定元素是否应被移除的谓词函数。
   *   谓词函数接受一个参数 `value`，表示当前元素，并返回一个布尔值，表示该元素是否应被移除。
   * @returns {T[] | null} - 一个包含所有被移除元素的数组，如果没有元素被移除则返回 `null`。
   * @example
   * const queue = new ArrayQueue([1, 2, 3, 4, 5]);
   * const result = queue.takeWhile(x => x < 3);
   * console.log(result); // [1, 2]
   * console.log(queue.toArray()); // [3, 4, 5]
   */
  takeWhile(predicate: (value: T) => boolean): T[] | null {
    let startIdx = this.firstIdx
    while (startIdx <= this.lastIdx && predicate(this.items[startIdx])) {
      startIdx++
    }
    const result =
      startIdx === this.firstIdx
        ? null
        : this.items.slice(this.firstIdx, startIdx)
    this.firstIdx = startIdx
    return result
  }

  /**
   * 从队列尾部开始，持续移除满足谓词条件的元素，直到遇到不满足条件的元素为止。
   * 如果没有元素被移除，则返回 `null`。
   * 返回的结果数组保持与底层数组相同的顺序。
   *
   * @param {(value: T) => boolean} predicate - 用于确定元素是否应被移除的谓词函数。
   *   谓词函数接受一个参数 `value`，表示当前元素，并返回一个布尔值，表示该元素是否应被移除。
   * @returns {T[] | null} - 一个包含所有被移除元素的数组，如果没有元素被移除则返回 `null`。
   * @example
   * const queue = new ArrayQueue([1, 2, 3, 4, 5]);
   * const result = queue.takeFromEndWhile(x => x > 3);
   * console.log(result); // [4, 5]
   * console.log(queue.toArray()); // [1, 2, 3]
   */
  takeFromEndWhile(predicate: (value: T) => boolean): T[] | null {
    let endIdx = this.lastIdx
    while (endIdx >= this.firstIdx && predicate(this.items[endIdx])) {
      endIdx--
    }
    const result =
      endIdx === this.lastIdx
        ? null
        : this.items.slice(endIdx + 1, this.lastIdx + 1)
    this.lastIdx = endIdx
    return result
  }

  /**
   * 查看队列头部的元素，但不移除它。
   * 如果队列为空，则返回 `undefined`。
   *
   * @returns {T | undefined} - 队列头部的元素，如果队列为空则返回 `undefined`。
   * @example
   * const queue = new ArrayQueue([1, 2, 3, 4, 5]);
   * console.log(queue.peek()); // 1
   */
  peek(): T | undefined {
    if (this.length === 0) {
      return undefined
    }
    return this.items[this.firstIdx]
  }

  /**
   * 查看队列尾部的元素，但不移除它。
   * 如果队列为空，则返回 `undefined`。
   *
   * @returns {T | undefined} - 队列尾部的元素，如果队列为空则返回 `undefined`。
   * @example
   * const queue = new ArrayQueue([1, 2, 3, 4, 5]);
   * console.log(queue.peekLast()); // 5
   */
  peekLast(): T | undefined {
    if (this.length === 0) {
      return undefined
    }
    return this.items[this.lastIdx]
  }

  /**
   * 从队列头部移除并返回一个元素。
   * 如果队列为空，则返回 `undefined`。
   *
   * @returns {T | undefined} - 队列头部的元素，如果队列为空则返回 `undefined`。
   * @example
   * const queue = new ArrayQueue([1, 2, 3, 4, 5]);
   * console.log(queue.dequeue()); // 1
   * console.log(queue.toArray()); // [2, 3, 4, 5]
   */
  dequeue(): T | undefined {
    if (this.length === 0) {
      return undefined
    }
    const result = this.items[this.firstIdx]
    this.firstIdx++
    return result
  }

  /**
   * 从队列尾部移除并返回一个元素。
   * 如果队列为空，则返回 `undefined`。
   *
   * @returns {T | undefined} - 队列尾部的元素，如果队列为空则返回 `undefined`。
   * @example
   * const queue = new ArrayQueue([1, 2, 3, 4, 5]);
   * console.log(queue.removeLast()); // 5
   * console.log(queue.toArray()); // [1, 2, 3, 4]
   */
  removeLast(): T | undefined {
    if (this.length === 0) {
      return undefined
    }
    const result = this.items[this.lastIdx]
    this.lastIdx--
    return result
  }

  /**
   * 从队列头部移除并返回指定数量的元素。
   *
   * @param {number} count - 要移除的元素数量。
   * @returns {T[]} - 一个包含被移除元素的数组。
   * @example
   * const queue = new ArrayQueue([1, 2, 3, 4, 5]);
   * const result = queue.takeCount(3);
   * console.log(result); // [1, 2, 3]
   * console.log(queue.toArray()); // [4, 5]
   */
  takeCount(count: number): T[] {
    const result = this.items.slice(this.firstIdx, this.firstIdx + count)
    this.firstIdx += count
    return result
  }

  /**
   * 将当前队列中的元素转换为一个新的数组。
   *
   * @returns {T[]} - 一个包含队列中所有元素的新数组。
   * @example
   * const queue = new ArrayQueue([1, 2, 3, 4, 5]);
   * console.log(queue.toArray()); // [1, 2, 3, 4, 5]
   */
  toArray(): T[] {
    return this.items.slice(this.firstIdx, this.lastIdx + 1)
  }
}
