import { isNull, isFunction } from '@nin/shared'
/**
 * @description FunctionUtils 是一个工具类，提供了用于在函数中查找元素的各种静态和实例方法。
 * 它包括查找最后一个满足条件的元素、第一个满足条件的元素、使用二分查找查找单调性条件下的元素，
 * 以及查找最大值、最小值及其索引等功能。
 * @template T - 数组中元素的类型。
 */
export class FunctionUtils<T> {
    /**
     * 返回一个获取对象属性的函数。
     *
     * @param name - 属性名。
     * @param defs - 当对象为空（null 或 undefined）时的默认返回值。此参数可选，默认为 undefined。
     * @returns 一个函数，该函数接收一个对象并返回指定属性的值；如果对象为空且未提供默认值，则返回 undefined。
     *
     * 示例:
     * ```typescript
     * const getName = property('name');
     * const obj = { id: 1, name: 'Example' };
     * console.log(getName(obj)); // 输出: 'Example'
     * console.log(getName(null)); // 输出: undefined
     *
     * const getWithNameDefault = property('name', 'defaultName');
     * console.log(getWithNameDefault(null)); // 输出: 'defaultName'
     * ```
     */

    static property<T>(name: string, defs?: T): (obj: any) => T | undefined {
        return function (obj: any): T | undefined {
            return isNull(obj) ? defs : obj[name]
        }
    }

    /**
     * 倒计时-常用于短信验证码倒计时
     *
     * 此函数创建一个倒计时定时器，可以用来显示剩余时间，并在倒计时结束时通知。
     * 它提供了暂停和重置的功能。
     *
     * @param totalTime 总时间，默认60秒
     * @param speed 速度，默认1000毫秒（即每秒更新一次）
     * @param runFun 每次运行调用的函数，接收当前剩余时间和状态对象作为参数
     * @returns 返回一个对象，包含暂停和重置倒计时的方法
     *
     * @example
     * // 测试案例
     * const cd = countDown({ totalTime: 5, runFun: (remainingTime, state) => console.log(remainingTime, state.state) });
     * setTimeout(() => cd.pause(), 2500); // 在2.5秒后暂停
     * setTimeout(() => cd.reset(), 4000); // 在4秒后重置
     *
     * // 错误案例
     * countDown({ totalTime: -1, runFun: () => {} }); // 抛出异常：Total time must be positive.
     * countDown({ speed: 0, runFun: () => {} }); // 抛出异常：Speed must be greater than 0.
     */
    static countDown = ({ totalTime = 60, speed = 1000, runFun }: { totalTime?: number, speed?: number, runFun?: (remainingTime: number, state: { state: string }) => void }) => {
        if (totalTime <= 0) {
            throw new Error('Total time must be positive.')
        }
        if (speed <= 0) {
            throw new Error('Speed must be greater than 0.')
        }

        let STATE = 'start' // 运行状态
        let currentTimer = totalTime
        const notifyRunFun = () => {
            if (isFunction(runFun)) {
                runFun(currentTimer, { state: STATE })
            }
        }
        const timerFun = () => {
            currentTimer--
            if (!currentTimer) {
                clearInterval(timer)
                STATE = 'finish'
            }
            notifyRunFun()
        }
        let timer = setInterval(timerFun, speed)
        // 默认先执行一次
        notifyRunFun()
        return {
            // 暂停
            pause() {
                STATE = 'pause'
                clearInterval(timer)
                notifyRunFun()
            },

            // 重置
            reset() {
                STATE = 'start'
                clearInterval(timer)
                currentTimer = totalTime
                timer = setInterval(timerFun, speed)
                notifyRunFun()
            }
        }
    }

    // // 测试案例
    // const cd = countDown({ totalTime: 5, runFun: (remainingTime, state) => console.log(`${remainingTime} seconds remaining, state: ${state.state}`) });
    // setTimeout(() => cd.pause(), 2500); // 在2.5秒后暂停
    // setTimeout(() => cd.reset(), 4000); // 在4秒后重置

    // // 错误案例演示
    // try {
    //     countDown({ totalTime: -1, runFun: () => {} });
    // } catch (e) {
    //     console.error(e.message); // Total time must be positive.
    // }

    // try {
    //     countDown({ speed: 0, runFun: () => {} });
    // } catch (e) {
    //     console.error(e.message); // Speed must be greater than 0.
    // }
    /**
     * 创建一个只能调用一次的函数，只会返回第一次执行后的结果。
     *
     * @param {Function} callback - 要包装的函数。
     * @param {Object | undefined} context - 执行回调函数时的上下文（即 `this` 的值）。
     * @param {...any} args - 额外的参数，这些参数会在调用回调函数时附加到最后。
     * @returns {Function} 返回一个新的函数，该函数只能被调用一次。
     *
     * 示例:
     * ```typescript
     * const sayHelloOnce = once(function (greeting: string, name: string) {
     *   console.log(`${greeting}, ${name}`);
     * }, null, 'Hello');
     *
     * sayHelloOnce('Alice'); // 输出: "Hello, Alice"
     * sayHelloOnce('Bob');   // 没有输出，因为函数已经调用过一次
     * ```
     */

