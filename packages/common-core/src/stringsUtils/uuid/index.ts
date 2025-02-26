/**
 * @description 匹配 UUID 的正则表达式模式。
 */
const _UUIDPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 *@description  检查给定的字符串是否为有效的 UUID。
 * @param value 要检查的字符串。
 * @returns 如果字符串是有效的 UUID，则返回 true；否则返回 false。
 */
export function isUUID(value: string): boolean {
  return _UUIDPattern.test(value)
}

/**
 * 声明一个全局的 `crypto` 对象，用于生成随机数。
 * - `getRandomValues`: 用于填充数组的随机值。
 * - `randomUUID`: 用于生成随机的 UUID 字符串。
 */
declare const crypto: | undefined | {
  // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues#browser_compatibility
  getRandomValues?(data: Uint8Array): Uint8Array
  // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID#browser_compatibility
  randomUUID?(): string
}

/**
 * @description 生成 UUID 的函数。
 * - 首先尝试使用 `crypto.randomUUID` 方法生成 UUID。
 * - 如果不可用，则使用 `crypto.getRandomValues` 方法生成随机字节数组，并转换为 UUID 格式。
 * - 如果以上方法都不可用，则使用 `Math.random` 方法生成随机字节数组。
 * @returns 生成的 UUID 字符串。
 */
export const generateUuid = (function (): () => string {
  // 使用 `randomUUID` 方法生成 UUID（如果可用）
  if (typeof crypto === 'object' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID.bind(crypto)
  }

  // 使用 `randomValues` 方法生成随机字节数组（如果可用）
  let getRandomValues: (bucket: Uint8Array) => Uint8Array
  if (
    typeof crypto === 'object' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    getRandomValues = crypto.getRandomValues.bind(crypto)
  } else {
    // 使用 `Math.random` 方法生成随机字节数组
    getRandomValues = function (bucket: Uint8Array): Uint8Array {
      for (let i = 0; i < bucket.length; i++) {
        bucket[i] = Math.floor(Math.random() * 256)
      }
      return bucket
    }
  }

  // 准备工作
  const _data = new Uint8Array(16)
  const _hex: string[] = []
  for (let i = 0; i < 256; i++) {
    _hex.push(i.toString(16).padStart(2, '0'))
  }

  /**
   * 生成 UUID 的主函数。
   * @returns 生成的 UUID 字符串。
   */
  return function generateUuid(): string {
    // 获取随机数据
    getRandomValues(_data)

    // 设置版本位
    _data[6] = (_data[6] & 0x0f) | 0x40
    _data[8] = (_data[8] & 0x3f) | 0x80

    // 将数据转换为字符串
    let i = 0
    let result = ''
    result += _hex[_data[i++]]
    result += _hex[_data[i++]]
    result += _hex[_data[i++]]
    result += _hex[_data[i++]]
    result += '-'
    result += _hex[_data[i++]]
    result += _hex[_data[i++]]
    result += '-'
    result += _hex[_data[i++]]
    result += _hex[_data[i++]]
    result += '-'
    result += _hex[_data[i++]]
    result += _hex[_data[i++]]
    result += '-'
    result += _hex[_data[i++]]
    result += _hex[_data[i++]]
    result += _hex[_data[i++]]
    result += _hex[_data[i++]]
    result += _hex[_data[i++]]
    result += _hex[_data[i++]]
    return result
  }
})()
