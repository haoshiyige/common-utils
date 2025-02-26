import { isArray } from '@nin/shared'
import { ExploreProps, ExploreName } from '../../types/index.d'

export class WebUtils {
  /**
   * 获取浏览器类型和版本。
   *
   * @returns {string} 返回浏览器类型及其版本号。如果无法识别，则返回 "Unknown"。
   *
   * 示例:
   * ```typescript
   * console.log(WebUtils.getExplore()); // 可能输出: "Chrome: 98.0.4758.102"
   * ```
   */

  static getExplore(): object {
    let platform: ExploreName = 'Unkonwn'
    let version = '0'
    const ua = navigator.userAgent.toLowerCase()

    const ieReg = /msie ([\d.]+)/
    const edgeReg = /edge\/([\d.]+)/
    const firefoxReg = /firefox\/([\d.]+)/
    const operaReg = /(?:opera|opr).([\d.]+)/
    const chromeReg = /chrome\/([\d.]+)/
    const safariReg = /version\/([\d.]+).*safari/

    if (ieReg.test(ua)) {
      platform = 'IE'
      version = (<string[]>ua.match(ieReg))[1]
    } else if (edgeReg.test(ua)) {
      platform = 'Edge'
      version = (<string[]>ua.match(edgeReg))[1]
    } else if (firefoxReg.test(ua)) {
      platform = 'Firefox'
      version = (<string[]>ua.match(firefoxReg))[1]
    } else if (operaReg.test(ua)) {
      platform = 'Opera'
      version = (<string[]>ua.match(operaReg))[1]
    } else if (chromeReg.test(ua)) {
      platform = 'Chrome'
      version = (<string[]>ua.match(chromeReg))[1]
    } else if (safariReg.test(ua)) {
      platform = 'Safari'
      version = (<string[]>ua.match(safariReg))[1]
    }

    return {
      platform,
      version
    }
  }

  /**
   * 获取操作系统类型。
   *
   * @returns {string} 返回操作系统类型。如果无法识别，则返回空字符串。
   *
   * 示例:
   * ```typescript
   * console.log(WebUtils.getOS()); // 可能输出: "ios", "android", "windowsPhone", "MacOSX", "windows", 或 "linux"
   * ```
   */

  static getOS(): string {
    const userAgent = 'navigator' in window && 'userAgent' in navigator ? navigator.userAgent.toLowerCase() : ''
    const vendor = 'navigator' in window && 'vendor' in navigator ? navigator.vendor.toLowerCase() : ''
    const appVersion = 'navigator' in window && 'appVersion' in navigator ? navigator.appVersion.toLowerCase() : ''
    if (/iphone/i.test(userAgent) || /ipad/i.test(userAgent) || /ipod/i.test(userAgent)) return 'ios'
    if (/android/i.test(userAgent)) return 'android'
    if (/win/i.test(appVersion) && /phone/i.test(userAgent)) return 'windowsPhone'
    if (/mac/i.test(appVersion)) return 'MacOSX'
    if (/win/i.test(appVersion)) return 'windows'
    if (/linux/i.test(appVersion)) return 'linux'
    return ''
  }

  /**
   * @description 版本号比较大小
   * @param version1 版本号1
   * @param version2 版本号2
   * @returns 比较的结果 -1 | 0 | 1 分别标识小于|等于|大于
   */
  static versionCompare = (version1: string | number, version2: string | number): number | undefined => {
    const v1 = version1.toString()
    const v2 = version2.toString()
    const GTR = 1 // 大于
    const LSS = -1 // 小于
    const EQU = 0 // 等于
    const v1arr = String(v1)
      .split('.')
      .map(function (a) {
        return parseInt(a)
      })
    const v2arr = String(v2)
      .split('.')
      .map(function (a) {
        return parseInt(a)
      })
    const arrLen = Math.max(v1arr.length, v2arr.length)
    let result

    // 排除错误调用
    if (v1 == undefined || v2 == undefined) {
      throw new Error()
    }

    // 检查空字符串，任何非空字符串都大于空字符串
    if (v1.length == 0 && v2.length == 0) {
      return EQU
    } else if (v1.length == 0) {
      return LSS
    } else if (v2.length == 0) {
      return GTR
    }

    // 循环比较版本号
    for (let i = 0; i < arrLen; i++) {
      result = getResult(v1arr[i], v2arr[i])
      if (result == EQU) {
        continue
      } else {
        break
      }
    }
    return result

    function getResult(n1: number, n2: number) {
      if (typeof n1 != 'number') {
        n1 = 0
      }
      if (typeof n2 != 'number') {
        n2 = 0
      }
      if (n1 > n2) {
        return GTR
      } else if (n1 < n2) {
        return LSS
      } else {
        return EQU
      }
    }
  }

