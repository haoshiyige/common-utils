/**
 * @description 错误监听回调函数的接口。
 */
export interface ErrorListenerCallback {
  (error: any): void
}

/**
 * @description  取消绑定错误监听的接口。
 */
export interface ErrorListenerUnbind {
  (): void
}

/**
 *
 *  @description 避免对 EventEmitter 的循环依赖，实现其部分接口。
 * */
export class ErrorHandler {
  private unexpectedErrorHandler: (e: any) => void
  private listeners: ErrorListenerCallback[]

  constructor() {
    this.listeners = []

    this.unexpectedErrorHandler = function (e: any) {
      setTimeout(() => {
        if (e.stack) {
          if (ErrorNoTelemetry.isErrorNoTelemetry(e)) {
            throw new ErrorNoTelemetry(e.message + '\n\n' + e.stack)
          }
          throw new Error(e.message + '\n\n' + e.stack)
        }
        throw e
      }, 0)
    }
  }

  /**
   * @description 添加错误监听器。
   * @param listener 错误监听回调函数。
   * @returns 取消绑定错误监听的函数。
   */
  addListener(listener: ErrorListenerCallback): ErrorListenerUnbind {
    this.listeners.push(listener)

    return () => {
      this._removeListener(listener)
    }
  }

  /**
   * @description 触发所有错误监听器。
   * @param e 错误对象。
   */
  private emit(e: any): void {
    this.listeners.forEach(listener => {
      listener(e)
    })
  }

  /**
   * @description 移除错误监听器。
   * @param listener 要移除的错误监听回调函数。
   */
  private _removeListener(listener: ErrorListenerCallback): void {
    this.listeners.splice(this.listeners.indexOf(listener), 1)
  }

  /**
   * @description 设置意外错误处理函数。
   * @param newUnexpectedErrorHandler 新的意外错误处理函数。
   */
  setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void {
    this.unexpectedErrorHandler = newUnexpectedErrorHandler
  }

  /**
   * @description 获取当前的意外错误处理函数。
   * @returns 当前的意外错误处理函数。
   */
  getUnexpectedErrorHandler(): (e: any) => void {
    return this.unexpectedErrorHandler
  }

  /**
   * @description 处理意外错误。
   * @param e 错误对象。
   */
  onUnexpectedError(e: any): void {
    this.unexpectedErrorHandler(e)
    this.emit(e)
  }

  /**
   * @description 处理外部意外错误，不触发监听器。
   * @param e 错误对象。
   */
  onUnexpectedExternalError(e: any): void {
    this.unexpectedErrorHandler(e)
  }
}

/**
 * @description 全局的错误处理器实例。
 */
export const errorHandler = new ErrorHandler()

/**
 * @description 设置新的意外错误处理函数。
 * @param newUnexpectedErrorHandler 新的意外错误处理函数。
 */
export function setUnexpectedErrorHandler(
  newUnexpectedErrorHandler: (e: any) => void
): void {
  errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler)
}

/**
 * @description 检查错误是否为 SIGPIPE 错误。
 * @param e 错误对象。
 * @returns 如果是 SIGPIPE 错误，则返回 true；否则返回 false。
 */
export function isSigPipeError(e: unknown): e is Error {
  if (!e || typeof e !== 'object') {
    return false
  }
  const cast = e as Record<string, string | undefined>
  return cast.code === 'EPIPE' && cast.syscall?.toUpperCase() === 'WRITE'
}

/**
 * @description 处理指示产品存在 bug 的错误。
 * @param e 错误对象。
 */
export function onBugIndicatingError(e: any): undefined {
  errorHandler.onUnexpectedError(e)
  return undefined
}

/**
 * @description 处理意外错误。
 * @param e 错误对象。
 */
export function onUnexpectedError(e: any): undefined {
  // 忽略已取消的 Promise 错误
  if (!isCancellationError(e)) {
    errorHandler.onUnexpectedError(e)
  }
  return undefined
}

/**
 *  @description 处理外部意外错误。
 * @param e 错误对象。
 */
export function onUnexpectedExternalError(e: any): undefined {
  // 忽略已取消的 Promise 错误
  if (!isCancellationError(e)) {
    errorHandler.onUnexpectedExternalError(e)
  }
  return undefined
}

/**
 *  @description 序列化后的错误对象接口。
 */
export interface SerializedError {
  readonly $isError: true
  readonly name: string
  readonly message: string
  readonly stack: string
  readonly noTelemetry: boolean
  readonly cause?: SerializedError
}

/**
 * @description 将错误对象转换为序列化格式。
 * @param error 错误对象。
 * @returns 序列化后的错误对象。
 */
export function transformErrorForSerialization(error: Error): SerializedError
export function transformErrorForSerialization(error: any): any
export function transformErrorForSerialization(error: any): any {
  if (error instanceof Error) {
    // ts-type-error
    const { name, message, cause } = error
    const stack: string = (<any>error).stacktrace || (<any>error).stack
    return {
      $isError: true,
      name,
      message,
      stack,
      noTelemetry: ErrorNoTelemetry.isErrorNoTelemetry(error),
      cause: cause ? transformErrorForSerialization(cause) : undefined
    }
  }

  // 返回原样
  return error
}

