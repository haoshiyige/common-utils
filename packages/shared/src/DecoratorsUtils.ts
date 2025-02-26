
/**
* 检查当前环境是否支持 `new.target` 特性。
* 
* @returns {boolean} 如果支持 `new.target` 返回 `true`，否则返回 `false`。
*/
const supportsNewTarget = (() => {
    try {
        // 使用 eval 来尝试访问 new.target
        // eslint-disable-next-line no-new-func
        return Function('"use strict"; return new.target;')() === undefined;
    } catch (e) {
        return false;
    }
})();
/**
 * 创建一个装饰器函数，用于检查构造函数是否通过 `new` 关键字调用。
 * 
 * 如果构造函数没有通过 `new` 调用，则记录自定义类型的错误，并在错误信息中包含构造器的名字和自定义消息；
 * 如果通过 `new` 调用，则继续执行并打印调试信息。
 * 
 * 此装饰器首先检测当前环境是否支持 `new.target` 特性，如果支持则使用 `new.target` 检测是否通过 `new` 调用，
 * 否则回退到使用 `this instanceof constructor` 方法进行兼容性处理。
 * 
 * 使用方法：
 * 1. 默认设置：@checkNewCall()
 *    - 应用此装饰器后，尝试使用 `new` 和不使用 `new` 调用构造函数。
 * 2. 自定义设置：@checkNewCall({ customErrorType: CustomError, customMessage: 'requires the use of "new" keyword' })
 *    - 可以传递自定义错误类型和消息来增强错误报告。
 * 
 * 测试案例：
 * 1. 使用默认设置：
 *    ```typescript
 *    @checkNewCall()
 *    class SafeExampleDefault {
 *      constructor() {
 *        console.log('SafeExample instance created with default settings');
 *      }
 *    }
 *    ```
 *    - 使用 `new` 调用：应正常实例化对象并输出 "Function was called with new" 和 "SafeExample instance created with default settings"
 *    - 不使用 `new` 调用：应记录错误 "TypeError: Constructor SafeExampleDefault must be called with new"
 * 
 * 2. 自定义错误类型和消息：
 *    ```typescript
 *    @checkNewCall({ customErrorType: CustomError, customMessage: 'requires the use of "new" keyword' })
 *    class SafeExampleCustom {
 *      constructor() {
 *        console.log('SafeExample instance created with custom settings');
 *      }
 *    }
 *    ```
 *    - 使用 `new` 调用：应正常实例化对象并输出 "Function was called with new" 和 "SafeExample instance created with custom settings"
 *    - 不使用 `new` 调用：应记录错误 "CustomError: Constructor SafeExampleCustom requires the use of "new" keyword"
 * 
 * @param {Object} options - 配置选项，包括自定义错误类型和自定义错误消息。
 * @param {new (message?: string) => Error} [options.customErrorType] - 自定义错误类型，默认为 `TypeError`。
 * @param {string} [options.customMessage] - 自定义错误消息，默认为 `'must be called with new'`。
 * @returns {Function} 返回一个装饰器函数，该函数接收一个构造函数并返回一个新的构造函数。
 */
export function checkNewCall(options?: { customErrorType?: new (message?: string) => Error, customMessage?: string }): Function {
    /**
     * 装饰器实现，用于增强传入的构造函数。
     * 
     * @template T 构造函数类型
     * @param {T} constructor - 目标构造函数
     * @returns {T} 返回一个新的构造函数，该构造函数会在实例化时检查是否通过 `new` 调用。
     */
    return function <T extends new (...args: any[]) => any>(constructor: T): T {
        // 获取构造函数的名字
        const constructorName = constructor.name || 'AnonymousClass';
        const CustomError = options?.customErrorType || TypeError;
        const message = options?.customMessage || 'must be called with new';
        return class extends constructor {
            /**
             * 新的构造函数，用于检查是否通过 `new` 调用。
             * 
             * @param {...any[]} args - 传递给原构造函数的参数。
             */
            constructor(...args: any[]) {
                super(...args);
                if (supportsNewTarget) {
                    // 如果支持 new.target
                    if (new.target === undefined) {
                        console.error(new CustomError(`Constructor ${constructorName} ${message}`));
                    }
                } else {
                    // 如果不支持 new.target，使用 this instanceof constructor 检测
                    const isConstructorCalledWithNew = this instanceof constructor;
                    if (!isConstructorCalledWithNew) {
                        console.error(new CustomError(`Constructor ${constructorName} ${message}`));
                    }
                }
            }
        };
    };
}