  /**
   * 将对象作为参数添加到URL。
   *
   * @param baseUrl - 基础URL。
   * @param obj - 需要添加到URL的参数对象。
   * @returns {string} 返回带有参数的新URL。
   *
   * 示例:
   * ```typescript
   * const obj = {a: '3', b: '4'};
   * console.log(setObjToUrlParams('www.baidu.com', obj));
   * // 输出: "www.baidu.com?a=3&b=4"
   * ```
   */
  static setObjToUrlParams(baseUrl: string, obj: { [key: string]: any }): string {
    let parameters = ''
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        parameters += `${key}=${encodeURIComponent(obj[key])}&`
      }
    }
    // 移除最后一个多余的 '&'
    parameters = parameters.replace(/&$/, '')
    // 如果baseUrl以 '?' 结尾，则直接连接参数；否则检查并添加 '?' 或 '&'
    return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters
  }

  /**
   * 获取URL中的查询参数。
   *
   * 此函数可以从指定的URL或当前页面的URL中提取查询参数，并返回特定参数的值或所有参数的键值对对象。
   *
   * @param url - 目标地址，默认为当前地址栏URL。
   * @param name - 要获取的参数名称（可选）。如果提供了此参数，则返回该参数的值；否则，返回包含所有参数的键值对对象。
   * @returns 如果`name`不为空，则返回对应的查询参数值；否则，返回一个包含所有查询参数及其值的对象。
   *
   * @example
   * // 测试案例
   * console.log(getUrlParams('http://example.com/?id=123&name=test', 'name')); // "test"
   * console.log(getUrlParams('http://example.com/?id=123&name=test')); // { id: "123", name: "test" }
   * console.log(getUrlParams()); // 返回当前页面的所有查询参数
   *
   * // 错误案例
   * console.log(getUrlParams('http://example.com/#hash')); // {}
   * console.log(getUrlParams('http://example.com/', 'nonexistent')); // undefined
   */
  static getUrlParams = (url: string = window?.location.href, name?: string): string | Record<string, string> => {
    if (!url) {
      throw new Error('Invalid URL provided.')
    }

    const jsonMaps: Record<string, string> = {}
    const queryString: string | undefined = url.split('?')[1]

    if (!queryString) return jsonMaps // 如果没有查询字符串，返回空对象

    queryString.split('&').forEach(keyVal => {
      const [key, value] = keyVal.split('=')
      if (key) jsonMaps[decodeURIComponent(key)] = decodeURIComponent(value || '')
    })

    if (name) {
      // @ts-ignore
      return jsonMaps[name] !== undefined ? jsonMaps[name] : undefined
    }

    return jsonMaps
  }

  /**
   * 将查询字符串解析为对象。
   *
   * 此函数接受一个查询字符串，并将其转换为包含键值对的对象。支持以`?`开头或不带`?`的查询字符串。
   *
   * @param queryString - 查询字符串，例如：`?name=Bob&age=24` 或者 `name=Bob&age=24`。
   * @returns 返回一个对象，例如：`{ name: 'Bob', age: '24' }`。
   *
   * @example
   * // 测试案例
   * console.log(parseQuery('?name=Bob&age=24')); // { name: "Bob", age: "24" }
   * console.log(parseQuery('name=Bob&age=24')); // { name: "Bob", age: "24" }
   * console.log(parseQuery('')); // {}
   * console.log(parseQuery('?')); // {}
   *
   * // 错误案例
   * console.log(parseQuery(null)); // {}
   * console.log(parseQuery(undefined)); // {}
   * console.log(parseQuery(123 as any)); // 抛出异常：Invalid query string provided.
   */
  static parseQuery(queryString: string): Record<string, string> {
    if (!queryString || typeof queryString !== 'string') {
      throw new Error('Invalid query string provided.')
    }
    const str = queryString.startsWith('?') ? queryString.slice(1) : queryString
    const jsonMaps: Record<string, string> = {}

    if (!str) return jsonMaps // 如果没有有效的查询字符串，返回空对象

    str.split('&').forEach(keyValue => {
      const [key, value] = keyValue.split('=')
      if (key) {
        jsonMaps[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ''
      }
    })

    return jsonMaps
  }

  /**
   * @description 格式化对象为queryString
   * @param query query对象 例如：{ name: 'Bob', age: 24 }
   * @returns queryString 例如：'name=Bob&age=24'
   */
  static stringifyQuery(query: Record<string, string> = {}, needEncodeURIComponent = true): string {
    if (!query || typeof query !== 'object' || isArray(query)) {
      return ''
    }
    return Object.entries(query)
      .map(([key, value]) => `${key}=${needEncodeURIComponent ? encodeURIComponent(value) : value}`)
      .join('&')
  }
  /**
   * @description 删除url中指定名称的query参数
   * @param url 目标url
   * @param keys 要删除的query参数，例如：deleteUrlParams('name') 或者 deleteUrlParams(['name', 'age'])
   * @returns 返回删除目标query参数后的字符串
   */
  static deleteUrlParams(url: string = window?.location.href, keys: string[] | string = []): string {
    const [hostAndPath, queryString = ''] = url.split('?')
    const queryObj = WebUtils.parseQuery(queryString)

    if (typeof keys === 'string') {
      Reflect.deleteProperty(queryObj, keys)
    } else if (isArray(keys)) {
      keys.forEach((key: string) => {
        Reflect.deleteProperty(queryObj, key)
      })
    } else {
      return url
    }

    return `${hostAndPath}${WebUtils.stringifyQuery(queryObj) ? '?' + WebUtils.stringifyQuery(queryObj) : ''}`
  }
}
//   // 测试案例
//   console.log(parseQuery('?name=Bob&age=24')); // { name: "Bob", age: "24" }
//   console.log(parseQuery('name=Bob&age=24')); // { name: "Bob", age: "24" }
//   console.log(parseQuery('')); // {}
//   console.log(parseQuery('?')); // {}