/**
 * @description 将序列化的错误对象转换回错误对象。
 * @param data 序列化的错误对象。
 * @returns 转换后的错误对象。
 */
export function transformErrorFromSerialization(data: SerializedError): Error {
  let error: Error
  if (data.noTelemetry) {
    error = new ErrorNoTelemetry()
  } else {
    error = new Error()
    error.name = data.name
  }
  error.message = data.message
  error.stack = data.stack
  if (data.cause) {
    error.cause = transformErrorFromSerialization(data.cause)
  }
  return error
}

/**
 * @description V8 调用站点接口。
 */
export interface V8CallSite {
  getThis(): unknown
  getTypeName(): string | null
  getFunction(): Function | undefined
  getFunctionName(): string | null
  getMethodName(): string | null
  getFileName(): string | null
  getLineNumber(): number | null
  getColumnNumber(): number | null
  getEvalOrigin(): string | undefined
  isToplevel(): boolean
  isEval(): boolean
  isNative(): boolean
  isConstructor(): boolean
  toString(): string
}

const canceledName = 'Canceled'

/**
 *@description 检查给定的错误是否为已取消的 Promise。
 * @param error 错误对象。
 * @returns 如果是已取消的 Promise，则返回 true；否则返回 false。
 */
export function isCancellationError(error: any): boolean {
  if (error instanceof CancellationError) {
    return true
  }
  return (
    error instanceof Error &&
    error.name === canceledName &&
    error.message === canceledName
  )
}

/**
 * @description 表示已取消操作的错误类。
 */
export class CancellationError extends Error {
  constructor() {
    super(canceledName)
    this.name = this.message
  }
}

/**
 * @deprecated 请使用 {@link CancellationError `new CancellationError()`} 替代。
 */
export function canceled(): Error {
  const error = new Error(canceledName)
  error.name = error.message
  return error
}

/**
 * @description 创建非法参数错误。
 * @param name 参数名称。
 * @returns 非法参数错误。
 */
export function illegalArgument(name?: string): Error {
  if (name) {
    return new Error(`非法参数: ${name}`)
  } else {
    return new Error('非法参数')
  }
}

/**
 * @description 创建非法状态错误。
 * @param name 状态名称。
 * @returns 非法状态错误。
 */
export function illegalState(name?: string): Error {
  if (name) {
    return new Error(`非法状态: ${name}`)
  } else {
    return new Error('非法状态')
  }
}

/**
 * @description 表示只读属性错误的类。
 */
export class ReadonlyError extends TypeError {
  constructor(name?: string) {
    super(name ? `${name} 是只读的，不能被修改` : '不能修改只读属性')
  }
}

/**
 * @description 获取错误消息。
 * @param err 错误对象。
 * @returns 错误消息。
 */
export function getErrorMessage(err: any): string {
  if (!err) {
    return '错误'
  }

  if (err.message) {
    return err.message
  }

  if (err.stack) {
    return err.stack.split('\n')[0]
  }

  return String(err)
}

/**
 *@description 表示未实现功能的错误类。
 */
export class NotImplementedError extends Error {
  constructor(message?: string) {
    super('未实现')
    if (message) {
      this.message = message
    }
  }
}

/**
 * @description 表示不支持的功能的错误类。
 */
export class NotSupportedError extends Error {
  constructor(message?: string) {
    super('不支持')
    if (message) {
      this.message = message
    }
  }
}

/**
 * @description 表示预期中的错误。
 */
export class ExpectedError extends Error {
  readonly isExpected = true
}

/**
 *@description 抛出此错误不会在遥测中记录为未处理的错误。
 */
export class ErrorNoTelemetry extends Error {
  override readonly name: string

  constructor(msg?: string) {
    super(msg)
    this.name = 'CodeExpectedError'
  }

  public static fromError(err: Error): ErrorNoTelemetry {
    if (err instanceof ErrorNoTelemetry) {
      return err
    }

    const result = new ErrorNoTelemetry()
    result.message = err.message
    result.stack = err.stack
    return result
  }

  public static isErrorNoTelemetry(err: Error): err is ErrorNoTelemetry {
    return err.name === 'CodeExpectedError'
  }
}

/**
 * @description 表示产品存在 bug 的错误类。不要为此类错误抛出无效的用户输入。只有在捕获此类错误以优雅地恢复时才应捕获此错误。
 */
export class BugIndicatingError extends Error {
  constructor(message?: string) {
    super(message || 'An unexpected bug occurred.' || '发生了一个意外的 bug。')
    Object.setPrototypeOf(this, BugIndicatingError.prototype)
    // 因为我们知道只有有 bug 的代码会抛出此错误，
    // 我们肯定希望在这里中断并修复 bug。
    // debugger;
  }
}
