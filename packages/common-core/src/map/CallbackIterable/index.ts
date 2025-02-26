
import { checkNewCall } from "@nin/shared";



/**
 * When comparing two values,
 * a negative number indicates that the first value is less than the second,
 * a positive number indicates that the first value is greater than the second,
 * and zero indicates that neither is the case.
*/
export type CompareResult = number;

export namespace CompareResult {
    export function isLessThan(result: CompareResult): boolean {
        return result < 0;
    }

    export function isLessThanOrEqual(result: CompareResult): boolean {
        return result <= 0;
    }

    export function isGreaterThan(result: CompareResult): boolean {
        return result > 0;
    }

    export function isNeitherLessOrGreaterThan(result: CompareResult): boolean {
        return result === 0;
    }

    export const greaterThan = 1;
    export const lessThan = -1;
    export const neitherLessOrGreaterThan = 0;
}

/**
 * A comparator `c` defines a total order `<=` on `T` as following:
 * `c(a, b) <= 0` iff `a` <= `b`.
 * We also have `c(a, b) == 0` iff `c(b, a) == 0`.
*/
type Comparator<T> = (a: T, b: T) => CompareResult;
/**
 * 一个用于懒加载数据的可迭代对象，比传统的迭代器和数组更高效。
 *
 * `CallbackIterable` 类允许你通过回调函数的方式遍历数据，而不需要一次性加载所有数据到内存中。
 * 这使得它非常适合处理大规模数据或流式数据，因为它可以在需要时按需生成数据，从而节省内存和提高性能。
 */
@checkNewCall()
export class CallbackIterable<T> {
    /**
     * 一个空的 `CallbackIterable` 实例，表示没有元素的可迭代对象。
     */
    public static readonly empty = new CallbackIterable<never>(_callback => { });

    /**
     * 构造函数，创建一个新的 `CallbackIterable` 实例。
     *
     * @param {function((item: T) => boolean): void} iterate - 一个函数，用于遍历每个元素。
     *   该函数接收一个回调函数 `callback`，对于每个元素，调用 `callback(item)`。
     *   如果 `callback` 返回 `false`，则停止遍历；否则继续遍历下一个元素。
     */
    constructor(
        public readonly iterate: (callback: (item: T) => boolean) => void
    ) { }

    /**
     * 对每个元素执行给定的处理函数。
     *
     * 该方法遍历所有元素，并对每个元素调用 `handler` 函数。`handler` 不需要返回任何值，
     * 遍历会一直进行到所有元素都被处理完。
     *
     * @param {(item: T) => void} handler - 用于处理每个元素的函数。
     */
    forEach(handler: (item: T) => void) {
        this.iterate(item => { handler(item); return true; });
    }

    /**
     * 将所有元素转换为一个数组并返回。
     *
     * 该方法遍历所有元素，并将它们收集到一个数组中，最后返回该数组。
     *
     * @returns {T[]} - 包含所有元素的数组。
     */
    toArray(): T[] {
        const result: T[] = [];
        this.iterate(item => { result.push(item); return true; });
        return result;
    }

    /**
     * 创建一个新的 `CallbackIterable`，其元素是当前可迭代对象中满足给定谓词条件的元素。
     *
     * 该方法返回一个新的 `CallbackIterable`，其中只包含满足 `predicate` 函数的元素。
     *
     * @param {(item: T) => boolean} predicate - 用于筛选元素的谓词函数。
     *   该函数接受一个元素 `item`，并返回一个布尔值。如果返回 `true`，则保留该元素；否则丢弃。
     * @returns {CallbackIterable<T>} - 一个新的 `CallbackIterable`，包含筛选后的元素。
     */
    filter(predicate: (item: T) => boolean): CallbackIterable<T> {
        return new CallbackIterable(cb => this.iterate(item => predicate(item) ? cb(item) : true));
    }