//   // 错误案例演示
//   try {
//     console.log(parseQuery(null as any)); // 抛出异常：Invalid query string provided.
//   } catch (e) {
//     console.error(e.message); // Invalid query string provided.
//   }

//   try {
//     console.log(parseQuery(undefined as any)); // 抛出异常：Invalid query string provided.
//   } catch (e) {
//     console.error(e.message); // Invalid query string provided.
//   }

//   try {
//     console.log(parseQuery(123 as any)); // 抛出异常：Invalid query string provided.
//   } catch (e) {
//     console.error(e.message); // Invalid query string provided.
//   }

// // 测试案例
// console.log(getUrlParams('http://example.com/?id=123&name=test', 'name')); // "test"
// console.log(getUrlParams('http://example.com/?id=123&name=test')); // { id: "123", name: "test" }
// console.log(getUrlParams()); // 返回当前页面的所有查询参数

// // 错误案例演示
// try {
//   console.log(getUrlParams('http://example.com/#hash')); // {}
// } catch (e) {
//   console.error(e.message); // 不会抛出异常，但返回空对象
// }

// try {
//   console.log(getUrlParams('', 'nonexistent')); // 抛出异常：Invalid URL provided.
// } catch (e) {
//   console.error(e.message); // Invalid URL provided.
// }

// try {
//   console.log(getUrlParams('http://example.com/', 'nonexistent')); // undefined
// } catch (e) {
//   console.error(e.message);
// }
// const obj = {a: '3', b: '4'};
// console.log(setObjToUrlParams('www.baidu.com', obj));
// // 输出: "www.baidu.com?a=3&b=4"

// console.log(setObjToUrlParams('www.baidu.com?', obj));
// // 输出: "www.baidu.com?a=3&b=4"

// console.log(setObjToUrlParams('www.baidu.com/path/', obj));
// // 输出: "www.baidu.com/path/?a=3&b=4"

// console.log(setObjToUrlParams('www.baidu.com/path', {}));
// // 输出: "www.baidu.com/path?"

// console.log(WebUtils.getExplore()); // 根据当前浏览器可能输出: "Chrome: 98.0.4758.102"

// 假设在不同的浏览器环境中运行，可能输出:
// "IE: 11.0.9600.19476"
// "EDGE: 98.0.1108.50"
// "Firefox: 96.0"
// "Opera: 83.0.4254.19"
// "Safari: 15.3"

// console.log(WebUtils.getOS()); // 根据当前操作系统可能输出: "ios", "android", "windowsPhone", "MacOSX", "windows", 或 "linux"