    static once<T extends (...args: any[]) => any>(
        callback: T,
        context?: any,
        ...args: any[]
    ): (...args: Parameters<T>) => ReturnType<T> {
        let done = false
        let result: ReturnType<T>
        return function (...innerArgs: Parameters<T>): ReturnType<T> {
            if (done) {
                return result
            }
            // 合并预先提供的参数与新传入的参数
            const allArgs = args.concat(innerArgs)
            result = callback.apply(context, allArgs)
            done = true
            return result
        }
    }

    /**
     * 创建一个函数，在调用次数不超过 count 次之前执行回调并将所有结果记住后返回。
     *
     * @param {number} count - 最大允许调用次数（不包括最后一次）。
     * @param {Function} callback - 每次调用时执行的回调函数。
     * @param {Object | undefined} context - 执行回调函数时的上下文（即 `this` 的值）。
     * @returns {Function} 返回一个新的函数，该函数最多可以被调用 `count` 次。
     *
     * 示例:
     * ```typescript
     * const logBefore = before(3, function(results, arg) {
     *   console.log('Current results:', results, 'Argument:', arg);
     * });
     *
     * logBefore('a'); // 输出: "Current results: ['a'] Argument: a"
     * logBefore('b'); // 输出: "Current results: ['a', 'b'] Argument: b"
     * logBefore('c'); // 不会触发回调，因为已经调用了 3 次
     * ```
     */

    static before<T extends (...args: any[]) => any>(
        count: number,
        callback: T,
        context?: any
    ): (...args: Parameters<T>) => void {
        let runCount = 0
        let rests: any[] = []

        return function (...args: Parameters<T>): void {
            runCount++
            if (runCount < count) {
                rests.push(...args) // 记录所有传入的参数
                callback.apply(context, [rests].concat(Array.prototype.slice.call(args)))
            }
        }
    }

    /**
     * 创建一个函数，在调用次数超过 count 次之后执行回调并将所有结果记住后返回。
     *
     * @param {number} count - 需要超过的调用次数。
     * @param {Function} callback - 达到指定调用次数后执行的回调函数。
     * @param {Object | undefined} context - 执行回调函数时的上下文（即 `this` 的值）。
     * @returns {Function} 返回一个新的函数，该函数在调用次数超过 `count` 后执行回调。
     *
     * 示例:
     * ```typescript
     * const logAfter = after(3, function(results) {
     *   console.log('Final results:', results);
     * });
     *
     * logAfter('a'); // 记录 'a'
     * logAfter('b'); // 记录 'b'
     * logAfter('c'); // 输出: "Final results: ['a', 'b', 'c']"
     * ```
     */

    static after<T extends (...args: any[]) => any>(
        count: number,
        callback: T,
        context?: any
    ): (...args: Parameters<T>) => void {
        let runCount = 0
        let rests: any[] = []
        return function (...args: Parameters<T>): void {
            runCount++
            if (runCount <= count) {
                rests = rests.concat(...args)
            }
            if (runCount >= count) {
                callback.apply(context, [rests].concat(Array.prototype.slice.call(args)))
            }
        }
    }