    /**
     * 创建一个新的 `CallbackIterable`，其元素是当前可迭代对象中经过映射函数转换后的结果。
     *
     * 该方法返回一个新的 `CallbackIterable`，其中每个元素都是通过 `mapFn` 函数转换后的结果。
     *
     * @template TResult - 映射后元素的类型。
     * @param {(item: T) => TResult} mapFn - 用于转换每个元素的映射函数。
     *   该函数接受一个元素 `item`，并返回转换后的结果。
     * @returns {CallbackIterable<TResult>} - 一个新的 `CallbackIterable`，包含映射后的元素。
     */
    map<TResult>(mapFn: (item: T) => TResult): CallbackIterable<TResult> {
        return new CallbackIterable<TResult>(cb => this.iterate(item => cb(mapFn(item))));
    }

    /**
     * 检查是否至少有一个元素满足给定的谓词条件。
     *
     * 该方法遍历所有元素，并检查是否有任何一个元素满足 `predicate` 函数。一旦找到满足条件的元素，
     * 立即返回 `true` 并停止遍历；如果遍历完所有元素都没有找到满足条件的元素，则返回 `false`。
     *
     * @param {(item: T) => boolean} predicate - 用于检查元素的谓词函数。
     *   该函数接受一个元素 `item`，并返回一个布尔值。如果返回 `true`，则表示该元素满足条件。
     * @returns {boolean} - 如果至少有一个元素满足条件，返回 `true`；否则返回 `false`。
     */
    some(predicate: (item: T) => boolean): boolean {
        let result = false;
        this.iterate(item => { result = predicate(item); return !result; });
        return result;
    }

    /**
     * 查找第一个满足给定谓词条件的元素。
     *
     * 该方法遍历所有元素，直到找到第一个满足 `predicate` 函数的元素，并返回该元素。
     * 如果遍历完所有元素都没有找到满足条件的元素，则返回 `undefined`。
     *
     * @param {(item: T) => boolean} predicate - 用于检查元素的谓词函数。
     *   该函数接受一个元素 `item`，并返回一个布尔值。如果返回 `true`，则表示该元素满足条件。
     * @returns {T | undefined} - 第一个满足条件的元素，如果没有找到则返回 `undefined`。
     */
    findFirst(predicate: (item: T) => boolean): T | undefined {
        let result: T | undefined;
        this.iterate(item => {
            if (predicate(item)) {
                result = item;
                return false;
            }
            return true;
        });
        return result;
    }

    /**
     * 查找最后一个满足给定谓词条件的元素。
     *
     * 该方法遍历所有元素，并记录最后一个满足 `predicate` 函数的元素。遍历完成后，返回该元素。
     * 如果遍历完所有元素都没有找到满足条件的元素，则返回 `undefined`。
     *
     * @param {(item: T) => boolean} predicate - 用于检查元素的谓词函数。
     *   该函数接受一个元素 `item`，并返回一个布尔值。如果返回 `true`，则表示该元素满足条件。
     * @returns {T | undefined} - 最后一个满足条件的元素，如果没有找到则返回 `undefined`。
     */
    findLast(predicate: (item: T) => boolean): T | undefined {
        let result: T | undefined;
        this.iterate(item => {
            if (predicate(item)) {
                result = item;
            }
            return true;
        });
        return result;
    }

    /**
     * 查找根据比较器确定的最大元素（最后一个最大元素）。
     *
     * 该方法遍历所有元素，并使用 `comparator` 函数比较每个元素。遍历完成后，返回最后一个最大元素。
     * 如果遍历完所有元素都没有找到任何元素，则返回 `undefined`。
     *
     * @param {Comparator<T>} comparator - 用于比较两个元素的比较器函数。
     *   该函数接受两个元素 `a` 和 `b`，并返回一个数字：
     *   - 如果 `a < b`，返回负数；
     *   - 如果 `a === b`，返回 0；
     *   - 如果 `a > b`，返回正数。
     * @returns {T | undefined} - 最后一个最大元素，如果没有找到则返回 `undefined`。
     */
    findLastMaxBy(comparator: Comparator<T>): T | undefined {
        let result: T | undefined;
        let first = true;
        this.iterate(item => {
            if (first || CompareResult.isGreaterThan(comparator(item, result!))) {
                first = false;
                result = item;
            }
            return true;
        });
        return result;
    }
}