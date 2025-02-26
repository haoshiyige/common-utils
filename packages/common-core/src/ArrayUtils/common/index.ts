import { CancellationError } from "../../utils/errors/index";
import { isArray, isFunction } from "@nin/shared";
import { AlgorithmUtils } from "../../map/index"
import { ObjectUtils } from "../../object";
import { randomInt } from "../../math/index"
import { helperCreateTreeFunc, eachTreeItem, findTreeItem, mapTreeItem, searchTreeItem } from "../helper/helperCreateTreeFunc"
type Comparator<T> = (a: T, b: T) => number;
interface ISplice<T> {
	readonly start: number;
	readonly deleteCount: number;
	readonly toInsert: readonly T[];
}
interface IMutableSplice<T> extends ISplice<T> {
	start: number;
	readonly toInsert: T[];
	deleteCount: number;
}
interface CancellationToken {
	/**
	 * A flag signalling is cancellation has been requested.
	 */
	readonly isCancellationRequested: boolean;
	/**
	 * An event which fires when cancellation is requested. This event
	 * only ever fires `once` as cancellation can only happen once. Listeners
	 * that are registered after cancellation will be called (next event loop run),
	 * but also only once.
	 *
	 * @event
	 */
	readonly onCancellationRequested: (listener: (e: any) => any, thisArgs?: any, disposables?: []) => [];
}



/**
 * @description ArrayUtils 是一个工具类，提供了用于在数组中查找元素的各种静态和实例方法。
 * 它包括查找最后一个满足条件的元素、第一个满足条件的元素、使用二分查找查找单调性条件下的元素，
 * 以及查找最大值、最小值及其索引等功能。
 * @template T - 数组中元素的类型。
 */
export class ArrayUtils<T> {
	/**
	 * @description 启用/禁用对谓词顺序的检查。默认情况下是禁用的，因为这种检查可能会带来性能开销。
	 * 仅在调试或需要确保谓词顺序正确的情况下启用。
	 */
	public static assertInvariants = false;
	/**
	 * @description 静态方法：查找最后一个满足条件的元素。
	 * 查找并返回数组中最后一个满足给定谓词的元素。
	 *
	 * @param {readonly T[]} array - 要搜索的只读数组。
	 * @param {(item: T) => boolean} predicate - 用于确定元素是否符合条件的函数。
	 * @returns {T | undefined} - 满足条件的最后一个元素，如果不存在则返回 undefined。
	 */
	public static findLast<T>(array: readonly T[], predicate: (item: T) => boolean): T | undefined {
		const idx = this.findLastIdx(array, predicate);
		return idx === -1 ? undefined : array[idx];
	}

	/**
	 * @description 静态方法：查找最后一个满足条件的元素索引。
	 *  查找并返回数组中最后一个满足给定谓词的元素的索引。
	 *
	 * @param {readonly T[]} array - 要搜索的只读数组。
	 * @param {(item: T) => boolean} predicate - 用于确定元素是否符合条件的函数。
	 * @param {number} [fromIndex=array.length - 1] - 开始查找的位置，默认为数组末尾。
	 * @returns {number} - 满足条件的最后一个元素的索引，如果不存在则返回 -1。
	 */