    /**
     * 节流函数；当被调用 n 毫秒后才会执行，如果在这时间内又被调用则至少每隔 n 秒毫秒调用一次该函数。
     *
     * @param {(...args: any[]) => void} callback - 回调函数。
     * @param {number} wait - 等待时间（毫秒）。
     * @param {{leading?: boolean, trailing?: boolean}} options - 配置项：`leading` 表示是否在开始时立即执行，`trailing` 表示是否在结束时执行。
     * @returns {Function} 返回一个节流后的函数。
     *
     * 示例:
     * ```typescript
     * const throttledLog = throttle(function(text) {
     *   console.log(text);
     * }, 1000, { leading: true, trailing: true });
     *
     * throttledLog('Hello'); // 立即输出 "Hello"
     * throttledLog('World'); // 1秒后输出 "World"
     * ```
     */
    static throttle<T extends (...args: any[]) => void>(
        callback: T,
        wait: number,
        options: { leading?: boolean; trailing?: boolean } = {}
    ): (...args: Parameters<T>) => void {
        let lastArgs: Parameters<T> | null = null
        let lastContext: any = null
        let timeoutId: ReturnType<typeof setTimeout> | null = null
        let previousTime = 0
        const { leading = true, trailing = true } = options
        const invokeCallback = () => {
            if (!lastArgs) return
            const now = Date.now()
            const remainingTime = wait - (now - previousTime)
            if (remainingTime <= 0) {
                // 修正了这里的拼写错误
                if (timeoutId) {
                    clearTimeout(timeoutId)
                    timeoutId = null
                }
                previousTime = now
                callback.apply(lastContext, lastArgs)
                lastArgs = null
                lastContext = null
            } else if (!timeoutId && trailing) {
                timeoutId = setTimeout(() => {
                    previousTime = !leading ? 0 : Date.now() // 这里的逻辑可能不需要调整previousTime为0
                    timeoutId = null
                    // @ts-ignore
                    callback.apply(lastContext, lastArgs)
                    lastArgs = null
                    lastContext = null
                }, remainingTime)
            }
        }
        const throttled = (...args: Parameters<T>): void => {
            lastArgs = args
            lastContext = this
            const now = Date.now()
            if (!previousTime && !leading) {
                previousTime = now
            }
            const remainingTime = wait - (now - previousTime)
            if (remainingTime <= 0) {
                if (timeoutId) {
                    clearTimeout(timeoutId)
                    timeoutId = null
                }
                previousTime = now
                callback.apply(lastContext, lastArgs)
                lastArgs = null
                lastContext = null
            } else if (!timeoutId && trailing) {
                timeoutId = setTimeout(invokeCallback, remainingTime)
            }
        }
        throttled.cancel = (): void => {
            if (timeoutId) {
                clearTimeout(timeoutId)
                timeoutId = null
            }
            previousTime = 0
            lastArgs = null
            lastContext = null
        }
        return throttled
    }

    /**
     * 函数去抖；当被调用 n 毫秒后才会执行，如果在这时间内又被调用则将重新计算执行时间。
     *
     * @param {(...args: any[]) => void} callback - 回调函数。
     * @param {number} wait - 等待时间（毫秒）。
     * @param {{leading?: boolean, trailing?: boolean}} options - 配置项：`leading` 表示是否在开始时立即执行，`trailing` 表示是否在结束时执行。
     * @returns {Function} 返回一个去抖后的函数。
     *
     * 示例:
     * ```typescript
     * const debouncedLog = debounce(function(text) {
     *   console.log(text);
     * }, 1000, { leading: true, trailing: true });
     *
     * debouncedLog('Hello'); // 立即输出 "Hello"
     * debouncedLog('World'); // 如果在1秒内再次调用，则不会立即输出，而是在最后一次调用后1秒输出 "World"
     * ```
     */

