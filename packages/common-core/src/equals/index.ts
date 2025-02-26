import { ArrayUtils } from '../ArrayUtils/common/index';
import { isNullOrUnDef, isObject } from "@nin/shared"
/**
 * 定义一个泛型类型的比较器函数类型。
 */
type EqualityComparer<T> = (a: T, b: T) => boolean;

/**
 * EqualityComparer 类提供了一组静态方法用于比较对象或数组的相等性。
 */
export class EqualityCompare {

  /**
   * 使用严格相等来比较两个项是否相等。
   * @param a - 要比较的第一个项。
   * @param b - 要比较的第二个项。
   * @returns 如果项严格相等则返回 true，否则返回 false。 ===
   */

  static strictEquals<T>(a: T, b: T): boolean {
    return a === b;
  }

  /**
   * 检查两个只读数组中的项是否相等。默认情况下，使用严格相等来比较元素，
   * 但也可以提供自定义的相等性比较函数。
   * @param a - 要比较的第一个只读数组。
   * @param b - 要比较的第二个只读数组。
   * @param itemEquals - 可选参数，用于比较数组中各个项的函数。
   * @returns 如果数组中所有对应位置的项都相等，则返回 true，否则返回 false。
   */
  static itemsEquals<T>(a: readonly T[], b: readonly T[], itemEquals: EqualityComparer<T> = this.strictEquals): boolean {
    return ArrayUtils.equals(a, b, itemEquals);
  }

  /**
   * 如果两个项的字符串表示形式相等，则认为这两个项相等。
   * @returns 一个比较器函数，它会比较两个项的 JSON 字符串表示形式。
   */
  static jsonStringifyEquals<T>(): EqualityComparer<T> {
    return (a: T, b: T) => JSON.stringify(a) === JSON.stringify(b);
  }

  /**
   * 使用 `item.equals(other)` 方法来确定两个项是否相等。
   * @returns 一个比较器函数，它会调用项上的 equals 方法进行比较。
   */
  static itemEquals<T extends { equals(other: T): boolean }>(): EqualityComparer<T> {
    return (a: T, b: T) => a.equals(b);
  }

  /**
   * 检查两个项是否均为 null 或 undefined，或者根据提供的相等性比较器是否相等。
   * @param v1 - 第一个要比较的项，可以是 T 类型、undefined 或 null。
   * @param v2 - 第二个要比较的项，可以是 T 类型、undefined 或 null。
   * @param equals - 用于比较两个项的相等性比较器函数。
   * @returns 如果两个项都是 null 或 undefined，或者它们根据提供的比较器相等，则返回 true；否则返回 false。
   */
  static equalsIfDefined<T>(v1: T | undefined | null, v2: T | undefined | null, equals: EqualityComparer<T>): boolean {
    // isNullOrUnDef
    // if (v1 === undefined || v1 === null || v2 === undefined || v2 === null) {
    if (isNullOrUnDef(v1) || isNullOrUnDef(v2)) {
      return v2 === v1;
    }
    return equals(v1, v2);
  }

  /**
   * 返回一个相等性比较器，该比较器检查两个项是否均为 null 或 undefined，或者根据提供的相等性比较器是否相等。
   * @param equals - 用于比较两个项的相等性比较器函数。
   * @returns 一个比较器函数，它会在两个项均为 null 或 undefined 时返回 true，或者当两个项根据提供的比较器相等时返回 true。
   */
  static createEqualsIfDefined<T>(equals: EqualityComparer<T>): EqualityComparer<T | undefined | null> {
    return (v1: T | undefined | null, v2: T | undefined | null) => {
      if (v1 === undefined || v1 === null || v2 === undefined || v2 === null) {
        return v2 === v1;
      }
      return equals(v1, v2);
    };
  }

  /**
   * 钻入数组（项有序）和对象（键无序），并对其他一切使用严格相等性。
   * @param a - 要比较的第一个项。
   * @param b - 要比较的第二个项。
   * @returns 如果两个项结构上相等，则返回 true；否则返回 false。
   */
  static structuralEquals<T>(a: T, b: T): boolean {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.structuralEquals(a[i], b[i])) return false;
      }
      return true;
    }
    if (a && typeof a === 'object' && b && typeof b === 'object') {
      if (Object.getPrototypeOf(a) === Object.prototype && Object.getPrototypeOf(b) === Object.prototype) {
        const aObj = a as Record<string, unknown>;
        const bObj = b as Record<string, unknown>;
        const keysA = Object.keys(aObj);
        const keysB = Object.keys(bObj);
        const keysBSet = new Set(keysB);
        if (keysA.length !== keysB.length) return false;
        for (const key of keysA) {
          if (!keysBSet.has(key)) return false;
          if (!this.structuralEquals(aObj[key], bObj[key])) return false;
        }
        return true;
      }
    }
    return false;
  }

  /**
   * 获取一个项的结构化键，该键与另一项的结构化键相同意味着它们在结构上是相等的。
   * 前提是 a 和 b 不是循环结构，并且没有任何东西扩展了 globalThis 的 Array。
   * @param t - 要获取结构化键的项。
   * @returns 项的结构化键字符串。
   */
  static getStructuralKey(t: unknown): string {
    return JSON.stringify(this.toNormalizedJsonStructure(t));
  }


  static isObjectEqual<T extends object, U extends object>(obj1: T, obj2: U): boolean {
    //  @ts-ignore
    if (obj1 === obj2) return true; // 同一引用或基本类型值相等 // ts-ignore
    if (!isObject(obj1) || !isObject(obj2)) return false;
    const keys1 = Object.keys(obj1) as (keyof T & string)[];
    const keys2 = Object.keys(obj2) as (keyof U & string)[];
    if (keys1.length !== keys2.length) return false; // 键数量不等
    for (const key of keys1) {
      if (!(key in obj2)) return false; // 对象2缺少对象1的某个键
      //  @ts-ignore
      if (!deepEqual(obj1[key as keyof T], obj2[key as keyof U])) return false; // 深度比较对应键的值
    }
    return true;
    function deepEqual(value1: any, value2: any): boolean {
      if (value1 === value2) return true;
      if (typeof value1 !== 'object' || value1 === null || typeof value2 !== 'object' || value2 === null) return false;
      // 获取两个对象的所有键
      const keysA = Object.keys(value1);
      const keysB = Object.keys(value2);
      if (keysA.length !== keysB.length) return false;
      for (let key of keysA) {
        if (!keysB.includes(key) || !deepEqual((value1 as any)[key], (value2 as any)[key])) return false;
      }
      return true;
    }
  }


  private static objectId = 0;
  private static objIds = new WeakMap<object, number>();

  /**
   * 将对象转换为规范化 JSON 结构，以便于进行结构化比较。
   * @param t - 要转换的项。
   * @returns 规范化的 JSON 结构。
   */
  private static toNormalizedJsonStructure(t: unknown): unknown {
    if (Array.isArray(t)) {
      return t.map(item => this.toNormalizedJsonStructure(item));
    }

    if (t && typeof t === 'object') {
      if (Object.getPrototypeOf(t) === Object.prototype) {
        const tObj = t as Record<string, unknown>;
        const res: Record<string, unknown> = Object.create(null);
        for (const key of Object.keys(tObj).sort()) {
          res[key] = this.toNormalizedJsonStructure(tObj[key]);
        }
        return res;
      } else {
        let objId = this.objIds.get(t);
        if (objId === undefined) {
          objId = this.objectId++;
          this.objIds.set(t, objId);
        }
        // 随机字符串以防止冲突
        return `${objId}----2b76a038c20c4bcc`;
      }
    }
    return t;
  }



}