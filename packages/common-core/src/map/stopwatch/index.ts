
/**
 * 检查全局对象中是否存在 performance.now 方法，并且该方法是否为函数类型。
 */
const hasPerformanceNow = (globalThis.performance && typeof globalThis.performance.now === 'function');

/**
 * @description StopWatch 类用于测量时间间隔，提供了高分辨率的时间测量功能。
 * 它可以根据环境支持自动选择使用 performance.now() 或 Date.now()。
 * 
 * 使用案例：
 * ```typescript
 * // 创建一个新的 StopWatch 实例，默认使用高分辨率时间测量
 * const watch = new StopWatch();
 * watch.stop(); // 停止计时器
 * console.log(watch.elapsed()); // 输出经过的时间
 * 
 * // 重置计时器
 * watch.reset();
 * 
 * // 使用 create 方法创建实例
 * const anotherWatch = StopWatch.create(false); // 不使用高分辨率时间测量
 * ```
 * 
 * 测试案例：
 * ```typescript
 * // 测试高分辨率模式
 * const highResWatch = new StopWatch(true);
 * setTimeout(() => {
 *   highResWatch.stop();
 *   console.log('High Resolution Timer:', highResWatch.elapsed());
 * }, 1000);
 * 
 * // 测试非高分辨率模式
 * const lowResWatch = new StopWatch(false);
 * setTimeout(() => {
 *   lowResWatch.stop();
 *   console.log('Low Resolution Timer:', lowResWatch.elapsed());
 * }, 1000);
 * ```
 * 
 * @params @param highResolution - 可选参数，决定是否使用高分辨率时间测量。默认为 true。
 */
export class StopWatch {
    /**
     * 计时器启动的时间戳。
     * @private
     */
    private _startTime: number;

    /**
     * 计时器停止的时间戳。如果计时器未停止，则值为 -1。
     * @private
     */
    private _stopTime: number;

    /**
     * 获取当前时间戳的方法。根据构造函数中的配置，指向 Date.now 或 performance.now()。
     * @private
     */
    private readonly _now: () => number;

    /**
     * 创建一个新的 StopWatch 实例。
     * @param highResolution - 可选参数，决定是否使用高分辨率时间测量。默认为 true。
     */
    constructor(highResolution: boolean = true) {
        this._now = hasPerformanceNow && highResolution ? globalThis.performance!.now.bind(globalThis.performance) : Date.now;
        this._startTime = this._now();
        this._stopTime = -1;
    }

    /**
     * 静态方法，用于创建一个新的 StopWatch 实例。
     * @param highResolution - 可选参数，决定是否使用高分辨率时间测量。默认为 true。
     * @returns 新创建的 StopWatch 实例。
     */
    public static create(highResolution?: boolean): StopWatch {
        return new StopWatch(highResolution);
    }

    /**
     * 停止计时器，记录当前时间为结束时间。
     */
    public stop(): void {
        this._stopTime = this._now();
    }

    /**
     * 重置计时器，将开始时间设置为当前时间，并清除结束时间。
     */
    public reset(): void {
        this._startTime = this._now();
        this._stopTime = -1;
    }

    /**
     * 计算并返回从计时器启动到现在的经过时间（如果已经调用 stop()，则返回从启动到停止的时间）。
     * @returns 经过的时间，单位为毫秒。
     */
    public elapsed(): number {
        if (this._stopTime !== -1) {
            return this._stopTime - this._startTime;
        }
        return this._now() - this._startTime;
    }
}

// // 测试案例
// console.log("=== 测试高分辨率模式 ===");
// const highResWatch = new StopWatch(true);
// setTimeout(() => {
//     highResWatch.stop();
//     console.log('High Resolution Timer:', highResWatch.elapsed(), 'ms');
// }, 1000);

// console.log("=== 测试非高分辨率模式 ===");
// const lowResWatch = new StopWatch(false);
// setTimeout(() => {
//     lowResWatch.stop();
//     console.log('Low Resolution Timer:', lowResWatch.elapsed(), 'ms');
// }, 1000);

// // 使用案例
// console.log("=== 使用案例 ===");
// const watch = StopWatch.create();
// setTimeout(() => {
//     watch.stop();
//     console.log('Timer elapsed:', watch.elapsed(), 'ms');
// }, 500);