    static debounce<T extends (...args: any[]) => void>(
        callback: T,
        wait: number,
        options: { leading?: boolean; trailing?: boolean } = {}
    ): (...args: Parameters<T>) => void {
        let timeout: ReturnType<typeof setTimeout> | null = null
        let lastArgs: Parameters<T> | null = null
        let lastContext: any = null
        let result: any
        const { leading = false, trailing = true } = options
        const later = () => {
            const callNow = !trailing && lastArgs
            if (callNow) {
                callback.apply(lastContext, lastArgs!)
                lastArgs = lastContext = null
            } else if (lastArgs) {
                result = callback.apply(lastContext, lastArgs)
                lastArgs = lastContext = null
            }
        }
        const debounced = (...args: Parameters<T>): any => {
            lastArgs = args
            lastContext = this
            const callNow = leading && !timeout
            if (timeout) {
                clearTimeout(timeout)
            }
            timeout = setTimeout(later, wait)
            if (callNow) {
                result = callback.apply(lastContext, lastArgs)
                lastArgs = lastContext = null
            }
            return result
        }
        debounced.cancel = () => {
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }
            lastArgs = lastContext = null
        }
        debounced.flush = () => {
            if (timeout) {
                later()
                timeout = null
            }
        }
        return debounced
    }


    /**
     * 创建一个函数，该函数对 `func` 的结果进行记忆化。如果提供了 `resolver`，
     * 它将根据传递给记忆化函数的参数确定用于存储结果的缓存键。默认情况下，
     * 传递给记忆化函数的第一个参数用作映射缓存键。`func` 将以记忆化函数的 `this` 绑定被调用。
     *
     * **注意：** 缓存作为记忆化函数的 `cache` 属性暴露出来。可以通过替换 `memoize.Cache`
     * 构造函数来定制其创建，替换为实现
     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
     * 方法接口（包括 `clear`, `delete`, `get`, `has`, 和 `set`）的实例。
     *
     * @since 0.1.0
     * @category 函数
     * @param {Function} func 要对其输出进行记忆化的函数。
     * @param {Function} [resolver] 用于解析缓存键的函数。
     * @returns {Function} 返回新的记忆化函数。
     * @example
     *
     * const object = { 'a': 1, 'b': 2 }
     * const other = { 'c': 3, 'd': 4 }
     *
     * const values = memoize(values)
     * values(object)
     * // => [1, 2]
     *
     * values(other)
     * // => [3, 4]
     *
     * object.a = 2
     * values(object)
     * // => [1, 2]  // 注意：这里的结果不会更新，因为缓存未失效
     *
     * // 修改结果缓存。
     * values.cache.set(object, ['a', 'b'])
     * values(object)
     * // => ['a', 'b']
     *
     * // 替换 `memoize.Cache`。
     * memoize.Cache = WeakMap
     */
    static {
        // @ts-ignore
        FunctionUtils.memoize.Cache = Map;
    }
    static memoize<T extends (...args: any[]) => any>(func: T, resolver?: (...args: Parameters<T>) => any): T & { cache: Map<any, ReturnType<T>> } {

        if (isFunction(func)) {
            throw new TypeError('Expected the first argument to be a function');
        }
        if (isFunction(resolver)) {
            throw new TypeError('Expected the second argument to be a function or undefined');
        }
        // @ts-ignore
        const cache = new (FunctionUtils.memoize.Cache || Map)();
        const memoized = function (...args: Parameters<T>): ReturnType<T> {
            // @ts-ignore
            const key = resolver ? resolver.apply(this, args) : args[0];
            if (cache.has(key)) {
                return cache.get(key) as ReturnType<T>;
            }
            // @ts-ignore
            const result = func.apply(this, args);
            cache.set(key, result);
            return result;
        } as T & { cache: Map<any, ReturnType<T>> };

        memoized.cache = cache;
        return memoized;
    }


    /**
     * 将Promise返回和异步函数组合到可重用的管道中。
     * @param {function} list 函数（function）集合。
     * @returns {Promise} 待执行函数（闭包Promise）。
     * @see {@link https://hyhello.github.io/utils/#/pipe 在线文档}
     */
    static pipe<T extends any[]>(...list: Array<(...args: T) => Promise<any>>) {
        return async (...args: T) => {
            let currentInput;
            for (const func of list) {
                currentInput = await func(...args);
            }
            return currentInput;
        };
    }


    /**
     * 函数柯里化
     * @param func 执行函数。
     * @param args 函数（func）参数集合。
     * @returns 待执行函数
     * @see {@link https://hyhello.github.io/utils/#/curry 在线文档}
     */
    static curry<T extends any[], R>(func: IFunc<T, R>, ...args: T[number][]): ICallback<T[number]> {
        return function (...params) {
            const argu = [...args, ...params];
            if (func.length > argu.length) {
                return FunctionUtils.curry<T, R>(func, ...argu);
            } else {
                return func(...(argu as T));
            }
        };
    }
    /**
     * 缓存函数，参考的vue中的cached方法。
     * @param key 待缓存的字符串。
     * @returns 新的函数。
     * @see {@link https://hyhello.github.io/utils/#/cacheFn 在线文档}
     */
    // 参考了vue2.0的 cached方法。
    // eslint-disable-next-line @typescript-eslint/ban-types
    static cacheFn(fn: Function): Function {
        const cache = Object.create(null);
        return function (key: string) {
            return cache[key] || (cache[key] = fn(key));
        };
    }
    /**
     * noop方法。
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    static noop(): void { }



    /**
     * 将给定的键和值数组组合成一个对象。
     * 
     * @param keys 键的数组。
     * @param values 值的数组，长度应与键数组相同。
     * @returns 由键值对组成的对象。
     * 
     * 示例：
     * // 正常情况
     * const result = createObject(['a', 'b'], [1, 2]);
     * console.log(result); // 输出: { a: 1, b: 2 }
     * 
     * // 如果键和值的数量不匹配，则只使用最小数量的键或值
     * const resultMismatch = createObject(['a', 'b', 'c'], [1, 2]);
     * console.log(resultMismatch); // 输出: { a: 1, b: 2 }
     */
    static combine<T>(keys: string[], values: T[]): Record<string, T> {
        const ret: Record<string, T> = {};
        for (let i = 0, len = Math.min(keys.length, values.length); i < len; i++) {
            ret[keys[i]] = values[i];
        }
        return ret;
    }
    /**
     * Invokes `func` after `wait` milliseconds. Any additional arguments are
     * provided to `func` when it's invoked.
     *
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay invocation.
     * @param {...*} [args] The arguments to invoke `func` with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * delay(text => console.log(text), 1000, 'later')
     * // => Logs 'later' after one second.
     */
    static delay(func: Function, wait: number, ...args: any[]) {
        if (isFunction(func)) {
            throw new TypeError('Expected a function');
        }
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return setTimeout(func, +wait || 0, ...args);
    }




}
// eslint-disable-next-line @typescript-eslint/ban-types
type IFunc<T extends unknown[], R> = (this: unknown, ...args: T) => R;

type ICallback<T> = (this: unknown, ...args: T[]) => any;