	public static findLastIdx<T>(array: readonly T[], predicate: (item: T) => boolean, fromIndex = array.length - 1): number {
		for (let i = fromIndex; i >= 0; i--) {
			if (predicate(array[i])) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * @description 静态方法：使用二分查找查找最后一个满足单调性条件的元素
	 * 使用二分查找算法查找并返回数组中最后一个满足单调性条件的元素。
	 * 谓词必须是单调的，即 `arr.map(predicate)` 必须是 `[true, ..., true, false, ..., false]` 的形式。
	 *
	 * @param {readonly T[]} array - 要搜索的只读数组。
	 * @param {(item: T) => boolean} predicate - 用于确定元素是否符合条件的函数。
	 * @returns {T | undefined} - 满足条件的最后一个元素，如果不存在则返回 undefined。
	 */
	public static findLastMonotonous<T>(array: readonly T[], predicate: (item: T) => boolean): T | undefined {
		const idx = this.findLastIdxMonotonous(array, predicate);
		return idx === -1 ? undefined : array[idx];
	}

	/**
	 * @description  静态方法：使用二分查找查找最后一个满足单调性条件的元素索引
	 * 
	 * 
	 * 
	 * */
	private static findLastIdxMonotonous<T>(array: readonly T[], predicate: (item: T) => boolean, startIdx = 0, endIdxEx = array.length): number {
		let i = startIdx;
		let j = endIdxEx;
		while (i < j) {
			const k = Math.floor((i + j) / 2);
			if (predicate(array[k])) {
				i = k + 1;
			} else {
				j = k;
			}
		}
		return i - 1;
	}


	/**
	 * @description  静态方法：使用二分查找查找第一个满足单调性条件的元素。
	 * 使用二分查找算法查找并返回数组中第一个满足单调性条件的元素。
	 * 谓词必须是单调的，即 `arr.map(predicate)` 必须是 `[false, ..., false, true, ..., true]` 的形式。
	 *
	 * @param {readonly T[]} array - 要搜索的只读数组。
	 * @param {(item: T) => boolean} predicate - 用于确定元素是否符合条件的函数。
	 * @returns {T | undefined} - 满足条件的第一个元素，如果不存在则返回 undefined。
	 */
	public static findFirstMonotonous<T>(array: readonly T[], predicate: (item: T) => boolean): T | undefined {
		const idx = this.findFirstIdxMonotonousOrArrLen(array, predicate);
		return idx === array.length ? undefined : array[idx];
	}

	/**
	 * @description 静态方法：使用二分查找查找第一个满足单调性条件的元素索引
	 * 
	 * */
	private static findFirstIdxMonotonousOrArrLen<T>(array: readonly T[], predicate: (item: T) => boolean, startIdx = 0, endIdxEx = array.length): number {
		let i = startIdx;
		let j = endIdxEx;
		while (i < j) {
			const k = Math.floor((i + j) / 2);
			if (predicate(array[k])) {
				j = k;
			} else {
				i = k + 1;
			}
		}
		return i;
	}

	/**
	 * @description 静态方法：使用二分查找查找第一个满足单调性条件的元素索引（返回 -1 如果没有找到）。
	 * 使用二分查找算法查找并返回数组中第一个满足单调性条件的元素索引。
	 * 如果没有找到满足条件的元素，则返回 -1。
	 *
	 * @param {readonly T[]} array - 要搜索的只读数组。
	 * @param {(item: T) => boolean} predicate - 用于确定元素是否符合条件的函数。
	 * @param {number} [startIdx=0] - 开始查找的位置，默认为数组开头。
	 * @param {number} [endIdxEx=array.length] - 结束查找的位置（不包含），默认为数组末尾。
	 * @returns {number} - 满足条件的第一个元素的索引，如果不存在则返回 -1。
	 */
	public static findFirstIdxMonotonous<T>(array: readonly T[], predicate: (item: T) => boolean, startIdx = 0, endIdxEx = array.length): number {
		const idx = this.findFirstIdxMonotonousOrArrLen(array, predicate, startIdx, endIdxEx);
		return idx === array.length ? -1 : idx;
	}

	/**
	 * @description  静态方法：查找最大值。  查找并返回数组中的最大值。
	 *
	 * @param {readonly T[]} array - 要搜索的只读数组。
	 * @param {Comparator<T>} comparator - 用于比较两个元素的比较函数。
	 * @returns {T | undefined} - 数组中的最大值，如果数组为空则返回 undefined。
	 */
	public static findFirstMax<T>(array: readonly T[], comparator: Comparator<T>): T | undefined {
		if (array.length === 0) return undefined;
		let max = array[0];
		for (let i = 1; i < array.length; i++) {
			const item = array[i];
			if (comparator(item, max) > 0) {
				max = item;
			}
		}
		return max;
	}

	/**
	 * @description 静态方法：查找最后一个最大值 。 查找并返回数组中最后一个最大值。
	 *
	 * @param {readonly T[]} array - 要搜索的只读数组。
	 * @param {Comparator<T>} comparator - 用于比较两个元素的比较函数。
	 * @returns {T | undefined} - 数组中最后一个最大值，如果数组为空则返回 undefined。
	 */
	public static findLastMax<T>(array: readonly T[], comparator: Comparator<T>): T | undefined {
		if (array.length === 0) {
			return undefined;
		}

		let max = array[0];
		for (let i = 1; i < array.length; i++) {
			const item = array[i];
			if (comparator(item, max) >= 0) {
				max = item;
			}
		}
		return max;
	}

	/**
	 * @description  静态方法：查找最小值 。 查找并返回数组中的最小值。
	 *
	 * @param {readonly T[]} array - 要搜索的只读数组。
	 * @param {Comparator<T>} comparator - 用于比较两个元素的比较函数。
	 * @returns {T | undefined} - 数组中的最小值，如果数组为空则返回 undefined。
	 */
	public static findFirstMin<T>(array: readonly T[], comparator: Comparator<T>): T | undefined {
		return this.findFirstMax(array, (a, b) => -comparator(a, b));
	}

	/**
	 * @description  静态方法：查找最大值的索引。
	 *   查找并返回数组中最大值的索引。
	 *
	 * @param {readonly T[]} array - 要搜索的只读数组。
	 * @param {Comparator<T>} comparator - 用于比较两个元素的比较函数。
	 * @returns {number} - 数组中最大值的索引，如果数组为空则返回 -1。
	 */
	public static findMaxIdx<T>(array: readonly T[], comparator: Comparator<T>): number {
		if (array.length === 0) {
			return -1;
		}

		let maxIdx = 0;
		for (let i = 1; i < array.length; i++) {
			const item = array[i];
			if (comparator(item, array[maxIdx]) > 0) {
				maxIdx = i;
			}
		}
		return maxIdx;
	}


	/**
	 *@description 静态方法：映射并查找第一个非 undefined 的结果。
	 * 映射数组中的每个元素，并返回第一个非 undefined 的结果。
	 *
	 * @param {Iterable<T>} items - 要映射的可迭代对象。
	 * @param {(value: T) => R | undefined} mapFn - 用于映射元素的函数。
	 * @returns {R | undefined} - 第一个非 undefined 的映射结果，如果不存在则返回 undefined。
	 */
	public static mapFindFirst<T, R>(items: Iterable<T>, mapFn: (value: T) => R | undefined): R | undefined {
		for (const value of items) {
			const mapped = mapFn(value);
			if (mapped !== undefined) {
				return mapped;
			}
		}
		return undefined;
	}

	/**
   * @description 根据提供的比较函数对数组中的元素进行分组。
   *
   * 该函数接收一个只读数组和一个比较函数，首先根据比较函数对数组进行排序，
   * 然后将相邻且比较结果为0的元素归为同一组，最终返回一个包含多个子数组的结果数组。
   *
   * @template T - 数组中元素的类型。
   * @param {ReadonlyArray<T>} data - 要分组的只读数组。
   * @param {(a: T, b: T) => number} compare - 用于比较两个元素的比较函数。
   *   比较函数应遵循以下规则：
   *   - 如果 a < b，返回负数；
   *   - 如果 a === b，返回 0；
   *   - 如果 a > b，返回正数。
   * @returns {T[][]} - 一个包含多个子数组的结果数组，每个子数组内的元素被认为是“相等”的。
   *
   * @example
   * // 示例：按数值大小分组
   * const numbers = [1, 3, 2, 3, 4, 2, 5, 3];
   * const groupedNumbers = groupBy(numbers, (a, b) => a - b);
   * console.log(groupedNumbers); // [[1], [2, 2], [3, 3, 3], [4], [5]]
   *
   * @example
   * // 示例：按字符串长度分组
   * const words = ["apple", "pear", "orange", "grape", "kiwi"];
   * const groupedWords = groupBy(words, (a, b) => a.length - b.length);
   * console.log(groupedWords); // [["kiwi"], ["pear", "grape"], ["apple", "orange"]]
   */
	public static groupBy<T>(data: ReadonlyArray<T>, compare: (a: T, b: T) => number): T[][] {
		const result: T[][] = [];
		let currentGroup: T[] | undefined = undefined;
		// 对数据进行排序，并在排序后的数组上进行分组
		for (const element of data.slice(0).sort(compare)) {
			if (!currentGroup || compare(currentGroup[0], element) !== 0) {
				// 如果当前组为空或当前元素与组内第一个元素不相等，则创建新组
				currentGroup = [element];
				result.push(currentGroup);
			} else {
				// 否则，将当前元素添加到现有组中
				currentGroup.push(element);
			}
		}
		return result;
	}

	/**
	 * 异步版本的 `Array.find()`，返回数组中第一个满足给定谓词条件的元素。
	 *
	 * 与标准的 `Array.find()` 不同，`findAsync` 不会提前终止（即不会在找到第一个满足条件的元素后立即返回），
	 * 而是等待所有异步谓词调用完成后再返回结果。这确保了所有谓词都得到了执行，即使某些谓词可能需要较长时间才能完成。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {readonly T[]} array - 要搜索的只读数组。
	 * @param {(element: T, index: number) => Promise<boolean>} predicate - 用于确定元素是否符合条件的异步谓词函数。
	 *   谓词函数接受两个参数：
	 *   - `element`：当前元素。
	 *   - `index`：当前元素的索引。
	 *   谓词函数应返回一个布尔值的 `Promise`，表示该元素是否满足条件。
	 * @returns {Promise<T | undefined>} - 一个 `Promise`，解析为数组中第一个满足条件的元素，如果没有任何元素满足条件，则解析为 `undefined`。
	 *
	 * @example
	 * // 示例：查找第一个大于10的元素
	 * const numbers = [5, 12, 8, 16, 7];
	 * const result = await findAsync(numbers, async (num, index) => {
	 *   console.log(`Checking element ${num} at index ${index}`);
	 *   return num > 10;
	 * });
	 * console.log(result); // 12
	 *
	 * @example
	 * // 示例：模拟异步操作
	 * const items = ['apple', 'banana', 'cherry'];
	 * const result = await findAsync(items, async (item, index) => {
	 *   await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟异步操作
	 *   return item.startsWith('b');
	 * });
	 * console.log(result); // 'banana'
	 */
	static async findAsync<T>(array: readonly T[], predicate: (element: T, index: number) => Promise<boolean>): Promise<T | undefined> {
		const results = await Promise.all(
			array.map(async (element, index) => ({ element, ok: await predicate(element, index) }))
		);
		return results.find(r => r.ok)?.element;
	}

	/**
	 * 从给定的数组中随机选择并返回一个元素。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {T[]} arr - 要从中选择随机元素的数组。
	 * @returns {T | undefined} - 返回数组中的一个随机元素；如果数组为空，则返回 `undefined`。
	 *
	 * @example
	 * // 示例：从数字数组中随机选择一个元素
	 * const numbers = [1, 2, 3, 4, 5];
	 * const randomNumber = getRandomElement(numbers);
	 * console.log(randomNumber); // 输出可能是 1, 2, 3, 4, 或 5 中的一个
	 *
	 * @example
	 * // 示例：从空数组中随机选择一个元素
	 * const emptyArray: number[] = [];
	 * const result = getRandomElement(emptyArray);
	 * console.log(result); // undefined
	 */
	static getRandomElement<T>(arr: T[]): T | undefined {
		if (arr.length === 0) return undefined;
		const randomIndex = Math.floor(Math.random() * arr.length);
		return arr[randomIndex];
	}

	/**
	  * 生成一个从 `from` 到 `to`（不包括 `to`）的数字数组。
	  *
	  * 该方法支持两种调用方式：
	  * 1. 只传入一个参数 `arg`，此时 `arg` 表示结束值（不包括），起始值默认为 0。
	  * 2. 传入两个参数 `arg` 和 `to`，此时 `arg` 表示起始值，`to` 表示结束值（不包括）。
	  *
	  * 如果 `from` 小于等于 `to`，则生成递增的数组；如果 `from` 大于 `to`，则生成递减的数组。
	  *
	  * @param {number} arg - 起始值或结束值，取决于是否传入第二个参数 `to`。
	  * @param {number} [to] - 结束值（不包括），可选参数。如果不传入，则 `arg` 被视为结束值，起始值默认为 0。
	  * @returns {number[]} - 一个包含从 `from` 到 `to`（不包括 `to`）的数字数组。
	  *
	  * @example
	  * // 示例：只传入一个参数，表示结束值
	  * console.log(range(5)); // [0, 1, 2, 3, 4]
	  *
	  * @example
	  * // 示例：传入两个参数，表示起始值和结束值
	  * console.log(range(1, 5)); // [1, 2, 3, 4]
	  *
	  * @example
	  * // 示例：生成递减的数组
	  * console.log(range(5, 1)); // [5, 4, 3, 2]
	  */
	static range(to: number): number[];
	static range(from: number, to: number): number[];
	static range(arg: number, to?: number): number[] {
		let from: number;
		let toValue: number;
		if (typeof to === 'number') {
			// 如果传入了 `to` 参数，`arg` 是起始值，`to` 是结束值
			from = arg;
			toValue = to;
		} else {
			// 如果没有传入 `to` 参数，`arg` 是结束值，起始值默认为 0
			from = 0;
			toValue = arg;
		}
		const result: number[] = [];
		if (from <= toValue) {
			// 生成递增的数组
			for (let i = from; i < toValue; i++) {
				result.push(i);
			}
		} else {
			// 生成递减的数组
			for (let i = from; i > toValue; i--) {
				result.push(i);
			}
		}
		return result;
	}



	/**
	 * 计算两个只读数组的公共前缀长度。
	 *
	 * 该函数遍历两个数组，逐个比较它们的元素，直到遇到不相等的元素或到达其中一个数组的末尾为止。
	 * 它返回两个数组中相同元素的数量，即公共前缀的长度。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {ReadonlyArray<T>} one - 第一个只读数组。
	 * @param {ReadonlyArray<T>} other - 第二个只读数组。
	 * @param {(a: T, b: T) => boolean} [equals] - 可选的比较函数，用于确定两个元素是否相等。
	 *   如果未提供，默认使用严格相等 (`===`) 进行比较。
	 * @returns {number} - 两个数组的公共前缀长度。
	 *
	 * @example
	 * // 示例：计算两个字符串数组的公共前缀长度
	 * const array1 = ["apple", "banana", "cherry"];
	 * const array2 = ["apple", "banana", "date"];
	 * console.log(commonPrefixLength(array1, array2)); // 2
	 *
	 * @example
	 * // 示例：使用自定义比较函数计算两个数字数组的公共前缀长度
	 * const numbers1 = [1, 2, 3, 4];
	 * const numbers2 = [1, 2, 5, 6];
	 * console.log(commonPrefixLength(numbers1, numbers2, (a, b) => Math.abs(a - b) < 0.001)); // 2
	 */
	static commonPrefixLength<T>(one: ReadonlyArray<T>, other: ReadonlyArray<T>, equals: (a: T, b: T) => boolean = (a, b) => a === b): number {
		let result = 0;
		const len = Math.min(one.length, other.length);
		for (let i = 0; i < len && equals(one[i], other[i]); i++) {
			result++;
		}
		return result;
	}

	/**
	  * 创建一个过滤器函数，用于从数组中移除重复项。
	  *
	  * 该函数接收一个键生成函数 `keyFn`，该函数为每个元素生成一个唯一的键（可以是任何类型）。
	  * 返回的过滤器函数会在遍历数组时，根据生成的键来判断元素是否已经出现过。
	  * 如果元素的键已经出现过，则返回 `false` 表示该元素应被移除；否则返回 `true` 并记录该键。
	  *
	  * @template T - 数组中元素的类型。
	  * @template R - 键的类型，由 `keyFn` 生成。
	  * @param {(t: T) => R} keyFn - 用于为每个元素生成唯一键的函数。
	  *   该函数接受一个元素 `t`，并返回一个键 `R`。
	  * @returns {(t: T) => boolean} - 一个过滤器函数，用于判断元素是否应保留在数组中。
	  *   如果元素的键尚未出现过，则返回 `true`；否则返回 `false`。
	  *
	  * @example
	  * // 示例：移除数组中的重复字符串
	  * const uniqueStrings = ['apple', 'banana', 'apple', 'cherry', 'banana'].filter(uniqueFilter(x => x));
	  * console.log(uniqueStrings); // ['apple', 'banana', 'cherry']
	  *
	  * @example
	  * // 示例：移除对象数组中的重复项，基于对象的某个属性
	  * const people = [
	  *   { id: 1, name: 'Alice' },
	  *   { id: 2, name: 'Bob' },
	  *   { id: 1, name: 'Alice' },
	  *   { id: 3, name: 'Charlie' }
	  * ];
	  * const uniquePeople = people.filter(uniqueFilter(person => person.id));
	  * console.log(uniquePeople); // [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Charlie' }]
	  */
	static uniqueFilter<T, R>(keyFn: (t: T) => R): (t: T) => boolean {
		const seen = new Set<R>();
		return element => {
			const key = keyFn(element);
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		};
	}


	/**
	 * 从给定的数组中移除重复项，返回一个包含唯一元素的新数组。
	 *
	 * 该函数接收一个可选的键生成函数 `keyFn`，用于为每个元素生成一个唯一的键（可以是任何类型）。
	 * 如果未提供 `keyFn`，则直接使用元素本身作为键进行比较。
	 * 返回的新数组中的元素顺序与原数组相同，但不包含重复项。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {ReadonlyArray<T>} array - 要从中移除重复项的只读数组。
	 * @param {(value: T) => unknown} [keyFn] - 可选的键生成函数，用于为每个元素生成唯一的键。
	 *   该函数接受一个元素 `value`，并返回一个键（可以是任何类型）。如果未提供，默认使用元素本身作为键。
	 * @returns {T[]} - 一个包含唯一元素的新数组，顺序与原数组相同。
	 *
	 * @example
	 * // 示例：移除数组中的重复数字
	 * const numbers = [1, 2, 2, 3, 4, 4, 5];
	 * console.log(distinct(numbers)); // [1, 2, 3, 4, 5]
	 *
	 * @example
	 * // 示例：移除对象数组中的重复项，基于对象的某个属性
	 * const people = [
	 *   { id: 1, name: 'Alice' },
	 *   { id: 2, name: 'Bob' },
	 *   { id: 1, name: 'Alice' },
	 *   { id: 3, name: 'Charlie' }
	 * ];
	 * console.log(distinct(people, person => person.id));
	 * // [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Charlie' }]
	 */
	static distinct<T>(array: ReadonlyArray<T>, keyFn: (value: T) => unknown = value => value): T[] {
		const seen = new Set<unknown>();
		return array.filter(element => {
			const key = keyFn(element);
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
	}


	/**
	 * 检查给定的对象是否为非空数组。
	 *
	 * 该函数接收一个可能为数组、只读数组、`undefined` 或 `null` 的对象，并返回一个布尔值。
	 * 如果对象是一个数组或只读数组，并且包含至少一个元素，则返回 `true`；否则返回 `false`。
	 * 该函数还提供了类型断言，确保在返回 `true` 时，编译器知道传入的对象是一个非空数组。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {T[] | readonly T[] | undefined | null} obj - 要检查的对象。
	 *   该对象可以是数组、只读数组、`undefined` 或 `null`。
	 * @returns {obj is T[] | readonly T[]} - 如果对象是一个非空数组或只读数组，则返回 `true`；
	 *   否则返回 `false`。同时提供类型断言，确保在返回 `true` 时，编译器知道传入的对象是一个非空数组。
	 *
	 * @example
	 * // 示例：检查普通数组
	 * const arr = [1, 2, 3];
	 * if (isNonEmptyArray(arr)) {
	 *   console.log("The array is non-empty:", arr[0]); // 输出: The array is non-empty: 1
	 * }
	 *
	 * @example
	 * // 示例：检查空数组
	 * const emptyArr: number[] = [];
	 * if (isNonEmptyArray(emptyArr)) {
	 *   console.log("This will not be printed");
	 * } else {
	 *   console.log("The array is empty"); // 输出: The array is empty
	 * }
	 *
	 * @example
	 * // 示例：检查 `undefined`
	 * const maybeArr: number[] | undefined = undefined;
	 * if (isNonEmptyArray(maybeArr)) {
	 *   console.log("This will not be printed");
	 * } else {
	 *   console.log("The value is undefined or an empty array"); // 输出: The value is undefined or an empty array
	 * }
	 *
	 * @example
	 * // 示例：检查 `null`
	 * const nullArr: number[] | null = null;
	 * if (isNonEmptyArray(nullArr)) {
	 *   console.log("This will not be printed");
	 * } else {
	 *   console.log("The value is null or an empty array"); // 输出: The value is null or an empty array
	 * }
	 */
	static isNonEmptyArray<T>(obj: T[] | undefined | null): obj is T[];
	static isNonEmptyArray<T>(obj: readonly T[] | undefined | null): obj is readonly T[];
	static isNonEmptyArray<T>(obj: T[] | readonly T[] | undefined | null): obj is T[] | readonly T[] {
		return Array.isArray(obj) && obj.length > 0;
	}


	/**
	 * 检查给定的对象是否为 falsy 或者是一个空数组。
	 *
	 * 该函数接收一个任意类型的对象，并返回一个布尔值：
	 * - 如果对象是 falsy（例如 `null`、`undefined`、`false`、`0`、空字符串 `""` 等），则返回 `true`。
	 * - 如果对象是一个数组且为空（即长度为 0），则返回 `true`。
	 * - 如果对象是一个非空数组，则返回 `false`。
	 * - 对于其他类型的对象（非数组且非 falsy），也返回 `false`。
	 *
	 * @param {any} obj - 要检查的对象。
	 * @returns {boolean} - 如果对象是 falsy 或者是一个空数组，则返回 `true`；否则返回 `false`。
	 *
	 * @example
	 * // 示例：检查 falsy 值
	 * console.log(isFalsyOrEmpty(null));      // true
	 * console.log(isFalsyOrEmpty(undefined)); // true
	 * console.log(isFalsyOrEmpty(false));     // true
	 * console.log(isFalsyOrEmpty(0));         // true
	 * console.log(isFalsyOrEmpty(""));        // true
	 *
	 * @example
	 * // 示例：检查空数组
	 * console.log(isFalsyOrEmpty([]));        // true
	 *
	 * @example
	 * // 示例：检查非空数组
	 * console.log(isFalsyOrEmpty([1, 2, 3])); // false
	 *
	 * @example
	 * // 示例：检查其他类型的对象
	 * console.log(isFalsyOrEmpty({}));        // false
	 * console.log(isFalsyOrEmpty("hello"));   // false
	 */
	static isFalsyOrEmpty(obj: any): boolean {
		return !Array.isArray(obj) || obj.length === 0;
	}


	/**
	 * 返回数组中按指定排序规则排列的前 N 个元素。
	 *
	 * 该函数通过部分排序的方式，从给定的未排序数组中提取前 N 个最大的或最小的元素。
	 * 当数组远大于 N 时，此方法比对整个数组进行排序更高效，因为它只需要维护一个大小为 N 的结果数组。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {ReadonlyArray<T>} array - 未排序的只读数组。
	 * @param {(a: T, b: T) => number} compare - 用于比较两个元素的排序函数。
	 *   该函数接受两个元素 `a` 和 `b`，并返回一个数字：如果 `a < b` 返回负数，`a === b` 返回 0，`a > b` 返回正数。
	 * @param {number} n - 要返回的元素数量。
	 * @returns {T[]} - 按 `compare` 函数排序后的前 N 个元素的数组。
	 *
	 * @example
	 * // 示例：获取数组中前 3 个最大的元素
	 * const array = [1, 5, 2, 8, 3, 7, 4, 6];
	 * console.log(top(array, (a, b) => b - a, 3)); // [8, 7, 6]
	 *
	 * @example
	 * // 示例：获取数组中前 2 个最小的元素
	 * const array = [1, 5, 2, 8, 3, 7, 4, 6];
	 * console.log(top(array, (a, b) => a - b, 2)); // [1, 2]
	 *
	 * @complexity
	 * - 时间复杂度：O(n log k)，其中 n 是数组长度，k 是要返回的元素数量（N）。该函数首先对前 N 个元素进行排序（O(N log N)），然后遍历剩余元素（O((n-N) log N)）。
	 * - 空间复杂度：O(k)，因为只需要维护一个大小为 N 的结果数组。
	 *
	 * @note
	 * - 如果 `n` 大于数组长度，则返回整个数组按 `compare` 函数排序后的结果。
	 * - 如果 `n` 为 0，函数立即返回一个空数组。
	 */
	static top<T>(array: ReadonlyArray<T>, compare: (a: T, b: T) => number, n: number): T[] {
		if (n === 0) return [];
		const result = array.slice(0, n).sort(compare);
		ArrayUtils.topStep(array, compare, result, n, array.length);
		return result;
	}

	/**
	 * 异步版本的 `top()` 函数，允许在处理大数组时分批次工作，并在批次之间让出事件循环。
	 *
	 * 该函数返回数组中按指定排序规则排列的前 N 个元素。
	 * 当数组远大于 N 时，此方法比对整个数组进行排序更高效。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {T[]} array - 未排序的数组。
	 * @param {(a: T, b: T) => number} compare - 用于比较两个元素的排序函数。
	 *   该函数接受两个元素 `a` 和 `b`，并返回一个数字：如果 `a < b` 返回负数，`a === b` 返回 0，`a > b` 返回正数。
	 * @param {number} n - 要返回的元素数量。
	 * @param {number} batch - 每次处理的元素批次大小。在每次处理完一个批次后，函数会短暂让出事件循环，以避免阻塞 I/O 操作。
	 * @param {CancellationToken} [token] - 可选的取消令牌，用于在操作过程中请求取消。如果取消令牌被触发，函数将抛出 `CancellationError`。
	 * @returns {Promise<T[]>} - 一个 Promise，解析为按 `compare` 函数排序后的前 N 个元素的数组。
	 *
	 * @example
	 * // 示例：获取数组中前 3 个最大的元素
	 * const array = [1, 5, 2, 8, 3, 7, 4, 6];
	 * topAsync(array, (a, b) => b - a, 3, 2).then(result => {
	 *   console.log(result); // [8, 7, 6]
	 * });
	 *
	 * @example
	 * // 示例：带取消令牌的异步操作
	 * const tokenSource = new CancellationTokenSource();
	 * const array = [1, 5, 2, 8, 3, 7, 4, 6];
	 * topAsync(array, (a, b) => b - a, 3, 2, tokenSource.token).then(result => {
	 *   console.log(result);
	 * }).catch(error => {
	 *   if (error instanceof CancellationError) {
	 *     console.log("Operation was cancelled");
	 *   } else {
	 *     console.error("An error occurred:", error);
	 *   }
	 * });
	 * // 取消操作
	 * tokenSource.cancel();
	 */
	static topAsync<T>(
		array: T[],
		compare: (a: T, b: T) => number,
		n: number,
		batch: number,
		token?: CancellationToken
	): Promise<T[]> {
		if (n === 0) {
			return Promise.resolve([]);
		}

		return new Promise((resolve, reject) => {
			(async () => {
				try {
					const o = array.length;
					const result = array.slice(0, n).sort(compare);
					for (let i = n, m = Math.min(n + batch, o); i < o; i = m, m = Math.min(m + batch, o)) {
						if (i > n) {
							await new Promise(resolve => setTimeout(resolve, 0)); // 让出事件循环，避免阻塞 I/O 操作
						}
						if (token && token.isCancellationRequested) {
							throw new CancellationError();
						}
						ArrayUtils.topStep(array, compare, result, i, m);
					}
					resolve(result);
				} catch (error) {
					reject(error);
				}
			})();
		});
	}

	/**
	 * 从给定数组中选择满足特定条件的元素，并将其插入到结果数组中，保持结果数组的单调性。
	 *
	 * 该函数遍历 `array` 中的元素，从索引 `i` 开始直到 `m`，并将满足条件的元素插入到 `result` 数组中。
	 * 插入时，确保 `result` 数组中的元素按 `compare` 函数定义的顺序保持单调递增或递减。
	 * 如果新元素比 `result` 数组的最后一个元素更小（根据 `compare` 函数），则移除 `result` 数组的最后一个元素，
	 * 并在合适的位置插入新元素，以维持 `result` 的单调性。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {ReadonlyArray<T>} array - 要从中选择元素的只读数组。
	 * @param {(a: T, b: T) => number} compare - 用于比较两个元素的函数。
	 *   该函数接受两个元素 `a` 和 `b`，并返回一个数字：如果 `a < b` 返回负数，`a === b` 返回 0，`a > b` 返回正数。
	 * @param {T[]} result - 用于存储选择元素的结果数组。该数组在函数执行过程中会被修改。
	 * @param {number} i - 遍历 `array` 的起始索引。
	 * @param {number} m - 遍历 `array` 的结束索引（不包括）。
	 */
	static topStep<T>(
		array: ReadonlyArray<T>,
		compare: (a: T, b: T) => number,
		result: T[],
		i: number,
		m: number
	): void {
		for (const n = result.length; i < m; i++) {
			const element = array[i];
			if (compare(element, result[n - 1]) < 0) {
				result.pop();
				const j = this.findFirstIdxMonotonousOrArrLen(result, e => compare(element, e) < 0);
				result.splice(j, 0, element);
			}
		}
	}

	/**
	 * 创建一个新的数组，移除所有 falsy 值（如 `null`、`undefined`、`false`、`0`、空字符串 `""` 等）。
	 *
	 * 该函数接收一个包含可能为 falsy 值的只读数组，并返回一个只包含 truthy 值的新数组。
	 * 原始数组不会被修改。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {ReadonlyArray<T | undefined | null>} array - 要处理的只读数组，可能包含 falsy 值。
	 * @returns {T[]} - 一个新的数组，只包含原始数组中的 truthy 值。
	 *
	 * @example
	 * // 示例：移除数组中的 falsy 值
	 * const arr = [1, null, 2, undefined, 3, false, 4, ""];
	 * console.log(coalesce(arr)); // [1, 2, 3, 4]
	 */
	static coalesce<T>(array: ReadonlyArray<T | undefined | null>): T[] {
		return array.filter((e): e is T => !!e);
	}
	/**
	  * 从原数组中移除所有 falsy 值（如 `null`、`undefined`、`false`、`0`、空字符串 `""` 等），并修改原数组。
	  *
	  * 该函数接收一个可变数组，并在原地移除所有 falsy 值，只保留 truthy 值。
	  * 修改后的数组将只包含 truthy 值，并且长度会相应减少。
	  *
	  * @template T - 数组中元素的类型。
	  * @param {Array<T | undefined | null>} array - 要处理的可变数组，可能包含 falsy 值。
	  * @asserts array is Array<T> - 该函数会修改原数组，并确保修改后的数组只包含 truthy 值。
	  *
	  * @example
	  * // 示例：在原数组中移除 falsy 值
	  * const arr = [1, null, 2, undefined, 3, false, 4, ""];
	  * coalesceInPlace(arr);
	  * console.log(arr); // [1, 2, 3, 4]
	  */
	static coalesceInPlace<T>(array: Array<T | undefined | null>): asserts array is Array<T> {
		let to = 0;
		for (let i = 0; i < array.length; i++) {
			if (!!array[i]) {
				array[to] = array[i];
				to += 1;
			}
		}
		array.length = to;
	}



	/**
	 * 将数组中的元素从一个位置移动到另一个位置，并修改原数组。
	 *
	 * 该函数接收一个数组和两个索引 `from` 和 `to`，并将数组中索引为 `from` 的元素移动到索引 `to` 的位置。
	 * 移动操作会改变原数组的顺序。
	 *
	 * @deprecated Use `Array.copyWithin` instead. This method is deprecated and should be replaced with `Array.copyWithin` for better performance and clarity.
	 *
	 * @param {unknown[]} array - 要操作的数组。
	 * @param {number} from - 要移动的元素的起始索引。
	 * @param {number} to - 目标索引，元素将被移动到该位置。
	 *
	 * @example
	 * // 示例：移动数组中的元素
	 * const arr = [1, 2, 3, 4, 5];
	 * move(arr, 1, 3);
	 * console.log(arr); // [1, 3, 4, 2, 5]
	 */
	static move(array: unknown[], from: number, to: number): void {
		array.splice(to, 0, array.splice(from, 1)[0]);
	}

	/**
	 * 浅复制数组的一部分到同一数组中的另一个位置,数组大小不变。
	 *
	 * @param array - 要操作的数组。
	 * @param target - 从该位置开始替换数据。
	 * @param start - 从该位置开始读取数据，默认为 0 。如果为负值，表示倒数。
	 * @param end - 到该位置前停止读取数据，默认等于数组长度。如果为负值，表示倒数。
	 * @returns 操作后的数组。
	 */
	static copyWithin<T>(
		array: T[],
		target: number,
		start?: number,
		end?: number
	): T[] {
		// @ts-ignore
		if (isArray(array) && Array.prototype.copyWithin) {
			// @ts-ignore
			return array.copyWithin(target, start, end);
		}
		const len = array.length;
		let targetIndex = target >> 0;
		let startIndex = typeof start === 'number' ? start >> 0 : 0;
		let endIndex = typeof end === 'number' ? end >> 0 : len;
		// Adjust negative indices
		targetIndex = targetIndex >= 0 ? targetIndex : len + targetIndex;
		startIndex = startIndex >= 0 ? startIndex : len + startIndex;
		endIndex = endIndex >= 0 ? endIndex : len + endIndex;
		if (targetIndex < len && startIndex < endIndex) {
			const replaceArray = array.slice(startIndex, endIndex);
			for (let replaceIndex = 0; targetIndex < len; targetIndex++) {
				if (replaceIndex >= replaceArray.length) {
					break;
				}
				array[targetIndex] = replaceArray[replaceIndex++];
			}
		}
		return array;
	}


	/**
	 * 比较两个已排序的数组，并计算出将 `before` 数组转换为 `after` 数组所需的最小编辑操作（即插入和删除）。
	 *
	 * 该函数返回一个包含所有必要编辑操作的数组，每个操作描述了在 `before` 数组中从某个索引开始删除多少个元素，
	 * 以及需要插入哪些新元素。这些操作可以通过 `splice` 方法应用到 `before` 数组上，使其变为 `after` 数组。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {ReadonlyArray<T>} before - 原始的已排序数组。
	 * @param {ReadonlyArray<T>} after - 目标已排序数组。
	 * @param {(a: T, b: T) => number} compare - 用于比较两个元素的函数。
	 *   该函数接受两个元素 `a` 和 `b`，并返回一个数字：如果 `a < b` 返回负数，`a === b` 返回 0，`a > b` 返回正数。
	 * @returns {ISplice<T>[]} - 一个包含所有必要编辑操作的数组。每个操作是一个对象，包含 `start`（起始索引）、
	 *   `deleteCount`（要删除的元素数量）和 `toInsert`（要插入的新元素数组）。
	 *
	 * @example
	 * // 示例：比较两个已排序数组并计算差异
	 * const before = [1, 2, 4, 5];
	 * const after = [1, 3, 4, 6];
	 * console.log(sortedDiff(before, after, (a, b) => a - b));
	 * // 输出: [{ start: 1, deleteCount: 1, toInsert: [3] }, { start: 3, deleteCount: 1, toInsert: [6] }]
	 *
	 * @complexity
	 * - 时间复杂度：O(min(m, n))，其中 m 和 n 分别是 `before` 和 `after` 数组的长度。该函数只需遍历两个数组中的较小者。
	 * - 空间复杂度：O(k)，其中 k 是返回的编辑操作数量。每个编辑操作包含起始索引、删除计数和插入元素列表。
	 *
	 * @note
	 * - 两个输入数组必须已经按 `compare` 函数排序。如果输入数组未排序，结果可能不正确。
	 * - 如果 `before` 和 `after` 数组完全相同，则返回一个空数组。
	 */


	static sortedDiff<T>(before: ReadonlyArray<T>, after: ReadonlyArray<T>, compare: (a: T, b: T) => number): ISplice<T>[] {
		const result: IMutableSplice<T>[] = [];
		function pushSplice(start: number, deleteCount: number, toInsert: T[]): void {
			if (deleteCount === 0 && toInsert.length === 0) {
				return;
			}
			const latest = result[result.length - 1];
			if (latest && latest.start + latest.deleteCount === start) {
				latest.deleteCount += deleteCount;
				latest.toInsert.push(...toInsert);
			} else {
				result.push({ start, deleteCount, toInsert });
			}
		}
		let beforeIdx = 0;
		let afterIdx = 0;
		while (true) {
			if (beforeIdx === before.length) {
				pushSplice(beforeIdx, 0, after.slice(afterIdx));
				break;
			}
			if (afterIdx === after.length) {
				pushSplice(beforeIdx, before.length - beforeIdx, []);
				break;
			}
			const beforeElement = before[beforeIdx];
			const afterElement = after[afterIdx];
			const n = compare(beforeElement, afterElement);
			if (n === 0) {
				// 元素相等，继续比较下一个元素
				beforeIdx += 1;
				afterIdx += 1;
			} else if (n < 0) {
				// `before` 中的元素较小，表示该元素被删除
				pushSplice(beforeIdx, 1, []);
				beforeIdx += 1;
			} else if (n > 0) {
				// `after` 中的元素较小，表示该元素被插入
				pushSplice(beforeIdx, 0, [afterElement]);
				afterIdx += 1;
			}
		}
		return result;
	}


	/**
	  * 比较两个已排序的数组，并计算出它们之间的差异（即被移除和新增的元素）。
	  *
	  * 该函数返回一个对象，包含两个数组：`removed` 表示从 `before` 数组中移除的元素，
	  * `added` 表示在 `after` 数组中新增的元素。通过这种方式，可以轻松地了解两个数组之间的变化。
	  *
	  * @template T - 数组中元素的类型。
	  * @param {ReadonlyArray<T>} before - 原始的已排序数组。
	  * @param {ReadonlyArray<T>} after - 目标已排序数组。
	  * @param {(a: T, b: T) => number} compare - 用于比较两个元素的函数。
	  *   该函数接受两个元素 `a` 和 `b`，并返回一个数字：如果 `a < b` 返回负数，`a === b` 返回 0，`a > b` 返回正数。
	  * @returns {{ removed: T[]; added: T[] }} - 一个对象，包含两个数组：
	  *   - `removed`：从 `before` 数组中移除的元素。
	  *   - `added`：在 `after` 数组中新增的元素。
	  *
	  * @example
	  * // 示例：比较两个已排序数组并计算差异
	  * const before = [1, 2, 4, 5];
	  * const after = [1, 3, 4, 6];
	  * console.log(delta(before, after, (a, b) => a - b));
	  * // 输出: { removed: [2, 5], added: [3, 6] }
	  *
	  * @complexity
	  * - 时间复杂度：O(min(m, n))，其中 m 和 n 分别是 `before` 和 `after` 数组的长度。该函数只需遍历两个数组中的较小者。
	  * - 空间复杂度：O(k)，其中 k 是返回的差异元素数量。`removed` 和 `added` 数组分别存储被移除和新增的元素。
	  *
	  * @note
	  * - 两个输入数组必须已经按 `compare` 函数排序。如果输入数组未排序，结果可能不正确。
	  * - 如果 `before` 和 `after` 数组完全相同，则返回 `{ removed: [], added: [] }`。
	  */
	static delta<T>(
		before: ReadonlyArray<T>,
		after: ReadonlyArray<T>,
		compare: (a: T, b: T) => number
	): { removed: T[]; added: T[] } {
		const splices = ArrayUtils.sortedDiff(before, after, compare);
		const removed: T[] = [];
		const added: T[] = [];
		for (const splice of splices) {
			removed.push(...before.slice(splice.start, splice.start + splice.deleteCount));
			added.push(...splice.toInsert);
		}
		return { removed, added };
	}

	/**
	 * 使用快速选择算法（Quickselect）查找数组中第 N 小的元素。
	 *
	 * 该函数通过递归分区的方式，在 O(n) 平均时间复杂度内找到数组中第 N 小的元素。
	 * 快速选择算法是快速排序算法的变种，适用于在未排序数组中查找第 K 小的元素。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {number} nth - 要查找的元素的索引（0 基数）。即要找到第 `nth + 1` 小的元素。
	 * @param {T[]} data - 未排序的数组。
	 * @param {(a: T, b: T) => number} compare - 用于比较两个元素的函数。
	 *   该函数接受两个元素 `a` 和 `b`，并返回一个数字：如果 `a < b` 返回负数，`a === b` 返回 0，`a > b` 返回正数。
	 * @returns {T} - 数组中第 `nth` 小的元素。
	 * @throws {TypeError} - 如果 `nth` 大于或等于数组长度，则抛出 `TypeError`。
	 *
	 * @example
	 * // 示例：查找数组中第 2 小的元素
	 * const data = [3, 1, 4, 1, 5, 9, 2, 6];
	 * console.log(quickSelect(1, data, (a, b) => a - b)); // 输出: 1
	 *
	 * @complexity
	 * - 时间复杂度：O(n) 平均情况下，最坏情况下为 O(n^2)（当每次选择的枢轴都是最坏情况时）。
	 * - 空间复杂度：O(n)，因为函数会创建额外的数组来存储分区结果。
	 *
	 * @note
	 * - `nth` 是 0 基数的索引，即 `nth = 0` 表示最小的元素，`nth = 1` 表示第二小的元素，依此类推。
	 * - 该函数不会修改原始数组。
	 */
	static quickSelect<T>(nth: number, data: T[], compare: (a: T, b: T) => number): T {
		nth = nth | 0;
		if (nth >= data.length) throw new TypeError('invalid index');
		const pivotValue = data[Math.floor(data.length * Math.random())];
		const lower: T[] = [];
		const higher: T[] = [];
		const pivots: T[] = [];
		for (const value of data) {
			const val = compare(value, pivotValue);
			if (val < 0) {
				lower.push(value);
			} else if (val > 0) {
				higher.push(value);
			} else {
				pivots.push(value);
			}
		}
		if (nth < lower.length) {
			return ArrayUtils.quickSelect(nth, lower, compare);
		} else if (nth < lower.length + pivots.length) {
			return pivots[0];
		} else {
			return ArrayUtils.quickSelect(nth - (lower.length + pivots.length), higher, compare);
		}
	}


	/**
	 * 遍历数组中的相邻元素，并对每一对相邻元素调用给定的回调函数。
	 *
	 * 该函数遍历数组中的每个元素，并调用回调函数 `f`，传递当前元素和下一个元素作为参数。
	 * 对于第一个元素，前一个元素为 `undefined`；对于最后一个元素，下一个元素为 `undefined`。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {T[]} arr - 要遍历的数组。
	 * @param {(item1: T | undefined, item2: T | undefined) => void} f - 回调函数，接受两个参数：
	 *   - `item1`：当前元素的前一个元素（如果是第一个元素，则为 `undefined`）。
	 *   - `item2`：当前元素的下一个元素（如果是最后一个元素，则为 `undefined`）。
	 *
	 * @example
	 * // 示例：打印相邻元素对
	 * const arr = [1, 2, 3, 4];
	 * forEachAdjacent(arr, (prev, next) => {
	 *   console.log(`Previous: ${prev}, Next: ${next}`);
	 * });
	 * // 输出:
	 * // Previous: undefined, Next: 1
	 * // Previous: 1, Next: 2
	 * // Previous: 2, Next: 3
	 * // Previous: 3, Next: 4
	 * // Previous: 4, Next: undefined
	 *
	 * @note
	 * - 该函数会遍历数组中的所有元素，包括第一个和最后一个元素。
	 * - 对于第一个元素，`item1` 为 `undefined`；对于最后一个元素，`item2` 为 `undefined`。
	 */
	static forEachAdjacent<T>(
		arr: T[],
		f: (item1: T | undefined, item2: T | undefined) => void
	): void {
		for (let i = 0; i <= arr.length; i++) {
			f(i === 0 ? undefined : arr[i - 1], i === arr.length ? undefined : arr[i]);
		}
	}

	/**
	 * 遍历数组中的每个元素，并对每个元素及其前后邻居调用给定的回调函数。
	 *
	 * 该函数遍历数组中的每个元素，并调用回调函数 `f`，传递当前元素的前一个元素、当前元素和下一个元素作为参数。
	 * 对于第一个元素，前一个元素为 `undefined`；对于最后一个元素，下一个元素为 `undefined`。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {T[]} arr - 要遍历的数组。
	 * @param {(before: T | undefined, element: T, after: T | undefined) => void} f - 回调函数，接受三个参数：
	 *   - `before`：当前元素的前一个元素（如果是第一个元素，则为 `undefined`）。
	 *   - `element`：当前元素。
	 *   - `after`：当前元素的下一个元素（如果是最后一个元素，则为 `undefined`）。
	 *
	 * @example
	 * // 示例：打印每个元素及其前后邻居
	 * const arr = [1, 2, 3, 4];
	 * forEachWithNeighbors(arr, (prev, current, next) => {
	 *   console.log(`Previous: ${prev}, Current: ${current}, Next: ${next}`);
	 * });
	 * // 输出:
	 * // Previous: undefined, Current: 1, Next: 2
	 * // Previous: 1, Current: 2, Next: 3
	 * // Previous: 2, Current: 3, Next: 4
	 * // Previous: 3, Current: 4, Next: undefined
	 *
	 * @note
	 * - 该函数会遍历数组中的所有元素，包括第一个和最后一个元素。
	 * - 对于第一个元素，`before` 为 `undefined`；对于最后一个元素，`after` 为 `undefined`。
	 */
	static forEachWithNeighbors<T>(
		arr: T[],
		f: (before: T | undefined, element: T, after: T | undefined) => void
	): void {
		for (let i = 0; i < arr.length; i++) {
			f(i === 0 ? undefined : arr[i - 1], arr[i], i + 1 === arr.length ? undefined : arr[i + 1]);
		}
	}


	/**
	 * 在已排序的数组中执行二分查找算法。
	 *
	 * 该函数通过二分查找的方式，在已排序的数组中查找指定的 `key`。如果找到匹配的元素，则返回其索引；
	 * 如果未找到，则返回一个负数，表示 `key` 应插入的位置（以保持数组的排序顺序）。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {ReadonlyArray<T>} array - 要搜索的已排序数组。
	 * @param {T} key - 要查找的值。
	 * @param {(op1: T, op2: T) => number} comparator - 用于比较两个元素的函数。
	 *   该函数接受两个元素 `op1` 和 `op2`，并返回一个数字：
	 *   - 如果 `op1 === op2`，返回 0；
	 *   - 如果 `op1 < op2`，返回负数；
	 *   - 如果 `op1 > op2`，返回正数。
	 * @returns {number} - 如果找到匹配的元素，返回其索引；如果未找到，返回 -(n+1) 或 ~n，
	 *   其中 n 是 `key` 应插入的位置，以保持数组的排序顺序。
	 *
	 * @example
	 * // 示例：在已排序数组中查找元素
	 * const array = [1, 3, 5, 7, 9];
	 * console.log(binarySearch(array, 5, (a, b) => a - b)); // 输出: 2
	 * console.log(binarySearch(array, 4, (a, b) => a - b)); // 输出: -3 (表示 4 应插入到索引 2)
	 *
	 * @see {@link binarySearch2} - 更通用的二分查找函数，适用于非数组集合。
	 */
	static binarySearch<T>(array: ReadonlyArray<T>, key: T, comparator: (op1: T, op2: T) => number): number {
		return ArrayUtils.binarySearch2(array.length, i => comparator(array[i], key));
	}
	/**
	 * 在已排序的集合中执行二分查找算法。
	 *
	 * 该函数是一个更通用的二分查找实现，适用于任何可以通过索引访问的已排序集合，而不仅仅是数组。
	 * 它允许通过 `compareToKey` 函数来间接访问集合中的元素，从而避免将数据转换为数组，保持二分查找的效率。
	 *
	 * @param {number} length - 集合的长度。
	 * @param {(index: number) => number} compareToKey - 用于比较集合中元素与 `key` 的函数。
	 *   该函数接受一个索引 `index`，并返回一个数字：
	 *   - 如果集合中索引 `index` 处的元素等于 `key`，返回 0；
	 *   - 如果集合中索引 `index` 处的元素小于 `key`，返回负数；
	 *   - 如果集合中索引 `index` 处的元素大于 `key`，返回正数。
	 * @returns {number} - 如果找到匹配的元素，返回其索引；如果未找到，返回 -(n+1) 或 ~n，
	 *   其中 n 是 `key` 应插入的位置，以保持集合的排序顺序。
	 *
	 * @example
	 * // 示例：在已排序数组中查找元素（使用 `binarySearch2`）
	 * const array = [1, 3, 5, 7, 9];
	 * console.log(binarySearch2(array.length, i => array[i] - 5)); // 输出: 2
	 * console.log(binarySearch2(array.length, i => array[i] - 4)); // 输出: -3 (表示 4 应插入到索引 2)
	 *
	 * @example
	 * // 示例：在非数组集合中查找元素
	 * class SortedCollection {
	 *   constructor(private items: number[]) {}
	 *   get length() { return this.items.length; }
	 *   compare(index: number, key: number) { return this.items[index] - key; }
	 * }
	 * const collection = new SortedCollection([1, 3, 5, 7, 9]);
	 * console.log(binarySearch2(collection.length, index => collection.compare(index, 5))); // 输出: 2
	 *
	 * @complexity
	 * - 时间复杂度：O(log n)，其中 n 是集合的长度。每次迭代将搜索范围减半，因此对数时间内完成查找。
	 * - 空间复杂度：O(1)，该函数只使用常量额外空间。
	 *
	 * @note
	 * - 该函数适用于任何可以通过索引访问的已排序集合，而不仅仅是数组。这使得它在处理大规模数据或流式数据时非常有用。
	 * - 如果未找到 `key`，返回值为 -(n+1) 或 ~n，其中 n 是 `key` 应插入的位置，以保持集合的排序顺序。这种返回值约定是二分查找的标准做法，方便后续插入操作。
	 */


	static binarySearch2(length: number, compareToKey: (index: number) => number): number {
		let low = 0, high = length - 1;
		while (low <= high) {
			const mid = ((low + high) / 2) | 0;
			const comp = compareToKey(mid);
			if (comp < 0) {
				low = mid + 1;
			} else if (comp > 0) {
				high = mid - 1;
			} else {
				return mid;
			}
		}
		return -(low + 1); // 或者使用 ~low
	}



	/**
	 * 返回数组中从末尾开始的第 N 个元素。
	 *
	 * 该函数返回数组中从末尾开始的第 N 个元素。如果 N 为 0（默认值），则返回最后一个元素。
	 * 如果 N 大于或等于数组长度，或者数组为空，则返回 `undefined`。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {ArrayLike<T>} array - 要查询的数组或类数组对象。
	 * @param {number} [n=0] - 从末尾开始的索引，默认为 0（即最后一个元素）。N 为 1 表示倒数第二个元素，依此类推。
	 * @returns {T | undefined} - 从末尾开始的第 N 个元素，如果 N 超出范围或数组为空，则返回 `undefined`。
	 *
	 * @example
	 * // 示例：获取最后一个元素
	 * const arr = [1, 2, 3, 4, 5];
	 * console.log(tail(arr)); // 输出: 5
	 *
	 * @example
	 * // 示例：获取倒数第二个元素
	 * console.log(tail(arr, 1)); // 输出: 4
	 *
	 * @example
	 * // 示例：数组为空时返回 undefined
	 * console.log(tail([])); // 输出: undefined
	 *
	 * @note
	 * - 该函数适用于任何实现了 `ArrayLike` 接口的对象，包括普通数组、字符串等。
	 * - 如果 N 大于或等于数组长度，函数返回 `undefined`。
	 */
	static tail<T>(array: ArrayLike<T>, n: number = 0): T | undefined {
		return array[array.length - (1 + n)];
	}


	/**
	  * 将数组拆分为两个部分：去掉最后一个元素的数组和最后一个元素。
	  *
	  * 该函数将输入的数组拆分为两个部分：
	  * - 一个包含除了最后一个元素之外的所有元素的新数组。
	  * - 最后一个元素。
	  *
	  * 如果输入数组为空，则抛出错误。
	  *
	  * @template T - 数组中元素的类型。
	  * @param {T[]} arr - 要拆分的数组。
	  * @returns {[T[], T]} - 一个元组，包含两个元素：
	  *   - 第一个元素是去掉最后一个元素的数组。
	  *   - 第二个元素是原数组的最后一个元素。
	  * @throws {Error} - 如果输入数组为空，则抛出 `Error`，提示 "Invalid tail call"。
	  *
	  * @example
	  * // 示例：拆分非空数组
	  * const arr = [1, 2, 3, 4, 5];
	  * console.log(tail2(arr)); // 输出: [[1, 2, 3, 4], 5]
	  *
	  * @example
	  * // 示例：尝试拆分空数组（会抛出错误）
	  * try {
	  *   console.log(tail2([]));
	  * } catch (error) {
	  *   console.error(error.message); // 输出: Invalid tail call
	  * }
	  *
	  * @note
	  * - 该函数会创建一个新的数组，不会修改原始数组。
	  * - 如果输入数组为空，函数会抛出错误，因此在调用前应确保数组不为空。
	  */


	static tail2<T>(arr: T[]): [T[], T] {
		if (arr.length === 0) {
			throw new Error('Invalid tail call');
		}
		return [arr.slice(0, arr.length - 1), arr[arr.length - 1]];
	}



	/**
	  * 比较两个数组是否相等。
	  *
	  * 该函数比较两个数组是否相等。两个数组相等的条件是：
	  * - 两个数组的长度相同。
	  * - 对应位置的元素通过 `itemEquals` 函数比较相等。
	  *
	  * 如果两个数组引用相同，则直接返回 `true`。如果其中一个数组为 `undefined` 或 `null`，则返回 `false`。
	  *
	  * @template T - 数组中元素的类型。
	  * @param {ReadonlyArray<T> | undefined} one - 第一个数组或 `undefined`。
	  * @param {ReadonlyArray<T> | undefined} other - 第二个数组或 `undefined`。
	  * @param {(a: T, b: T) => boolean} [itemEquals=(a, b) => a === b] - 用于比较两个元素是否相等的函数。
	  *   默认情况下，使用严格相等运算符 `===` 进行比较。
	  * @returns {boolean} - 如果两个数组相等，返回 `true`；否则返回 `false`。
	  *
	  * @example
	  * // 示例：比较两个相同的数组
	  * const arr1 = [1, 2, 3];
	  * const arr2 = [1, 2, 3];
	  * console.log(equals(arr1, arr2)); // 输出: true
	  *
	  * @example
	  * // 示例：比较两个不同长度的数组
	  * const arr3 = [1, 2, 3];
	  * const arr4 = [1, 2, 3, 4];
	  * console.log(equals(arr3, arr4)); // 输出: false
	  *
	  * @example
	  * // 示例：使用自定义比较函数
	  * const arr5 = [{ id: 1 }, { id: 2 }];
	  * const arr6 = [{ id: 1 }, { id: 2 }];
	  * console.log(equals(arr5, arr6, (a, b) => a.id === b.id)); // 输出: true
	  *
	  * @note
	  * - 该函数适用于只读数组（`ReadonlyArray`）或 `undefined`。
	  * - 如果两个数组引用相同，则直接返回 `true`。
	  * - 如果其中一个数组为 `undefined` 或 `null`，则返回 `false`。
	  */

	static equals<T>(
		one: ReadonlyArray<T> | undefined,
		other: ReadonlyArray<T> | undefined,
		itemEquals: (a: T, b: T) => boolean = (a, b) => a === b
	): boolean {
		if (one === other) {
			return true;
		}
		if (!one || !other) {
			return false;
		}
		if (one.length !== other.length) {
			return false;
		}
		for (let i = 0, len = one.length; i < len; i++) {
			if (!itemEquals(one[i], other[i])) {
				return false;
			}
		}
		return true;
	}

	/**
	 * 通过将最后一个元素替换到指定索引处并移除最后一个元素，快速删除数组中的元素。
	 *
	 * 该函数通过将数组的最后一个元素复制到指定索引处，并移除最后一个元素，来实现快速删除操作。
	 * 这种方法比 `splice` 更快，因为它不需要移动数组中的其他元素，但会导致数组顺序发生变化。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {T[]} array - 要操作的数组。
	 * @param {number} index - 要删除的元素的索引。
	 *
	 * @example
	 * // 示例：快速删除数组中的元素
	 * const arr = [1, 2, 3, 4, 5];
	 * removeFastWithoutKeepingOrder(arr, 1);
	 * console.log(arr); // 输出: [1, 5, 3, 4]
	 *
	 * @example
	 * // 示例：删除最后一个元素
	 * const arr2 = [1, 2, 3, 4, 5];
	 * removeFastWithoutKeepingOrder(arr2, 4);
	 * console.log(arr2); // 输出: [1, 2, 3, 4]
	 *
	 * @note
	 * - 该函数会修改原始数组。
	 * - 如果 `index` 是最后一个元素的索引，则仅移除最后一个元素，不会改变数组顺序。
	 * - 如果 `index` 超出数组范围，函数不会抛出错误，但也不会进行任何操作。
	 */

	static removeFastWithoutKeepingOrder<T>(array: T[], index: number) {
		const last = array.length - 1;
		if (index < last) {
			array[index] = array[last];
		}
		array.pop();
	}


	/**
	 * 根据指定的索引器（indexer）和可选的映射器（mapper），将数组转换为一个对象。
	 *
	 * 该函数接收一个只读数组，并根据提供的 `indexer` 函数为每个元素生成一个唯一的键。
	 * 然后，它将这些键与对应的值（通过 `mapper` 函数或直接使用原始元素）组合成一个对象。
	 *
	 * @template T - 数组中元素的类型。
	 * @template R - 返回对象中值的类型。如果未提供 `mapper`，则默认为 `T`。
	 * @param {ReadonlyArray<T>} array - 要索引的只读数组。
	 * @param {(t: T) => string} indexer - 用于为每个元素生成唯一键的函数。该函数接受一个元素并返回一个字符串作为键。
	 * @param {(t: T) => R} [mapper] - 可选的映射器函数，用于将每个元素转换为对象中的值。如果不提供，默认使用原始元素。
	 * @returns {{ [key: string]: R }} - 一个对象，其中键是通过 `indexer` 生成的字符串，值是通过 `mapper` 转换后的结果或原始元素。
	 *
	 * @example
	 * // 示例：使用默认映射器（即不提供 mapper）
	 * const arr = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
	 * console.log(index(arr, item => item.id.toString()));
	 * // 输出: { '1': { id: 1, name: 'Alice' }, '2': { id: 2, name: 'Bob' } }
	 *
	 * @example
	 * // 示例：使用自定义映射器
	 * const arr = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
	 * console.log(index(arr, item => item.id.toString(), item => item.name));
	 * // 输出: { '1': 'Alice', '2': 'Bob' }
	 *
	 * @example
	 * // 示例：处理空数组
	 * console.log(index([], item => item.id.toString()));
	 * // 输出: {}
	 *
	 * @note
	 * - 如果 `array` 中有多个元素生成相同的键，则后面的元素会覆盖前面的元素。
	 * - 如果 `indexer` 生成的键不是有效的 JavaScript 对象键（例如包含特殊字符），可能会导致意外行为。
	 * - 如果 `mapper` 未提供，则直接使用原始元素作为对象的值。
	 */

	static index<T>(array: ReadonlyArray<T>, indexer: (t: T) => string): { [key: string]: T };
	static index<T, R>(array: ReadonlyArray<T>, indexer: (t: T) => string, mapper: (t: T) => R): { [key: string]: R };
	static index<T, R>(array: ReadonlyArray<T>, indexer: (t: T) => string, mapper?: (t: T) => R): { [key: string]: R } {
		return array.reduce((r, t) => {
			r[indexer(t)] = mapper ? mapper(t) : (t as unknown as R); // 类型断言确保类型安全
			return r;
		}, Object.create(null) as { [key: string]: R });
	}

	/**
	 * 将元素插入数组，并返回一个函数，该函数可以在调用时将插入的元素从数组中移除。
	 *
	 * 该函数将指定的元素插入到数组的末尾，并返回一个回调函数。当调用该回调函数时，
	 * 它会尝试从数组中移除该元素（如果存在）。这提供了一种可撤销的操作方式。
	 *
	 * @deprecated 在几乎所有情况下，建议使用 `Set<T>` 来管理集合，而不是手动操作数组。
	 *   使用 `Set<T>` 可以更高效地进行插入和删除操作，并且避免了重复元素的问题。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {T[]} array - 要插入元素的数组。
	 * @param {T} element - 要插入的元素。
	 * @returns {() => void} - 一个函数，当调用时，它会尝试从数组中移除插入的元素。
	 *
	 * @example
	 * // 示例：插入元素并获取移除函数
	 * const arr = [1, 2, 3];
	 * const removeFn = insert(arr, 4);
	 * console.log(arr); // 输出: [1, 2, 3, 4]
	 *
	 * // 调用移除函数
	 * removeFn();
	 * console.log(arr); // 输出: [1, 2, 3]
	 *
	 * @note
	 * - 如果数组中已经存在相同的元素，`insert` 仍然会将新元素插入到数组末尾。
	 * - 移除函数只会移除第一次出现的匹配元素。如果数组中有多个相同的元素，只有第一个会被移除。
	 * - 强烈建议在需要频繁插入和删除操作的场景下使用 `Set<T>`，因为它提供了更好的性能和更简洁的 API。
	 */

	static insert<T>(array: T[], element: T): () => void {
		array.push(element);
		return () => ArrayUtils.remove(array, element);
	}

	/**
	 * 从数组中移除指定的元素（如果存在）。
	 *
	 * 该函数尝试从数组中找到并移除指定的元素。如果找到了匹配的元素，则将其从数组中移除，并返回该元素；
	 * 如果未找到匹配的元素，则返回 `undefined`。
	 *
	 * @deprecated 在几乎所有情况下，建议使用 `Set<T>` 来管理集合，而不是手动操作数组。
	 *   使用 `Set<T>` 可以更高效地进行插入和删除操作，并且避免了重复元素的问题。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {T[]} array - 要从中移除元素的数组。
	 * @param {T} element - 要移除的元素。
	 * @returns {T | undefined} - 如果找到了匹配的元素并成功移除，返回该元素；否则返回 `undefined`。
	 *
	 * @example
	 * // 示例：移除存在的元素
	 * const arr = [1, 2, 3, 4];
	 * const removedElement = remove(arr, 3);
	 * console.log(removedElement); // 输出: 3
	 * console.log(arr); // 输出: [1, 2, 4]
	 *
	 * @example
	 * // 示例：尝试移除不存在的元素
	 * const arr2 = [1, 2, 4];
	 * const removedElement2 = remove(arr2, 3);
	 * console.log(removedElement2); // 输出: undefined
	 * console.log(arr2); // 输出: [1, 2, 4]
	 *
	 * @note
	 * - `remove` 只会移除第一次出现的匹配元素。如果数组中有多个相同的元素，只有第一个会被移除。
	 * - 强烈建议在需要频繁插入和删除操作的场景下使用 `Set<T>`，因为它提供了更好的性能和更简洁的 API。
	 */

	static remove<T>(array: T[], element: T): T | undefined {
		const index = array.indexOf(element);
		if (index > -1) {
			array.splice(index, 1);
			return element;
		}
		return undefined;
	}


	/**
	 * 创建一个反转比较器，用于反转传入比较器的比较结果。
	 *
	 * 该函数接收一个比较器函数，并返回一个新的比较器函数，该函数的行为与传入的比较器相反。
	 * 具体来说，新比较器会将原始比较器的结果取反（即乘以 -1），从而实现比较顺序的反转。
	 *
	 * @template TItem - 要比较的元素类型。
	 * @param {Comparator<TItem>} comparator - 原始的比较器函数，用于比较两个 `TItem` 类型的元素。
	 *   该函数接受两个元素 `a` 和 `b`，并返回一个数字：
	 *   - 如果 `a < b`，返回负数；
	 *   - 如果 `a === b`，返回 0；
	 *   - 如果 `a > b`，返回正数。
	 * @returns {Comparator<TItem>} - 一个新的比较器函数，其行为与传入的比较器相反。
	 *   - 如果 `comparator(a, b)` 返回负数，则新比较器返回正数；
	 *   - 如果 `comparator(a, b)` 返回正数，则新比较器返回负数；
	 *   - 如果 `comparator(a, b)` 返回 0，则新比较器仍然返回 0。
	 *
	 * @example
	 * // 示例：反转数字比较器
	 * const ascendingComparator = (a: number, b: number) => a - b;
	 * const descendingComparator = reverseOrder(ascendingComparator);
	 * 
	 * const numbers = [5, 2, 8, 1, 9];
	 * numbers.sort(descendingComparator); // 按降序排序
	 * console.log(numbers); // 输出: [9, 8, 5, 2, 1]
	 *
	 * @example
	 * // 示例：反转字符串比较器
	 * const stringComparator = (a: string, b: string) => a.localeCompare(b);
	 * const reversedStringComparator = reverseOrder(stringComparator);
	 * 
	 * const strings = ['apple', 'banana', 'cherry', 'date'];
	 * strings.sort(reversedStringComparator); // 按降序排序
	 * console.log(strings); // 输出: ['date', 'cherry', 'banana', 'apple']
	 *
	 * @example
	 * // 示例：反转自定义对象比较器
	 * interface Person {
	 *     name: string;
	 *     age: number;
	 * }
	 * 
	 * const ageComparator = (a: Person, b: Person) => a.age - b.age;
	 * const reversedAgeComparator = reverseOrder(ageComparator);
	 * 
	 * const people = [
	 *     { name: 'Alice', age: 30 },
	 *     { name: 'Bob', age: 25 },
	 *     { name: 'Charlie', age: 35 }
	 * ];
	 * 
	 * people.sort(reversedAgeComparator); // 按降序排序
	 * console.log(people); 
	 * // 输出: [{ name: 'Charlie', age: 35 }, { name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]
	 *
	 * @note
	 * - 该函数不会修改传入的 `comparator`，而是返回一个新的比较器函数。
	 * - 适用于需要快速反转排序顺序的场景，例如从升序切换到降序或反之。
	 */


	static reverseOrder<TItem>(comparator: Comparator<TItem>): Comparator<TItem> {
		return (a, b) => -comparator(a, b);
	}




	/**
	 * 创建一个比较器，用于根据指定的选择器对元素进行比较。
	 *
	 * 该函数接收一个选择器函数和一个比较器函数，并返回一个新的比较器函数。新比较器会首先使用选择器从每个元素中提取出一个比较键，
	 * 然后使用传入的比较器对这些比较键进行比较。这使得你可以根据对象的某个属性或复杂逻辑来定义排序规则。
	 *
	 * @template TItem - 要比较的元素类型。
	 * @template TCompareBy - 选择器提取出的比较键类型。
	 * @param {function(item: TItem): TCompareBy} selector - 选择器函数，用于从每个 `TItem` 类型的元素中提取出一个 `TCompareBy` 类型的比较键。
	 *   该函数接受一个元素 `item`，并返回一个用于比较的键。
	 * @param {Comparator<TCompareBy>} comparator - 比较器函数，用于比较两个 `TCompareBy` 类型的比较键。
	 *   该函数接受两个比较键 `a` 和 `b`，并返回一个数字：
	 *   - 如果 `a < b`，返回负数；
	 *   - 如果 `a === b`，返回 0；
	 *   - 如果 `a > b`，返回正数。
	 * @returns {Comparator<TItem>} - 一个新的比较器函数，用于比较 `TItem` 类型的元素。
	 *   该比较器会先使用 `selector` 提取比较键，然后使用 `comparator` 对这些比较键进行比较。
	 *
	 * @example
	 * // 示例：按年龄比较人员对象
	 * interface Person {
	 *     name: string;
	 *     age: number;
	 * }
	 * 
	 * const ageComparator = (a: number, b: number) => a - b;
	 * const comparePeopleByAge = compareBy((person: Person) => person.age, ageComparator);
	 * 
	 * const people = [
	 *     { name: 'Alice', age: 30 },
	 *     { name: 'Bob', age: 25 },
	 *     { name: 'Charlie', age: 35 }
	 * ];
	 * 
	 * people.sort(comparePeopleByAge); // 按年龄升序排序
	 * console.log(people); 
	 * // 输出: [{ name: 'Bob', age: 25 }, { name: 'Alice', age: 30 }, { name: 'Charlie', age: 35 }]
	 *
	 * @example
	 * // 示例：按字符串长度比较字符串
	 * const lengthComparator = (a: number, b: number) => a - b;
	 * const compareStringsByLength = compareBy((str: string) => str.length, lengthComparator);
	 * 
	 * const strings = ['apple', 'banana', 'cherry', 'date'];
	 * strings.sort(compareStringsByLength); // 按字符串长度升序排序
	 * console.log(strings); // 输出: ['date', 'apple', 'banana', 'cherry']
	 *
	 * @example
	 * // 示例：按多个属性比较对象
	 * interface Product {
	 *     name: string;
	 *     price: number;
	 *     rating: number;
	 * }
	 * 
	 * const priceComparator = (a: number, b: number) => a - b;
	 * const ratingComparator = (a: number, b: number) => b - a; // 按评分降序排列
	 * 
	 * const compareProducts = compareBy(
	 *     (product: Product) => ({ price: product.price, rating: product.rating }),
	 *     (a, b) => {
	 *         if (a.price !== b.price) return priceComparator(a.price, b.price);
	 *         return ratingComparator(a.rating, b.rating);
	 *     }
	 * );
	 * 
	 * const products = [
	 *     { name: 'Product A', price: 100, rating: 4.5 },
	 *     { name: 'Product B', price: 80, rating: 4.7 },
	 *     { name: 'Product C', price: 100, rating: 4.8 }
	 * ];
	 * 
	 * products.sort(compareProducts); // 按价格升序，评分降序排序
	 * console.log(products); 
	 * // 输出: [{ name: 'Product B', price: 80, rating: 4.7 }, { name: 'Product C', price: 100, rating: 4.8 }, { name: 'Product A', price: 100, rating: 4.5 }]
	 *
	 * @note
	 * - 该函数不会修改传入的 `selector` 或 `comparator`，而是返回一个新的比较器函数。
	 * - 适用于需要根据对象的某个属性或复杂逻辑进行排序的场景。
	 * - 如果 `selector` 返回的比较键是相同的，`comparator` 将返回 0，表示两个元素相等。
	 */


	static compareBy<TItem, TCompareBy>(selector: (item: TItem) => TCompareBy, comparator: Comparator<TCompareBy>): Comparator<TItem> {
		return (a, b) => comparator(selector(a), selector(b));
	}




	/**
	 * 使用 Fisher-Yates 洗牌算法对给定数组进行随机打乱。
	 *
	 * 该函数实现了 Fisher-Yates 洗牌算法（也称为 Knuth 洗牌算法），用于在原地打乱数组中的元素顺序。
	 * 它可以选择性地接受一个种子值来生成伪随机数，从而确保在相同种子的情况下产生相同的洗牌结果。
	 *
	 * @template T - 数组中元素的类型。
	 * @param {T[]} array - 要打乱的数组。
	 * @param {number} [_seed] - 可选的种子值，用于生成伪随机数。如果不提供种子，则使用 JavaScript 的内置 `Math.random` 函数。
	 *   提供种子时，每次调用 `shuffle` 都会根据相同的种子生成相同的洗牌结果，这对于需要可重复性的场景非常有用。
	 * @returns {void} - 该函数不会返回任何值，而是直接修改传入的数组。
	 *
	 * @example
	 * // 示例：无种子的随机洗牌
	 * const arr = [1, 2, 3, 4, 5];
	 * shuffle(arr);
	 * console.log(arr); // 输出: [3, 1, 4, 5, 2] (输出可能不同)
	 *
	 * @example
	 * // 示例：使用种子的伪随机洗牌
	 * const arr = [1, 2, 3, 4, 5];
	 * shuffle(arr, 42);
	 * console.log(arr); // 输出: [3, 1, 4, 5, 2] (每次使用相同种子时输出相同)
	 *
	 * @note
	 * - 该函数在原地修改传入的数组，不会创建新的数组。
	 * - 如果提供了种子值，`shuffle` 将使用基于种子的伪随机数生成器，确保每次调用时使用相同种子时生成相同的洗牌结果。
	 * - 如果没有提供种子值，`shuffle` 将使用 JavaScript 的内置 `Math.random` 函数，生成真正的随机结果。
	 * - Fisher-Yates 洗牌算法的时间复杂度为 O(n)，其中 n 是数组的长度。该算法保证每个元素出现在每个位置的概率是相等的。
	 */
	static shuffle<T>(list: T[], _seed?: number): T[] {
		const array: T[] = list;
		let rand: () => number;
		// 如果提供了种子值，使用基于种子的伪随机数生成器
		if (typeof _seed === 'number') {
			let seed = _seed;
			// Seeded random number generator in JS. Modified from:
			// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
			rand = () => {
				const x = Math.sin(seed++) * 179426549; // 丢弃最高有效位并减少潜在偏差
				return x - Math.floor(x);
			};
		} else {
			// 如果没有提供种子值，使用 JavaScript 的内置 Math.random 函数
			rand = Math.random;
		}
		// 实现 Fisher-Yates 洗牌算法
		for (let i = array.length - 1; i > 0; i -= 1) {
			// 在 0 到 i 之间选择一个随机索引 j
			const j = Math.floor(rand() * (i + 1));
			// 交换 array[i] 和 array[j]
			const temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	}



	/**
	 * 创建一个组合比较器，用于在多个比较器之间进行逐级比较，直到找到一个非零结果。
	 *
	 * 该函数接收多个比较器，并返回一个新的比较器。新比较器会依次使用传入的比较器对两个元素进行比较，
	 * 直到某个比较器返回非零结果（即确定了两个元素的相对顺序）。如果所有比较器都返回 0（表示相等），
	 * 则最终返回 0，表示两个元素相等。
	 *
	 * @template TItem - 要比较的元素类型。
	 * @param {...Comparator<TItem>[]} comparators - 一个或多个比较器函数，用于比较 `TItem` 类型的元素。
	 *   每个比较器接受两个元素 `item1` 和 `item2`，并返回一个数字：
	 *   - 如果 `item1 < item2`，返回负数；
	 *   - 如果 `item1 === item2`，返回 0；
	 *   - 如果 `item1 > item2`，返回正数。
	 * @returns {Comparator<TItem>} - 一个新的比较器函数，用于比较 `TItem` 类型的元素。
	 *   该比较器会依次使用传入的比较器进行比较，直到找到一个非零结果，或者所有比较器都返回 0。
	 *
	 * @example
	 * // 示例：按多个属性比较对象
	 * interface Person {
	 *     name: string;
	 *     age: number;
	 * }
	 * 
	 * const nameComparator = (a: string, b: string) => a.localeCompare(b);
	 * const ageComparator = (a: number, b: number) => a - b;
	 * 
	 * const comparePeople = tieBreakComparators(
	 *     (person1: Person, person2: Person) => nameComparator(person1.name, person2.name),
	 *     (person1: Person, person2: Person) => ageComparator(person1.age, person2.age)
	 * );
	 * 
	 * const people = [
	 *     { name: 'Alice', age: 30 },
	 *     { name: 'Bob', age: 25 },
	 *     { name: 'Alice', age: 28 }
	 * ];
	 * 
	 * people.sort(comparePeople); // 按姓名升序排序，如果姓名相同则按年龄升序排序
	 * console.log(people); 
	 * // 输出: [{ name: 'Alice', age: 28 }, { name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]
	 *
	 * @example
	 * // 示例：按多个属性比较对象（带自定义优先级）
	 * interface Product {
	 *     name: string;
	 *     price: number;
	 *     rating: number;
	 * }
	 * 
	 * const nameComparator = (a: string, b: string) => a.localeCompare(b);
	 * const priceComparator = (a: number, b: number) => a - b;
	 * const ratingComparator = (a: number, b: number) => b - a; // 按评分降序排列
	 * 
	 * const compareProducts = tieBreakComparators(
	 *     (product1: Product, product2: Product) => priceComparator(product1.price, product2.price),
	 *     (product1: Product, product2: Product) => ratingComparator(product1.rating, product2.rating),
	 *     (product1: Product, product2: Product) => nameComparator(product1.name, product2.name)
	 * );
	 * 
	 * const products = [
	 *     { name: 'Product A', price: 100, rating: 4.5 },
	 *     { name: 'Product B', price: 80, rating: 4.7 },
	 *     { name: 'Product C', price: 100, rating: 4.8 }
	 * ];
	 * 
	 * products.sort(compareProducts); // 按价格升序，评分降序，名称升序排序
	 * console.log(products); 
	 * // 输出: [{ name: 'Product B', price: 80, rating: 4.7 }, { name: 'Product C', price: 100, rating: 4.8 }, { name: 'Product A', price: 100, rating: 4.5 }]
	 *
	 * @note
	 * - 该函数不会修改传入的 `comparators`，而是返回一个新的比较器函数。
	 * - 适用于需要根据多个属性或规则进行排序的场景，确保在前一个比较器无法区分元素时，后续比较器可以继续发挥作用。
	 * - 如果所有比较器都返回 0，则最终返回 0，表示两个元素相等。
	 */

	static tieBreakComparators<TItem>(...comparators: Comparator<TItem>[]): Comparator<TItem> {
		const neitherLessOrGreaterThan = 0;
		// 辅助函数，检查比较结果是否为 0（即两个元素相等）
		function isNeitherLessOrGreaterThan(result: number): boolean {
			return result === 0;
		}
		// 返回一个新的比较器函数
		return (item1: TItem, item2: TItem): number => {
			for (const comparator of comparators) {
				const result = comparator(item1, item2);
				if (!isNeitherLessOrGreaterThan(result)) {
					return result; // 如果某个比较器返回非零结果，立即返回该结果
				}
			}
			return neitherLessOrGreaterThan; // 所有比较器都返回 0，表示两个元素相等
		};
	}


	/**
	 * @description 实例方法：使用二分查找查找最后一个满足单调性条件的元素
	 * */
	private _findLastMonotonousLastIdx = 0;
	private _prevFindLastPredicate: ((item: T) => boolean) | undefined;

	/**
	 * 创建一个新的 ArrayUtils 实例。
	 *
	 * @param {readonly T[]} _array - 要操作的只读数组。
	 */
	constructor(private readonly _array: readonly T[]) { }

	/**
	 * 使用二分查找算法查找并返回数组中最后一个满足单调性条件的元素。
	 * 谓词必须是单调的，即 `arr.map(predicate)` 必须是 `[true, ..., true, false, ..., false]` 的形式。
	 * 对于后续调用，当前谓词应该比之前的更弱（即更多的元素应该满足新的谓词）。
	 *
	 * @param {(item: T) => boolean} predicate - 用于确定元素是否符合条件的函数。
	 * @returns {T | undefined} - 满足条件的最后一个元素，如果不存在则返回 undefined。
	 */
	public findLastMonotonous(predicate: (item: T) => boolean): T | undefined {
		if (ArrayUtils.assertInvariants) {
			if (this._prevFindLastPredicate) {
				for (const item of this._array) {
					if (this._prevFindLastPredicate(item) && !predicate(item)) {
						throw new Error('MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.');
					}
				}
			}
			this._prevFindLastPredicate = predicate;
		}
		const idx = ArrayUtils.findLastIdxMonotonous(this._array, predicate, this._findLastMonotonousLastIdx);
		this._findLastMonotonousLastIdx = idx + 1;
		return idx === -1 ? undefined : this._array[idx];
	}





	/**
	 * 将一个数组分割成指定大小的组。如果数组不能被平均分配，那么最后一块将是剩下的元素。
	 *
	 * @param arr - 要分割的数组。
	 * @param size - 每组的大小，默认为1。
	 * @returns 分割后的二维数组。
	 */
	chunk<T>(arr: T[], size: number = 1): T[][] {
		if (!isArray(arr)) throw new TypeError('Expected an array');
		if (typeof size !== 'number' || size <= 0) throw new Error('Invalid size');
		const ret: T[][] = [];
		for (let i = 0; i < arr.length; i += size) {
			ret.push(arr.slice(i, i + size));
		}
		return ret;
	}

	/**
	 * 异步版本的 `chunk` 函数。
	 *
	 * @param arr - 要分割的数组。
	 * @param size - 每组的大小，默认为1。
	 * @returns Promise，解析为分割后的二维数组。
	 */
	async chunkAsync<T>(arr: T[], size: number = 1): Promise<T[][]> {
		if (!isArray(arr)) throw new TypeError('Expected an array');
		if (typeof size !== 'number' || size <= 0) throw new Error('Invalid size');
		// 使用 reduce 来创建分块
		return arr.reduce((chunks: T[][], _, i) => {
			if (i % size === 0) chunks.push(arr.slice(i, i + size));
			return chunks;
		}, []);
	}


	// 假设 isArray 的定义如下：
	// declare function isArray(value: any): value is any[];

	/**
	 * 使用二分查找（Binary Search）在有序数组中查找指定值。
	 * 如果数组是有序的，可以使用二分查找来显著提高查找速度。
	 * 二分查找的时间复杂度是 O(log n)，而线性查找的时间复杂度是 O(n)。
	 *
	 * @param list - 有序数组。
	 * @param val - 要查找的值。
	 * @returns 找到的值的索引，如果没有找到则返回 -1。
	 */
	static arrayIndexOf<T>(list: T[], val: T): number {
		return list.indexOf(val) !== -1 ? list.indexOf(val) : AlgorithmUtils.binarySearchIndexOf(list, val);
	}

	/**
	 * 从一个数组中随机返回几个元素。
	 *
	 * @param array - 要从中抽取样本的数组。
	 * @param number - 要抽取的元素个数，默认为1（如果未指定）。
	 * @returns 抽取的元素或单个元素（如果只抽取一个）。
	 */
	static sample<T>(array: T[], number?: number): T | T[] {
		let result: T[] = ArrayUtils.shuffle(array);
		if (number === undefined) {
			return result[0]; // 如果没有指定数量，则返回第一个元素
		}
		if (number < result.length) {
			result.length = number; // 截取指定数量的元素
		}
		return result;
	}





	/**
	  * 遍历数组中的每个元素，并对每个元素调用回调函数。
	  * 此函数兼容不支持 forEach 的旧环境。
	  *
	  * @param list - 要遍历的数组。
	  * @param iterate - 每次迭代时调用的函数，接收三个参数：(元素, 索引, 数组)。
	  * @param context - 可选的 this 上下文，用于调用回调函数。
	  * @throws {TypeError} 如果 list 不是数组或 iterate 不是函数。
	  */
	static arrayEach<T>(list: T[], iterate: (item: T, index: number, array: T[]) => void, context?: any): void {
		if (!Array.isArray(list)) {
			throw new TypeError('传入的 list 参数不是数组');
		}
		if (typeof iterate !== 'function') {
			throw new TypeError('传入的 iterate 参数不是函数');
		}
		if (list.forEach) {
			list.forEach(iterate, context);
		} else {
			for (let i = 0, len = list.length; i < len; i++) {
				iterate.call(context, list[i], i, list);
			}
		}
	}

	/**
	 * 迭代器，用于遍历对象或数组。
	 *
	 * @param obj - 要遍历的对象或数组。
	 * @param iterate - 回调函数。
	 * @param context - 上下文对象。
	 * @returns 遍历后的对象或数组。
	 */
	static eachArrayOrObject<T extends object | any[]>(obj: T, iterate: (item: T extends (infer U)[] ? U : T[keyof T], index: number | string, obj: T) => void, context?: any): T {
		if (obj) {
			// @ts-ignore
			return isArray(obj) ? ArrayUtils.arrayEach(obj, iterate, context) : ObjectUtils.objectEach(obj, iterate, context);
		}
		return obj;
	}

	/**
	 * 从树结构中遍历数据的键、值、路径。
	 *
	 * @param obj - 对象/数组。
	 * @param iterate - 回调函数。
	 * @param options - 选项对象。
	 * @param context - 上下文对象。
	 */
	static eachTree = helperCreateTreeFunc(eachTreeItem);




	/**
	 * 从树结构中根据回调过滤数据。
	 *
	 * @param obj - 要过滤的对象或数组。
	 * @param iterate - 回调函数，用于判断是否保留当前项。接收六个参数：(元素, 索引, 数组/对象, 路径, 父节点, 节点列表)。
	 * @param options - 可选的选项对象，包含子节点属性名称。
	 * @param context - 可选的上下文对象，用于调用回调函数。
	 * @returns 过滤后的结果数组。
	 */
	static filterTree<T>(
		obj: T[] | object,
		iterate: (item: T, index: number | string, items: T[] | object, path: string[], parent: T | null, nodes: T[]) => boolean,
		options?: { children?: string },
		context?: any
	): T[] {
		const result: T[] = [];

		if (obj && typeof iterate === 'function') {
			// @ts-ignore
			ArrayUtils.eachTree(obj, (item: T, index: number | string, items: T[] | object, path: string[], parent: T | null, nodes: T[]) => {
				if (iterate.call(context, item, index, items, path, parent, nodes)) {
					result.push(item);
				}
			}, options, context);
		}

		return result;
	}


	/**
	 * 从树结构中查找匹配第一条数据的键、值、路径。
	 *
	 * @param obj - 对象/数组。
	 * @param iterate - 回调函数，用于判断是否找到匹配项。接收六个参数：(元素, 索引, 数组/对象, 路径, 父节点, 节点列表)。
	 * @param options - 可选的选项对象，包含子节点属性名称。
	 * @param context - 可选的上下文对象，用于调用回调函数。
	 * @returns 匹配项的信息，包含索引、元素、路径等。
	 */
	// @ts-ignore
	static findTree = helperCreateTreeFunc(findTreeItem);




	/**
	 * 从树结构中指定方法后的返回值组成的新数组
	 *
	 * @param {Object} obj 对象/数组
	 * @param {Function} iterate(item, index, items, path, parent, nodes) 回调
	 * @param {Object} options {children: 'children'}
	 * @param {Object} context 上下文
	 * @return {Object/Array}
	 */
	// @ts-ignore
	static mapTree = helperCreateTreeFunc(mapTreeItem)



	/**
	 * 从树结构中根据回调查找数据。
	 *
	 * @param obj - 对象/数组。
	 * @param iterate - 回调函数，用于判断是否找到匹配项。接收六个参数：(元素, 索引, 数组/对象, 路径, 父节点, 节点列表)。
	 * @param options - 可选的选项对象，包含子节点属性名称和其他选项。
	 * @param context - 可选的上下文对象，用于调用回调函数。
	 * @return 匹配项的数组。
	 */
	// @ts-ignore

	static searchTree = helperCreateTreeFunc(function (
		parent: any,
		obj: any[],
		iterate: (item: any, index: number, items: any[], path: string[], parent: any, nodes: any[]) => boolean,
		context: any,
		path: string[],
		nodes: any[],
		parseChildren: string,
		opts: { original?: boolean; data?: string; mapChildren?: string; isEvery?: boolean }
	) {
		// @ts-ignore
		return searchTreeItem(0, parent, obj, iterate, context, path, nodes, parseChildren, opts);
	});


	/**
	 * 深层铺平数组。
	 *
	 * @param array - 要铺平的数组。
	 * @param deep - 是否深层铺平。
	 * @returns 铺平后的数组。
	 */
	static flattenDeep<T>(array: T[], deep: boolean): T[] {
		let result: T[] = [];
		array.forEach(function (vals: T | T[]) {
			if (isArray(vals)) {
				result = result.concat(deep ? ArrayUtils.flattenDeep(vals as T[], deep) : vals);
			} else {
				result.push(vals as T);
			}
		});
		return result;
	}

	/**
	 * 将一个多维数组铺平。
	 *
	 * @param array - 要铺平的数组。
	 * @param deep - 是否深层铺平，默认为 false。
	 * @returns 铺平后的数组。
	 */
	static flatten<T>(array: any, deep?: boolean): T[] {
		if (isArray(array)) return ArrayUtils.flattenDeep(array, !!deep);
		return [];
	}




	/**
	 * 将多个数组合并为一个包含元组的单个数组。
	 *
	 * 此函数接收多个数组并返回一个新的数组，其中每个元素是一个元组，
	 * 包含来自输入数组的相应元素。如果输入数组的长度不同，则结果数组将具有最长输入数组的长度，
	 * 对于缺失的元素将使用 undefined 值。
	 *
	 * @param {...T[][]} arrs - 要组合在一起的数组。
	 * @returns {T[][]} 一个新的包含来自输入数组的相应元素的元组数组。
	 *
	 * @example
	 * const arr1 = [1, 2, 3];
	 * const arr2 = ['a', 'b', 'c'];
	 * const result = zip(arr1, arr2);
	 * // result 结果将是 [[1, 'a'], [2, 'b'], [3, 'c']]
	 *
	 * const arr3 = [true, false];
	 * const result2 = zip(arr1, arr2, arr3);
	 * // result2 结果将是 [[1, 'a', true], [2, 'b', false], [3, 'c', undefined]]
	 */
	static zip<T>(arr1: readonly T[]): Array<[T]>;
	static zip<T, U>(arr1: readonly T[], arr2: readonly U[]): Array<[T, U]>;
	static zip<T, U, V>(arr1: readonly T[], arr2: readonly U[], arr3: readonly V[]): Array<[T, U, V]>;
	static zip<T, U, V, W>(
		arr1: readonly T[],
		arr2: readonly U[],
		arr3: readonly V[],
		arr4: readonly W[]
	): Array<[T, U, V, W]>;
	static zip<T>(...arr: Array<readonly T[]>): T[][] {
		const result: T[][] = [];
		const maxIndex = Math.max(...arr.map(x => x.length));
		for (let i = 0; i < maxIndex; i++) {
			const element: T[] = [];
			for (const item of arr) {
				element.push(item[i]);
			}
			result.push(element);
		}
		return result;
	}

	/**
	 * 将两个数组（一个属性名称数组和一个对应值数组）合并为一个对象。
	 *
	 * 此函数接收两个数组：一个包含属性名称，另一个包含对应的值。它返回一个新的对象，
	 * 其中第一个数组的属性名称作为键，第二个数组中的对应元素作为值。如果`keys`数组比`values`数组长，
	 * 剩余的键将具有`undefined`作为它们的值。
	 *
	 * @template P - 属性名称数组中的元素类型。
	 * @template V - 值数组中的元素类型。
	 * @param {P[]} keys - 一个包含属性名称的数组。
	 * @param {V[]} values - 一个包含与属性名称对应的值的数组。
	 * @returns {{ [K in P]: V }} 由给定属性名称和值组成的新对象。
	 *
	 * @example
	 * const keys = ['a', 'b', 'c'];
	 * const values = [1, 2, 3];
	 * const result = zipObject(keys, values);
	 * // result 结果将是 { a: 1, b: 2, c: 3 }
	 *
	 * const keys2 = ['a', 'b', 'c'];
	 * const values2 = [1, 2];
	 * const result2 = zipObject(keys2, values2);
	 * // result2 结果将是 { a: 1, b: 2, c: undefined }
	 *
	 * const keys3 = ['a', 'b'];
	 * const values3 = [1, 2, 3];
	 * const result3 = zipObject(keys3, values3);
	 * // result3 结果将是 { a: 1, b: 2 }
	 */
	static zipObject<P extends string | number | symbol, V>(keys: P[], values: V[]): { [K in P]: V } {
		const result = {} as { [K in P]: V };
		for (let i = 0; i < keys.length; i++) {
			result[keys[i]] = values[i];
		}
		return result;
	}

	/**
	 * 使用自定义组合函数将多个数组合并为一个单一的数组。
	 *
	 * 此函数接收多个数组和一个组合函数，并返回一个新的数组，其中每个元素都是通过将组合函数应用于输入数组的相应元素得到的结果。
	 *
	 * @param {T[]} arr1 - 要合并的第一个数组。
	 * @param {U[]} [arr2] - 要合并的第二个数组（可选）。
	 * @param {V[]} [arr3] - 要合并的第三个数组（可选）。
	 * @param {W[]} [arr4] - 要合并的第四个数组（可选）。
	 * @param {(...items: T[]) => R} combine - 组合函数，该函数从每个数组中取对应元素并返回一个单一值。
	 * @returns {R[]} 一个新的数组，其中每个元素都是通过将组合函数应用于输入数组的相应元素得到的结果。
	 *
	 * @example
	 * // 使用两个数组的例子：
	 * const arr1 = [1, 2, 3];
	 * const arr2 = [4, 5, 6];
	 * const result = zipWith(arr1, arr2, (a, b) => a + b);
	 * // result 结果将是 [5, 7, 9]
	 *
	 * @example
	 * // 使用三个数组的例子：
	 * const arr1 = [1, 2];
	 * const arr2 = [3, 4];
	 * const arr3 = [5, 6];
	 * const result = zipWith(arr1, arr2, arr3, (a, b, c) => `${a}${b}${c}`);
	 * // result 结果将是 [`135`, `246`]
	 */

	static zipWith<T, R>(arr1: readonly T[], combine: (item: T) => R): R[];
	static zipWith<T, U, R>(arr1: readonly T[], arr2: readonly U[], combine: (item1: T, item2: U) => R): R[];
	static zipWith<T, U, V, R>(
		arr1: readonly T[],
		arr2: readonly U[],
		arr3: readonly V[],
		combine: (item1: T, item2: U, item3: V) => R
	): R[];
	static zipWith<T, U, V, W, R>(arr1: readonly T[], arr2: readonly U[], arr3: readonly V[], arr4: readonly W[], combine: (item1: T, item2: U, item3: V, item4: W) => R): R[];
	static zipWith<T, R>(arr1: readonly T[], ...rest: any[]): R[] {
		const arrs = [arr1, ...rest.slice(0, -1)];
		const combine = rest[rest.length - 1] as (...items: T[]) => R;
		const result: R[] = [];
		const maxIndex = Math.max(...arrs.map(arr => arr.length));
		for (let i = 0; i < maxIndex; i++) {
			const elements: T[] = arrs.map(arr => arr[i]);
			result.push(combine(...elements));
		}
		return result;
	}


	/**
	 * 返回一个仅包含原始数组中基于映射器函数返回值的唯一元素的新数组。
	 *
	 * @template T - 数组中的元素类型。
	 * @template U - 映射后的元素类型。
	 * @param {T[]} arr - 要处理的数组。
	 * @param {(item: T) => U} mapper - 用于转换数组元素的函数。
	 * @returns {T[]} 一个仅包含基于映射器函数返回值的原始数组中的唯一元素的新数组。
	 *
	 * @example
	 * ```ts
	 * uniqBy([1.2, 1.5, 2.1, 3.2, 5.7, 5.3, 7.19], Math.floor);
	 * // [1.2, 2.1, 3.2, 5.7, 7.19]
	 * ```
	 * 注意：在示例中，由于`Math.floor`函数的作用，所有数值被向下取整，因此结果数组去除了那些向下取整后相同的值。
	 */
	static uniqBy<T, U>(arr: readonly T[], mapper: (item: T) => U): T[] {
		const map = new Map<U, T>();
		for (const item of arr) {
			const key = mapper(item);
			if (!map.has(key)) {
				map.set(key, item);
			}
		}
		return Array.from(map.values());
	}



	/**
	 * 返回一个仅包含基于比较器函数返回值的原始数组中的唯一元素的新数组。
	 *
	 * @template T - 数组中的元素类型。
	 * @param {T[]} arr - 要处理的数组。
	 * @param {(item1: T, item2: T) => boolean} areItemsEqual - 用于比较数组元素的函数。
	 * @returns {T[]} 一个仅包含基于比较器函数返回值的原始数组中的唯一元素的新数组。
	 *
	 * @example
	 * ```ts
	 * uniqWith([1.2, 1.5, 2.1, 3.2, 5.7, 5.3, 7.19], (a, b) => Math.abs(a - b) < 1);
	 * // [1.2, 3.2, 5.7, 7.19]
	 * ```
	 * 注意：在示例中，比较器函数`(a, b) => Math.abs(a - b) < 1`用于判断两个数是否足够接近（差值小于1），因此结果数组去除了那些与其它元素相差小于1的值。
	 */

	static uniqWith<T>(arr: readonly T[], areItemsEqual: (item1: T, item2: T) => boolean): T[] {
		const result: T[] = [];

		for (const item of arr) {
			const isUniq = result.every(v => !areItemsEqual(v, item));

			if (isUniq) {
				result.push(item);
			}
		}

		return result;
	}


	/**
	 * 从分组的元素数组中收集相同位置的元素到一个内部数组中，并将它们作为新数组返回。
	 *
	 * @param zipped - 要解压缩的嵌套数组。
	 * @returns 解压缩后的新元素数组。
	 *
	 * @example
	 * const zipped = [['a', true, 1], ['b', false, 2]];
	 * const result = unzip(zipped);
	 * // result 结果将是 [['a', 'b'], [true, false], [1, 2]]
	 */
	static unzip<T extends unknown[]>(zipped: Array<[...T]>): Unzip<T> {
		// For performance reasons, use this implementation instead of
		// const maxLen = Math.max(...zipped.map(arr => arr.length));
		let maxLen = 0;
		for (let i = 0; i < zipped.length; i++) {
			if (zipped[i].length > maxLen) {
				maxLen = zipped[i].length;
			}
		}
		const result = new Array(maxLen) as Unzip<T>;
		for (let i = 0; i < maxLen; i++) {
			result[i] = new Array(zipped.length);
			for (let j = 0; j < zipped.length; j++) {
				result[i][j] = zipped[j][i];
			}
		}

		return result;
	}

	/**
	 * 解压缩一个数组的数组，并对重新分组的元素应用一个`iteratee`函数。
	 *
	 * @template T, R
	 * @param {T[][]} target - 要解压缩的嵌套数组。这是一个数组的数组，其中每个内部数组包含待解压缩的元素。
	 * @param {(...args: T[]) => R} iteratee - 一个用于转换解压缩后的元素的函数。
	 * @returns {R[]} 一个新的解压缩并转换后的元素数组。
	 *
	 * @example
	 * const nestedArray = [[1, 2], [3, 4], [5, 6]];
	 * const result = unzipWith(nestedArray, (item, item2, item3) => item + item2 + item3);
	 * // result 结果将是 [9, 12]
	 */
	static unzipWith<T, R>(target: readonly T[][], iteratee: (...args: T[]) => R): R[] {
		const maxLength = Math.max(...target.map(innerArray => innerArray.length));
		const result: R[] = new Array(maxLength);
		for (let i = 0; i < maxLength; i++) {
			const group = new Array(target.length);
			for (let j = 0; j < target.length; j++) {
				group[j] = target[j][i];
			}
			result[i] = iteratee(...group);
		}

		return result;
	}

	/**
	 * Creates an array that excludes all specified values.
	 *
	 * It correctly excludes `NaN`, as it compares values using [SameValueZero](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero).
	 *
	 * @template T The type of elements in the array.
	 * @param {T[]} array - The array to filter.
	 * @param {...T[]} values - The values to exclude.
	 * @returns {T[]} A new array without the specified values.
	 *
	 * @example
	 * // Removes the specified values from the array
	 * without([1, 2, 3, 4, 5], 2, 4);
	 * // Returns: [1, 3, 5]
	 *
	 * @example
	 * // Removes specified string values from the array
	 * without(['a', 'b', 'c', 'a'], 'a');
	 * // Returns: ['b', 'c']
	 */
	static without<T>(array: readonly T[], ...values: T[]): T[] {
		const valuesSet = new Set(values);
		return array.filter(item => !valuesSet.has(item));
	}
	/**
	 * Creates an array of unique values from two given arrays based on a custom equality function.
	 *
	 * This function takes two arrays and a custom equality function, merges the arrays, and returns
	 * a new array containing only the unique values as determined by the custom equality function.
	 *
	 * @template T - The type of elements in the array.
	 * @param {T[]} arr1 - The first array to merge and filter for unique values.
	 * @param {T[]} arr2 - The second array to merge and filter for unique values.
	 * @param {(item1: T, item2: T) => boolean} areItemsEqual - A custom function to determine if two elements are equal.
	 * It takes two arguments and returns `true` if the elements are considered equal, and `false` otherwise.
	 * @returns {T[]} A new array of unique values based on the custom equality function.
	 *
	 * @example
	 * const array1 = [{ id: 1 }, { id: 2 }];
	 * const array2 = [{ id: 2 }, { id: 3 }];
	 * const areItemsEqual = (a, b) => a.id === b.id;
	 * const result = unionWith(array1, array2, areItemsEqual);
	 * // result will be [{ id: 1 }, { id: 2 }, { id: 3 }] since { id: 2 } is considered equal in both arrays
	 */
	static unionWith<T>(
		arr1: readonly T[],
		arr2: readonly T[],
		areItemsEqual: (item1: T, item2: T) => boolean
	): T[] {
		return ArrayUtils.uniqWith(arr1.concat(arr2), areItemsEqual);
	}



	/**
	 * Creates an array of unique values, in order, from all given arrays using a provided mapping function to determine equality.
	 *
	 * @template T - The type of elements in the array.
	 * @template U - The type of mapped elements.
	 * @param {T[]} arr1 - The first array.
	 * @param {T[]} arr2 - The second array.
	 * @param {(item: T) => U} mapper - The function to map array elements to comparison values.
	 * @returns {T[]} A new array containing the union of unique elements from `arr1` and `arr2`, based on the values returned by the mapping function.
	 *
	 * @example
	 * // Custom mapping function for numbers (modulo comparison)
	 * const moduloMapper = (x) => x % 3;
	 * unionBy([1, 2, 3], [4, 5, 6], moduloMapper);
	 * // Returns [1, 2, 3]
	 *
	 * @example
	 * // Custom mapping function for objects with an 'id' property
	 * const idMapper = (obj) => obj.id;
	 * unionBy([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }], idMapper);
	 * // Returns [{ id: 1 }, { id: 2 }, { id: 3 }]
	 */
	static unionBy<T, U>(arr1: readonly T[], arr2: readonly T[], mapper: (item: T) => U): T[] {
		const map = new Map<U, T>();
		for (const item of [...arr1, ...arr2]) {
			const key = mapper(item);

			if (!map.has(key)) {
				map.set(key, item);
			}
		}
		return Array.from(map.values());
	}


	/**
	 * Creates a duplicate-free version of an array.
	 *
	 * This function takes an array and returns a new array containing only the unique values
	 * from the original array, preserving the order of first occurrence.
	 *
	 * @template T - The type of elements in the array.
	 * @param {T[]} arr - The array to process.
	 * @returns {T[]} A new array with only unique values from the original array.
	 *
	 * @example
	 * const array = [1, 2, 2, 3, 4, 4, 5];
	 * const result = uniq(array);
	 * // result will be [1, 2, 3, 4, 5]
	 */
	static uniq<T>(arr: readonly T[]): T[] {
		return Array.from(new Set(arr));
	}

	/**
	 * Creates an array of unique values from all given arrays.
	 *
	 * This function takes two arrays, merges them into a single array, and returns a new array
	 * containing only the unique values from the merged array.
	 *
	 * @template T - The type of elements in the array.
	 * @param {T[]} arr1 - The first array to merge and filter for unique values.
	 * @param {T[]} arr2 - The second array to merge and filter for unique values.
	 * @returns {T[]} A new array of unique values.
	 *
	 * @example
	 * const array1 = [1, 2, 3];
	 * const array2 = [3, 4, 5];
	 * const result = union(array1, array2);
	 * // result will be [1, 2, 3, 4, 5]
	 */
	static union<T>(arr1: readonly T[], arr2: readonly T[]): T[] {
		return ArrayUtils.uniq(arr1.concat(arr2));
	}



	/**
	 * Creates a new array filled with the specified value from the start position up to, but not including, the end position.
	 * This function does not mutate the original array.
	 *
	 * @param {Array<T>} arr - The array to base the new array on.
	 * @param {U} value - The value to fill the new array with.
	 * @param {number} [start=0] - The start position. Defaults to 0.
	 * @param {number} [end=arr.length] - The end position. Defaults to the array's length.
	 * @returns {Array<T | U>} The new array with the filled values.
	 *
	 * @example
	 * const array = [1, 2, 3, 4, 5];
	 * let result = toFilled(array, '*', 2);
	 * console.log(result); // [1, 2, '*', '*', '*']
	 * console.log(array); // [1, 2, 3, 4, 5]
	 *
	 * result = toFilled(array, '*', 1, 4);
	 * console.log(result); // [1, '*', '*', '*', 5]
	 * console.log(array); // [1, 2, 3, 4, 5]
	 *
	 * result = toFilled(array, '*');
	 * console.log(result); // ['*', '*', '*', '*', '*']
	 * console.log(array); // [1, 2, 3, 4, 5]
	 *
	 * result = toFilled(array, '*', -4, -1);
	 * console.log(result); // [1, '*', '*', '*', 5]
	 * console.log(array); // [1, 2, 3, 4, 5]
	 */

	static toFilled<T, U>(arr: T[], value: U): Array<T | U>;
	static toFilled<T, U>(arr: T[], value: U, start: number): Array<T | U>;
	static toFilled<T, U>(arr: T[], value: U, start: number, end: number): Array<T | U>;
	static toFilled<T, U>(arr: T[], value: U, start = 0, end = arr.length): Array<T | U> {
		const length = arr.length;
		const finalStart = Math.max(start >= 0 ? start : length + start, 0);
		const finalEnd = Math.min(end >= 0 ? end : length + end, length);

		const newArr: Array<T | U> = arr.slice();

		for (let i = finalStart; i < finalEnd; i++) {
			newArr[i] = value;
		}

		return newArr;
	}


	/**
	 * Returns a new array containing the leading elements of the provided array
	 * that satisfy the provided predicate function. It stops taking elements as soon
	 * as an element does not satisfy the predicate.
	 *
	 * @template T - The type of elements in the array.
	 * @param {T[]} arr - The array to process.
	 * @param {(element: T) => boolean} shouldContinueTaking - The predicate function that is called with each element. Elements are included in the result as long as this function returns true.
	 * @returns {T[]} A new array containing the leading elements that satisfy the predicate.
	 *
	 * @example
	 * // Returns [1, 2]
	 * takeWhile([1, 2, 3, 4], x => x < 3);
	 *
	 * @example
	 * // Returns []
	 * takeWhile([1, 2, 3, 4], x => x > 3);
	 */
	static takeWhile<T>(arr: readonly T[], shouldContinueTaking: (element: T) => boolean): T[] {
		const result: T[] = [];

		for (const item of arr) {
			if (!shouldContinueTaking(item)) {
				break;
			}

			result.push(item);
		}

		return result;
	}




	/**
	 * Takes elements from the end of the array while the predicate function returns `true`.
	 *
	 * @template T - Type of elements in the input array.
	 *
	 * @param {T[]} arr - The array to take elements from.
	 * @param {function(T): boolean} shouldContinueTaking - The function invoked per element.
	 * @returns {T[]} A new array containing the elements taken from the end while the predicate returns `true`.
	 *
	 * @example
	 * // Returns [3, 2, 1]
	 * takeRightWhile([5, 4, 3, 2, 1], n => n < 4);
	 *
	 * @example
	 * // Returns []
	 * takeRightWhile([1, 2, 3], n => n > 3);
	 */
	static takeRightWhile<T>(arr: readonly T[], shouldContinueTaking: (item: T) => boolean): T[] {
		for (let i = arr.length - 1; i >= 0; i--) {
			if (!shouldContinueTaking(arr[i])) {
				return arr.slice(i + 1);
			}
		}
		return arr.slice();
	}

	/**
	 * Returns a new array containing the last `count` elements from the input array `arr`.
	 * If `count` is greater than the length of `arr`, the entire array is returned.
	 *
	 * @template T - The type of elements in the array.
	 * @param {T[]} arr - The array to take elements from.
	 * @param {number} count - The number of elements to take.
	 * @returns {T[]} A new array containing the last `count` elements from `arr`.
	 *
	 * @example
	 * // Returns [4, 5]
	 * takeRight([1, 2, 3, 4, 5], 2);
	 *
	 * @example
	 * // Returns ['b', 'c']
	 * takeRight(['a', 'b', 'c'], 2);
	 *
	 * @example
	 * // Returns [1, 2, 3]
	 * takeRight([1, 2, 3], 5);
	 */
	static takeRight<T>(arr: readonly T[], count: number): T[] {
		if (count === 0) {
			return [];
		}
		return arr.slice(-count);
	}
	/**
	 * Returns a new array containing the first `count` elements from the input array `arr`.
	 * If `count` is greater than the length of `arr`, the entire array is returned.
	 *
	 * @template T - Type of elements in the input array.
	 *
	 * @param {T[]} arr - The array to take elements from.
	 * @param {number} count - The number of elements to take.
	 * @returns {T[]} A new array containing the first `count` elements from `arr`.
	 *
	 * @example
	 * // Returns [1, 2, 3]
	 * take([1, 2, 3, 4, 5], 3);
	 *
	 * @example
	 * // Returns ['a', 'b']
	 * take(['a', 'b', 'c'], 2);
	 *
	 * @example
	 * // Returns [1, 2, 3]
	 * take([1, 2, 3], 5);
	 */
	static take<T>(arr: readonly T[], count: number): T[] {
		return arr.slice(0, count);
	}


	/**
	 * Returns a sample element array of a specified `size`.
	 *
	 * This function takes an array and a number, and returns an array containing the sampled elements using Floyd's algorithm.
	 *
	 * {@link https://www.nowherenearithaca.com/2013/05/robert-floyds-tiny-and-beautiful.html Floyd's algoritm}
	 *
	 * @template T - The type of elements in the array.
	 * @param {T[]} array - The array to sample from.
	 * @param {number} size - The size of sample.
	 * @returns {T[]} A new array with sample size applied.
	 * @throws {Error} Throws an error if `size` is greater than the length of `array`.
	 *
	 * @example
	 * const result = sampleSize([1, 2, 3], 2)
	 * // result will be an array containing two of the elements from the array.
	 * // [1, 2] or [1, 3] or [2, 3]
	 */
	static sampleSize<T>(array: readonly T[], size: number): T[] {
		if (size > array.length) {
			throw new Error('Size must be less than or equal to the length of array.');
		}
		const result = new Array(size);
		const selected = new Set();
		for (let step = array.length - size, resultIndex = 0; step < array.length; step++, resultIndex++) {
			let index = randomInt(0, step + 1);
			if (selected.has(index)) {
				index = step;
			}
			selected.add(index);
			result[resultIndex] = array[index];
		}
		return result;
	}

	/**
	 * Splits an array into two groups based on a predicate function.
	 *
	 * This function takes an array and a predicate function. It returns a tuple of two arrays:
	 * the first array contains elements for which the predicate function returns true, and
	 * the second array contains elements for which the predicate function returns false.
	 *
	 * @template T - The type of elements in the array.
	 * @param {T[]} arr - The array to partition.
	 * @param {(value: T) => boolean} isInTruthy - A predicate function that determines
	 * whether an element should be placed in the truthy array. The function is called with each
	 * element of the array.
	 * @returns {[T[], T[]]} A tuple containing two arrays: the first array contains elements for
	 * which the predicate returned true, and the second array contains elements for which the
	 * predicate returned false.
	 *
	 * @example
	 * const array = [1, 2, 3, 4, 5];
	 * const isEven = x => x % 2 === 0;
	 * const [even, odd] = partition(array, isEven);
	 * // even will be [2, 4], and odd will be [1, 3, 5]
	 */
	static partition<T>(arr: readonly T[], isInTruthy: (value: T) => boolean): [truthy: T[], falsy: T[]] {
		const truthy: T[] = [];
		const falsy: T[] = [];
		for (const item of arr) {
			if (isInTruthy(item)) {
				truthy.push(item);
			} else {
				falsy.push(item);
			}
		}
		return [truthy, falsy];
	}






	/**
	 * Sorts an array of objects based on multiple properties and their corresponding order directions.
	 *
	 * This function takes an array of objects, an array of keys to sort by, and an array of order directions.
	 * It returns the sorted array, ordering by each key according to its corresponding direction
	 * ('asc' for ascending or 'desc' for descending). If values for a key are equal,
	 * it moves to the next key to determine the order.
	 *
	 * @template T - The type of elements in the array.
	 * @param {T[]} collection - The array of objects to be sorted.
	 * @param {Array<keyof T>} keys - An array of keys (properties) by which to sort.
	 * @param {Order[]} orders - An array of order directions ('asc' for ascending or 'desc' for descending).
	 * @returns {T[]} - The sorted array.
	 *
	 * @example
	 * // Sort an array of objects by 'user' in ascending order and 'age' in descending order.
	 * const users = [
	 *   { user: 'fred', age: 48 },
	 *   { user: 'barney', age: 34 },
	 *   { user: 'fred', age: 40 },
	 *   { user: 'barney', age: 36 },
	 * ];
	 * const result = orderBy(users, ['user', 'age'], ['asc', 'desc']);
	 * // result will be:
	 * // [
	 * //   { user: 'barney', age: 36 },
	 * //   { user: 'barney', age: 34 },
	 * //   { user: 'fred', age: 48 },
	 * //   { user: 'fred', age: 40 },
	 * // ]
	 */
	static orderBy<T>(collection: T[], keys: Array<keyof T>, orders: Order[]): T[] {
		const compareValues = (a: T[keyof T], b: T[keyof T], order: Order) => {
			if (a < b) {
				return order === 'asc' ? -1 : 1;
			}
			if (a > b) {
				return order === 'asc' ? 1 : -1;
			}
			return 0;
		};

		const effectiveOrders = keys.map((_, index) => orders[index] || orders[orders.length - 1]);

		return collection.slice().sort((a, b) => {
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				const order = effectiveOrders[i];
				const result = compareValues(a[key], b[key], order);
				if (result !== 0) {
					return result;
				}
			}
			return 0;
		});
	}


	/**
	 * Finds the element in an array that has the minimum value when applying
	 * the `getValue` function to each element.
	 *
	 * @template T - The type of elements in the array.
	 * @param {T[]} items The array of elements to search.
	 * @param {(element: T) => number} getValue A function that selects a numeric value from each element.
	 * @returns {T} The element with the minimum value as determined by the `getValue` function.
	 * @example
	 * minBy([{ a: 1 }, { a: 2 }, { a: 3 }], x => x.a); // Returns: { a: 1 }
	 * minBy([], x => x.a); // Returns: undefined
	 */
	static minBy<T>(items: T[], getValue: (element: T) => number): T {
		let minElement = items[0];
		let min = Infinity;
		for (const element of items) {
			const value = getValue(element);
			if (value < min) {
				min = value;
				minElement = element;
			}
		}
		return minElement;
	}



	/**
	 * Finds the element in an array that has the maximum value when applying
	 * the `getValue` function to each element.
	 *
	 * @template T - The type of elements in the array.
	 * @param {T[]} items The array of elements to search.
	 * @param {(element: T) => number} getValue A function that selects a numeric value from each element.
	 * @returns {T} The element with the maximum value as determined by the `getValue` function.
	 * @example
	 * maxBy([{ a: 1 }, { a: 2 }, { a: 3 }], x => x.a); // Returns: { a: 3 }
	 * maxBy([], x => x.a); // Returns: undefined
	 */
	static maxBy<T>(items: T[], getValue: (element: T) => number): T {
		let maxElement = items[0];
		let max = -Infinity;

		for (const element of items) {
			const value = getValue(element);
			if (value > max) {
				max = value;
				maxElement = element;
			}
		}

		return maxElement;
	}

	/**
	 * Maps each element of an array based on a provided key-generating function.
	 *
	 * This function takes an array and a function that generates a key from each element. It returns
	 * an object where the keys are the generated keys and the values are the corresponding elements.
	 * If there are multiple elements generating the same key, the last element among them is used
	 * as the value.
	 *
	 * @template T - The type of elements in the array.
	 * @template K - The type of keys.
	 * @param {T[]} arr - The array of elements to be mapped.
	 * @param {(item: T) => K} getKeyFromItem - A function that generates a key from an element.
	 * @returns {Record<K, T>} An object where keys are mapped to each element of an array.
	 *
	 * @example
	 * const array = [
	 *   { category: 'fruit', name: 'apple' },
	 *   { category: 'fruit', name: 'banana' },
	 *   { category: 'vegetable', name: 'carrot' }
	 * ];
	 * const result = keyBy(array, item => item.category);
	 * // result will be:
	 * // {
	 * //   fruit: { category: 'fruit', name: 'banana' },
	 * //   vegetable: { category: 'vegetable', name: 'carrot' }
	 * // }
	 */
	static keyBy<T, K extends PropertyKey>(arr: readonly T[], getKeyFromItem: (item: T) => K): Record<K, T> {
		const result = {} as Record<K, T>;
		for (const item of arr) {
			const key = getKeyFromItem(item);
			result[key] = item;
		}

		return result;
	}

	/**
	 * Returns the intersection of two arrays based on a custom equality function.
	 *
	 * This function takes two arrays and a custom equality function. It returns a new array containing
	 * the elements from the first array that have matching elements in the second array, as determined
	 * by the custom equality function. It effectively filters out any elements from the first array that
	 * do not have corresponding matches in the second array according to the equality function.
	 *
	 * @template T - The type of elements in the array.
	 * @param {T[]} firstArr - The first array to compare.
	 * @param {T[]} secondArr - The second array to compare.
	 * @param {(x: T, y: T) => boolean} areItemsEqual - A custom function to determine if two elements are equal.
	 * This function takes two arguments, one from each array, and returns `true` if the elements are considered equal, and `false` otherwise.
	 * @returns {T[]} A new array containing the elements from the first array that have corresponding matches in the second array according to the custom equality function.
	 *
	 * @example
	 * const array1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
	 * const array2 = [{ id: 2 }, { id: 4 }];
	 * const areItemsEqual = (a, b) => a.id === b.id;
	 * const result = intersectionWith(array1, array2, areItemsEqual);
	 * // result will be [{ id: 2 }] since this element has a matching id in both arrays.
	 */
	static intersectionWith<T>(
		firstArr: readonly T[],
		secondArr: readonly T[],
		areItemsEqual: (x: T, y: T) => boolean
	): T[] {
		return firstArr.filter(firstItem => {
			return secondArr.some(secondItem => {
				return areItemsEqual(firstItem, secondItem);
			});
		});
	}


	/**
	 * Returns the intersection of two arrays based on a mapping function.
	 *
	 * This function takes two arrays and a mapping function. It returns a new array containing
	 * the elements from the first array that, when mapped using the provided function, have matching
	 * mapped elements in the second array. It effectively filters out any elements from the first array
	 * that do not have corresponding mapped values in the second array.
	 *
	 * @template T - The type of elements in the array.
	 * @template U - The type of mapped elements.
	 * @param {T[]} firstArr - The first array to compare.
	 * @param {T[]} secondArr - The second array to compare.
	 * @param {(item: T) => U} mapper - A function to map the elements of both arrays for comparison.
	 * @returns {T[]} A new array containing the elements from the first array that have corresponding mapped values in the second array.
	 *
	 * @example
	 * const array1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
	 * const array2 = [{ id: 2 }, { id: 4 }];
	 * const mapper = item => item.id;
	 * const result = intersectionBy(array1, array2, mapper);
	 * // result will be [{ id: 2 }] since only this element has a matching id in both arrays.
	 */
	static intersectionBy<T, U>(firstArr: readonly T[], secondArr: readonly T[], mapper: (item: T) => U): T[] {
		const mappedSecondSet = new Set(secondArr.map(mapper));
		return firstArr.filter(item => mappedSecondSet.has(mapper(item)));
	}

	/**
	 * Returns the intersection of two arrays.
	 *
	 * This function takes two arrays and returns a new array containing the elements that are
	 * present in both arrays. It effectively filters out any elements from the first array that
	 * are not found in the second array.
	 *
	 * @template T - The type of elements in the array.
	 * @param {T[]} firstArr - The first array to compare.
	 * @param {T[]} secondArr - The second array to compare.
	 * @returns {T[]} A new array containing the elements that are present in both arrays.
	 *
	 * @example
	 * const array1 = [1, 2, 3, 4, 5];
	 * const array2 = [3, 4, 5, 6, 7];
	 * const result = intersection(array1, array2);
	 * // result will be [3, 4, 5] since these elements are in both arrays.
	 */
	static intersection<T>(firstArr: readonly T[], secondArr: readonly T[]): T[] {
		const secondSet = new Set(secondArr);
		return firstArr.filter(item => {
			return secondSet.has(item);
		});
	}

	/**
	 * Iterates over elements of 'arr' from right to left and invokes 'callback' for each element.
	 * 
	 * @template T - The type of elements in the array.
	 * @param {T[]} arr - The array to iterate over.
	 * @param {(value: T, index: number, arr: T[]) => void} callback - The function invoked per iteration.
	 * The callback function receives three arguments:
	 *  - 'value': The current element being processed in the array.
	 *  - 'index': The index of the current element being processed in the array.
	 *  - 'arr': The array 'forEachRight' was called upon.
	 * 
	 * @example
	 * const array = [1, 2, 3];
	 * const result: number[] = [];
	 * 
	 * // Use the forEachRight function to iterate through the array and add each element to the result array.
	 * forEachRight(array, (value) => {
	 *  result.push(value);
	 * })
	 * 
	 * console.log(result) // Output: [3, 2, 1]
	 */

	static forEachRight<T>(arr: T[], callback: (value: T, index: number, arr: T[]) => void): void {
		for (let i = arr.length - 1; i >= 0; i--) {
			const element = arr[i];
			callback(element, i, arr);
		}
	}

	/**
	 * Fills elements of an array with a specified value from the start position up to, but not including, the end position.
	 *
	 * This function mutates the original array and replaces its elements with the provided value, starting from the specified
	 * start index up to the end index (non-inclusive). If the start or end indices are not provided, it defaults to filling the
	 * entire array. Negative indices can be used to specify positions from the end of the array.
	 *
	 * @param {Array<T | P>} arr - The array to fill.
	 * @param {P} value - The value to fill the array with.
	 * @param {number} [start=0] - The start position. Defaults to 0.
	 * @param {number} [end=arr.length] - The end position. Defaults to the array's length.
	 * @returns {Array<T | P>} The array with the filled values.
	 *
	 * @example
	 * const array = [1, 2, 3];
	 * const result = fill(array, 'a');
	 * // => ['a', 'a', 'a']
	 *
	 * const result = fill(Array(3), 2);
	 * // => [2, 2, 2]
	 *
	 * const result = fill([4, 6, 8, 10], '*', 1, 3);
	 * // => [4, '*', '*', 10]
	 */

	static fill<T>(arr: unknown[], value: T): T[];
	static fill<T, P>(arr: Array<T | P>, value: P, start: number): Array<T | P>;
	static fill<T, P>(arr: Array<T | P>, value: P, start: number, end: number): Array<T | P>;
	static fill<T, P>(arr: Array<T | P>, value: P, start = 0, end = arr.length): Array<T | P> {
		start = Math.max(start, 0);
		end = Math.min(end, arr.length);
		for (let i = start; i < end; i++) {
			arr[i] = value;
		}
		return arr;
	}


	/**
	 * Removes falsey values (false, null, 0, '', undefined, NaN) from an array.
	 *
	 * @template T - The type of elements in the array.
	 * @param {readonly T[]} arr - The input array to remove falsey values.
	 * @returns {Array<Exclude<T, false | null | 0 | '' | undefined>>} - A new array with all falsey values removed.
	 *
	 * @example
	 * compact([0, 1, false, 2, '', 3, null, undefined, 4, NaN, 5]);
	 * Returns: [1, 2, 3, 4, 5]
	 */
	static compact<T>(arr: readonly T[]): Array<NotFalsey<T>> {
		const result: Array<NotFalsey<T>> = [];
		for (const item of arr) {
			if (item) {
				result.push(item as NotFalsey<T>);
			}
		}
		return result;
	}


	/**
	 * Count the occurrences of each item in an array
	 * based on a transformation function.
	 *
	 * This function takes an array and a transformation function
	 * that converts each item in the array to a string. It then
	 * counts the occurrences of each transformed item and returns
	 * an object with the transformed items as keys and the counts
	 * as values.
	 *
	 * @template T - The type of the items in the input array.
	 *
	 * @param {T[]} arr - The input array to count occurrences.
	 * @param {(item: T) => string} mapper - The transformation function that maps each item to a string key.
	 * @returns {Record<string, number>} An object containing the transformed items as keys and the
	 * counts as values.
	 */
	static countBy<T>(arr: T[], mapper: (item: T) => string): Record<string, number> {
		const result: Record<string, number> = {};

		for (const item of arr) {
			const key = mapper(item);

			result[key] = (result[key] ?? 0) + 1;
		}

		return result;
	}


	/**
	 * Computes the difference between two arrays.
	 *
	 * This function takes two arrays and returns a new array containing the elements
	 * that are present in the first array but not in the second array. It effectively
	 * filters out any elements from the first array that also appear in the second array.
	 *
	 * @template T
	 * @param {T[]} firstArr - The array from which to derive the difference. This is the primary array
	 * from which elements will be compared and filtered.
	 * @param {T[]} secondArr - The array containing elements to be excluded from the first array.
	 * Each element in this array will be checked against the first array, and if a match is found,
	 * that element will be excluded from the result.
	 * @returns {T[]} A new array containing the elements that are present in the first array but not
	 * in the second array.
	 *
	 * @example
	 * const array1 = [1, 2, 3, 4, 5];
	 * const array2 = [2, 4];
	 * const result = difference(array1, array2);
	 * // result will be [1, 3, 5] since 2 and 4 are in both arrays and are excluded from the result.
	 */
	static difference<T>(firstArr: readonly T[], secondArr: readonly T[]): T[] {
		const secondSet = new Set(secondArr);
		return firstArr.filter(item => !secondSet.has(item));
	}


	/**
	 * Computes the difference between two arrays after mapping their elements through a provided function.
	 *
	 * This function takes two arrays and a mapper function. It returns a new array containing the elements
	 * that are present in the first array but not in the second array, based on the identity calculated
	 * by the mapper function.
	 *
	 * Essentially, it filters out any elements from the first array that, when
	 * mapped, match an element in the mapped version of the second array.
	 *
	 * @template T, U
	 * @param {T[]} firstArr - The primary array from which to derive the difference.
	 * @param {T[]} secondArr - The array containing elements to be excluded from the first array.
	 * @param {(value: T) => U} mapper - The function to map the elements of both arrays. This function
	 * is applied to each element in both arrays, and the comparison is made based on the mapped values.
	 * @returns {T[]} A new array containing the elements from the first array that do not have a corresponding
	 * mapped identity in the second array.
	 *
	 * @example
	 * const array1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
	 * const array2 = [{ id: 2 }, { id: 4 }];
	 * const mapper = item => item.id;
	 * const result = differenceBy(array1, array2, mapper);
	 * // result will be [{ id: 1 }, { id: 3 }] since the elements with id 2 are in both arrays and are excluded from the result.
	 */
	static differenceBy<T, U>(firstArr: readonly T[], secondArr: readonly T[], mapper: (value: T) => U): T[] {
		const mappedSecondSet = new Set(secondArr.map(item => mapper(item)));
		return firstArr.filter(item => {
			return !mappedSecondSet.has(mapper(item));
		});
	}



	/**
	 * Computes the difference between two arrays based on a custom equality function.
	 *
	 * This function takes two arrays and a custom comparison function. It returns a new array containing
	 * the elements that are present in the first array but not in the second array. The comparison to determine
	 * if elements are equal is made using the provided custom function.
	 *
	 * @template T
	 * @param {T[]} firstArr - The array from which to get the difference.
	 * @param {T[]} secondArr - The array containing elements to exclude from the first array.
	 * @param {(x: T, y: T) => boolean} areItemsEqual - A function to determine if two items are equal.
	 * @returns {T[]} A new array containing the elements from the first array that do not match any elements in the second array
	 * according to the custom equality function.
	 *
	 * @example
	 * const array1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
	 * const array2 = [{ id: 2 }, { id: 4 }];
	 * const areItemsEqual = (a, b) => a.id === b.id;
	 * const result = differenceWith(array1, array2, areItemsEqual);
	 * // result will be [{ id: 1 }, { id: 3 }] since the elements with id 2 are considered equal and are excluded from the result.
	 */
	static differenceWith<T>(
		firstArr: readonly T[],
		secondArr: readonly T[],
		areItemsEqual: (x: T, y: T) => boolean
	): T[] {
		return firstArr.filter(firstItem => {
			return secondArr.every(secondItem => {
				return !areItemsEqual(firstItem, secondItem);
			});
		});
	}
	/**
	 * 判断数组 list 是否包含元素 target。
	 * @param target 待判断的元素。
	 * @param list 数组。
	 * @returns {boolean} 数组（array）包含元素（target）则为true，否则为false。
	 * @see {@link https://hyhello.github.io/utils/#/oneOf 在线文档}
	 */
	static oneOf<T>(target: T, list: Array<T>): boolean {
		return list.some((item) => target === item);
	}

	static rangeArr<T>(n: number, iteratee?: T): Array<T | undefined>;

	static rangeArr<T>(n: number, iteratee?: (k: number) => T): Array<T | undefined>;

	static rangeArr<T>(n: number, iteratee?: T | ((k: number) => T)): Array<T | undefined>;
	/**
	 * 创建一个长度为（n）的数组，数组每个值为（iteratee）（注：默认为 undefined）。
	 * @param n 数组的长度。
	 * @param iteratee 数组包含的默认值。
	 * @returns {Array<T | undefined>} 创建一个长度为（n）的数组，数组每个值为（iteratee）。
	 * @see {@link https://hyhello.github.io/utils/#/rangeArr 在线文档}
	 */
	static rangeArr<T>(n: number, iteratee?: T | ((k: number) => T)): Array<T | undefined> {
		const iterFn = isFunction(iteratee) ? iteratee : () => iteratee;
		return Array.from<{ length: number }, T | undefined>({ length: n }, (v: any, k: number) => iterFn(k));
	}

	/**
	 * 将类数组（likeArr）转为真正的数组。（注：类数组，包含 length, 且 index 从 0 开始）。
	 * @param likeArr 类数组。
	 * @returns {Array<T>} 返回一个新数组。
	 * @see {@link https://hyhello.github.io/utils/#/toArray 在线文档}
	 */
	static toArray<T>(likeArr: ArrayLike<T>): Array<T> {
		if (isArray(likeArr)) {
			return likeArr.slice.call(likeArr);
		} else {
			throw new Error(likeArr + "is not Array");
		}
	}


	/**
	 * Casts `value` as an array if it's not one.
	 *
	 * @since 4.4.0
	 * @category Lang
	 * @param {*} value The value to inspect.
	 * @returns {Array} Returns the cast array.
	 * @example
	 *
	 * castArray(1)
	 * // => [1]
	 *
	 * castArray({ 'a': 1 })
	 * // => [{ 'a': 1 }]
	 *
	 * castArray('abc')
	 * // => ['abc']
	 *
	 * castArray(null)
	 * // => [null]
	 *
	 * castArray(undefined)
	 * // => [undefined]
	 *
	 * castArray()
	 * // => []
	 *
	 * const array = [1, 2, 3]
	 * console.log(castArray(array) === array)
	 * // => true
	 */
	static castArray(...args: any[]): Array<any> {
		if (!args.length) {
			return [];
		}
		const value = args[0];
		return isArray(value) ? value : [value];
	}


}
type NotFalsey<T> = Exclude<T, false | null | 0 | '' | undefined>;

type Order = 'asc' | 'desc';
type Unzip<K extends unknown[]> = { [I in keyof K]: Array<K[I]> };
/**
 * @description 根据提供的相邻元素比较函数对可迭代对象中的元素进行分组。
 *
 * 该函数接收一个可迭代对象和一个比较函数，遍历可迭代对象中的元素，
 * 并根据比较函数的结果将相邻且满足条件的元素归为同一组。最终返回一个生成器，用于逐个产出分组后的子数组。
 *
 * @template T - 可迭代对象中元素的类型。
 * @param {Iterable<T>} items - 要分组的可迭代对象。
 * @param {(item1: T, item2: T) => boolean} shouldBeGrouped - 用于确定两个相邻元素是否应归为同一组的比较函数。
 *   比较函数应返回一个布尔值：
 *   - 如果 `true`，则表示这两个元素应归为同一组；
 *   - 如果 `false`，则表示这两个元素不应归为同一组，应该开始新的组。
 * @yields {T[]} - 一个包含多个子数组的生成器，每个子数组内的元素被认为是“相邻且相等”的。
 *
 * @example
 * // 示例：按数值大小分组
 * const numbers = [1, 2, 3, 5, 6, 7, 9];
 * const groupedNumbers = groupAdjacentBy(numbers, (a, b) => a + 1 === b);
 * console.log([...groupedNumbers]); // [[1, 2, 3], [5, 6, 7], [9]]
 *
 * @example
 * // 示例：按字符串前缀分组
 * const words = ["apple", "app", "apricot", "banana", "berry", "cherry"];
 * const groupedWords = groupAdjacentBy(words, (a, b) => a[0] === b[0]);
 * console.log([...groupedWords]); // [["apple", "app", "apricot"], ["banana", "berry"], ["cherry"]]
 */
function* groupAdjacentBy<T>(items: Iterable<T>, shouldBeGrouped: (item1: T, item2: T) => boolean): Iterable<T[]> {
	let currentGroup: T[] | undefined;
	let last: T | undefined;

	for (const item of items) {
		if (last !== undefined && shouldBeGrouped(last, item)) {
			// 如果当前元素与上一个元素应归为同一组，则将其添加到当前组
			currentGroup!.push(item);
		} else {
			// 否则，如果存在当前组，则产出该组并开始新组
			if (currentGroup) {
				yield currentGroup;
			}
			currentGroup = [item];
		}
		last = item;
	}

	// 最后一个组需要单独处理
	if (currentGroup) {
		yield currentGroup;
	}
}
