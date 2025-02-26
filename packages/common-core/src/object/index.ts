import { isTypedArray, isObject, isUndefinedOrNull, isFunction, isArray, isPlainObject } from '@nin/shared';
import { ArrayUtils } from '../ArrayUtils/common';
import { FunctionUtils } from "../function";

/**
 * @description ObjectUtils 类提供了一组静态方法，用于处理对象的深拷贝、冻结、克隆并修改、混合、比较等操作。
 */
export class ObjectUtils {
    /**
     * 深度克隆给定的对象或数组。
     * @param obj - 要克隆的对象或数组。
     * @returns 克隆后的新对象或数组。
     */
    static deepClone<T>(obj: T): T {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof RegExp) {
            return obj as T;
        }
        const result: any = isArray(obj) ? [] : {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = value && typeof value === 'object' ? this.deepClone(value) : value;
        }
        return result;
    }

    /**
     * 深度冻结给定的对象或数组及其所有子对象。
     * @param obj - 要冻结的对象或数组。
     * @returns 冻结后的新对象或数组。
     */
    static deepFreeze<T>(obj: T): T {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }
        const stack: any[] = [obj];
        while (stack.length > 0) {
            const currentObj = stack.shift();
            Object.freeze(currentObj);
            for (const key in currentObj) {
                if (this._hasOwnProperty.call(currentObj, key)) {
                    const prop = currentObj[key];
                    if (typeof prop === 'object' && !Object.isFrozen(prop) && !isTypedArray(prop)) {
                        stack.push(prop);
                    }
                }
            }
        }
        return obj;
    }

    private static _hasOwnProperty = Object.prototype.hasOwnProperty;

    /**
     * 克隆对象并应用更改函数。
     * @param obj - 要克隆的对象。
     * @param changer - 用于修改克隆对象的函数。
     * @returns 修改后的克隆对象。
     */
    static cloneAndChange(obj: any, changer: (orig: any) => any): any {
        return this._cloneAndChange(obj, changer, new Set());
    }

    private static _cloneAndChange(obj: any, changer: (orig: any) => any, seen: Set<any>): any {
        if (isUndefinedOrNull(obj)) {
            return obj;
        }
        const changed = changer(obj);
        if (typeof changed !== 'undefined') {
            return changed;
        }
        if (isArray(obj)) {
            const result: any[] = [];
            for (const e of obj) {
                result.push(this._cloneAndChange(e, changer, seen));
            }
            return result;
        }

        if (isObject(obj)) {
            if (seen.has(obj)) {
                throw new Error('无法克隆递归数据结构');
            }
            seen.add(obj);
            const result = {};
            for (const key in obj) {
                if (this._hasOwnProperty.call(obj, key)) {
                    (result as any)[key] = this._cloneAndChange(obj[key], changer, seen);
                }
            }
            seen.delete(obj);
            return result;
        }

        return obj;
    }

    /**
     * 将源对象的所有属性复制到目标对象中。可选参数 "overwrite" 用于控制是否覆盖目标对象中已存在的属性。默认为 true（覆盖）。
     * @param destination - 目标对象。
     * @param source - 源对象。
     * @param overwrite - 是否覆盖目标对象中已存在的属性，默认为 true。
     * @returns 修改后的目标对象。
     */
    static mixin(destination: any, source: any, overwrite: boolean = true): any {
        if (!isObject(destination)) {
            return source;
        }

        if (isObject(source)) {
            Object.keys(source).forEach(key => {
                if (key in destination) {
                    if (overwrite) {
                        if (isObject(destination[key]) && isObject(source[key])) {
                            this.mixin(destination[key], source[key], overwrite);
                        } else {
                            destination[key] = source[key];
                        }
                    }
                } else {
                    destination[key] = source[key];
                }
            });
        }
        return destination;
    }

    /**
     * 比较两个对象是否相等。支持深度比较数组和对象。
     * @param one - 第一个要比较的对象。
     * @param other - 第二个要比较的对象。
     * @returns 如果两个对象相等则返回 true，否则返回 false。
     */
    static equals(one: any, other: any): boolean {
        if (one === other) {
            return true;
        }
        if (one === null || one === undefined || other === null || other === undefined) {
            return false;
        }
        if (typeof one !== typeof other) {
            return false;
        }
        if (typeof one !== 'object') {
            return false;
        }
        if ((isArray(one)) !== (isArray(other))) {
            return false;
        }

        let i: number;
        let key: string;

        if (isArray(one)) {
            if (one.length !== other.length) {
                return false;
            }
            for (i = 0; i < one.length; i++) {
                if (!this.equals(one[i], other[i])) {
                    return false;
                }
            }
        } else {
            const oneKeys: string[] = Object.keys(one).sort();
            const otherKeys: string[] = Object.keys(other).sort();
            if (!this.equals(oneKeys, otherKeys)) {
                return false;
            }
            for (i = 0; i < oneKeys.length; i++) {
                if (!this.equals(one[oneKeys[i]], other[oneKeys[i]])) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 使用替换器调用 `JSON.stringify` 来打断任何循环引用，防止抛出异常。
     * @param obj - 要序列化的对象。
     * @returns 序列化后的 JSON 字符串。
     */
    static safeStringify(obj: any): string {
        const seen = new Set<any>();
        return JSON.stringify(obj, (key, value) => {
            if (isObject(value) || isArray(value)) {
                if (seen.has(value)) {
                    return '[Circular]';
                } else {
                    seen.add(value);
                }
            }
            if (typeof value === 'bigint') {
                return `[BigInt ${value.toString()}]`;
            }
            return value;
        });
    }

    /**
     * 返回一个对象，该对象包含与基础对象不同的所有键值对。不考虑在目标对象中不存在但在基础对象中存在的键。
     * 注意：这不是一个深度差异方法，因此如果值不同，则会严格地将其放入结果对象中。
     * @param base - 基础对象。
     * @param target - 目标对象。
     * @returns 包含不同键值对的结果对象。
     */
    static distinct(base: { [key: string]: any }, target: { [key: string]: any }): { [key: string]: any } {
        const result = Object.create(null);

        if (!base || !target) {
            return result;
        }

        const targetKeys = Object.keys(target);
        targetKeys.forEach(k => {
            const baseValue = base[k];
            const targetValue = target[k];

            if (!this.equals(baseValue, targetValue)) {
                result[k] = targetValue;
            }
        });

        return result;
    }

    /**
     * 获取对象中不区分大小写的键对应的值。
     * @param target - 目标对象。
     * @param key - 要查找的键。
     * @returns 对应的值，如果找不到则返回原始键的值。
     */
    static getCaseInsensitive(target: { [key: string]: any }, key: string): unknown {
        const lowercaseKey = key.toLowerCase();
        const equivalentKey = Object.keys(target).find(k => k.toLowerCase() === lowercaseKey);
        return equivalentKey ? target[equivalentKey] : target[key];
    }

    /**
     * 根据提供的谓词函数过滤对象的键值对。
     * @param obj - 要过滤的对象。
     * @param predicate - 用于决定是否保留键值对的谓词函数。
     * @returns 过滤后的对象。
     */
    static filter(obj: { [key: string]: any }, predicate: (key: string, value: any) => boolean): { [key: string]: any } {
        const result = Object.create(null);
        for (const [key, value] of Object.entries(obj)) {
            if (predicate(key, value)) {
                result[key] = value;
            }
        }
        return result;
    }

    /**
     * 获取对象及其原型链上的所有属性名。
     * @param obj - 目标对象。
     * @returns 属性名数组。
     */
    static getAllPropertyNames(obj: object): string[] {
        let res: string[] = [];
        while (Object.prototype !== obj) {
            res = res.concat(Object.getOwnPropertyNames(obj));
            obj = Object.getPrototypeOf(obj);
        }
        return res;
    }

    /**
     * 获取对象及其原型链上的所有方法名。
     * @param obj - 目标对象。
     * @returns 方法名数组。
     */
    static getAllMethodNames(obj: object): string[] {
        const methods: string[] = [];
        for (const prop of this.getAllPropertyNames(obj)) {
            if (typeof (obj as any)[prop] === 'function') {
                methods.push(prop);
            }
        }
        return methods;
    }

    /**
     * 创建一个代理对象，该对象的方法调用将转发给指定的调用函数。
     * @param methodNames - 要代理的方法名数组。
     * @param invoke - 用于处理方法调用的函数。
     * @returns 代理对象。
     */
    static createProxyObject<T extends object>(methodNames: string[], invoke: (method: string, args: unknown[]) => unknown): T {
        const createProxyMethod = (method: string): () => unknown => {
            return function () {
                const args = Array.from(arguments);
                return invoke(method, args);
            };
        };

        // eslint-disable-next-line local/code-no-dangerous-type-assertions
        const result = {} as T;
        for (const methodName of methodNames) {
            (result as any)[methodName] = createProxyMethod(methodName);
        }
        return result;
    }

    /**
     * 将对象的每个值映射到新值。
     * @param obj - 要映射的对象。
     * @param fn - 用于映射值的函数。
     * @returns 映射后的新对象。
     */
    static mapValues<T extends {}, R>(obj: T, fn: (value: T[keyof T], key: string) => R): { [K in keyof T]: R } {
        const result: { [key: string]: R } = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = fn(<T[keyof T]>value, key);
        }
        return result as { [K in keyof T]: R };
    }


    /**
     * 冻结对象，使其不可变。
     *
     * @param obj - 要冻结的对象。
     * @returns 已冻结的对象。
     */

    static freeze<T extends object>(obj: T): Readonly<T> {
        if (Object.freeze) return Object.freeze(obj);
        // @ts-ignore
        Object.keys(obj).forEach((prop) => {
            const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
            if (!descriptor?.configurable) return;
            Object.defineProperty(obj, prop, {
                ...descriptor,
                writable: false,
                configurable: false
            });
        });
        return obj as Readonly<T>;
    }

    /**
     * 遍历对象的每个可枚举属性，并对每个属性执行提供的迭代函数。
     *
     * @param obj - 要遍历的对象。如果此参数不是对象，则不会执行任何操作。
     * @param iterate - 应用于每个属性的函数，接受三个参数：
     *                  - value: 当前属性的值。
     *                  - key: 当前属性的键。
     *                  - obj: 遍历的对象本身。
     * @param context - 可选。作为 `iterate` 函数运行时的上下文（即`this`的值）。
     *                 如果未提供，默认使用全局对象。
     *
     * 注意：该函数仅会迭代对象自身的可枚举属性，不会遍历原型链上的属性。
     */
    static objectEach<T extends object>(obj: T | null | undefined, iterate: (value: T[keyof T], key: keyof T, obj: T) => void, context: any = globalThis): void {
        if (isObject(obj)) {
            for (let key in obj) {
                // 假设 hasOwnProp 是一个验证是否为自有属性的函数，例如 Object.prototype.hasOwnProperty
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const typedKey = key as keyof T;
                    iterate.call(context, obj[typedKey], typedKey, obj);
                }
            }
        } else {
            throw new Error(obj + "is not Object");
        }
    }

    /**
     * 根据提供的回调函数对对象或数组的每个元素进行映射，并返回一个新对象。
     *
     * @param obj - 要遍历的对象或数组。
     * @param iterate - 应用于每个属性的函数，接受三个参数：
     *                  - value: 当前属性的值。
     *                  - key: 当前属性的键。
     *                  - obj: 遍历的对象本身。
     * @param context - 可选。作为 `iterate` 函数运行时的上下文（即`this`的值）。
     *                 如果未提供，默认使用全局对象。
     * @returns 返回一个新的对象，其键值对由回调函数的结果组成。
     */
    static objectMap<T extends Record<string, any>, K extends keyof T>(obj: T | null | undefined, iterate: ((value: T[K], key: K, obj: T) => any) | keyof T, context: any = globalThis): Record<string, any> {
        const result: Record<string, any> = {};
        if (obj && iterate) {
            // 如果 iterate 不是函数，则使用 property 函数创建一个获取属性值的函数
            let iterateFn: (value: T[keyof T], key: keyof T, obj: T) => any;
            if (!isFunction(iterate)) {
                // @ts-ignore
                iterateFn = FunctionUtils.property(iterate);
            } else {
                iterateFn = iterate as (value: T[keyof T], key: keyof T, obj: T) => any;
            }
            // @ts-ignore
            ArrayUtils.eachArrayOrObject(obj, (val: T[keyof T], key: keyof T) => {
                result[String(key)] = iterateFn.call(context, val, key, obj);
            });
        }
        return result;
    }

    /**
     * 将值复制到目标对象，且以目标对象属性为准。
     * 例如：target: {a:1}, source: {a:2, b:3} 结果为：{a:2}
     *
     * @param target - 目标对象。
     * @param source - 源对象。
     */
    static copyValueToTarget = <T extends object, S extends object>(target: T, source: S): T => {
        // 使用 assign 函数合并对象
        const newObj: T & S = Object.assign({}, target, source);
        // 删除不在目标对象中的属性
        Object.keys(newObj).forEach((key: string) => {
            if (!(key in target)) {
                delete newObj[key as keyof (T & S)];
            }
        });
        // 更新目标对象的值
        return Object.assign(target, newObj);
    };

    /**
     * 合并一个或多个源对象到目标对象中。
     *
     * @param target - 目标对象。
     * @param sources - 要合并的一个或多个源对象。
     * @returns 合并后的目标对象。
     */
    static merge<T extends object>(target: T, ...sources: any[]): T {
        if (!target) {
            target = {} as T;
        }
        const handleMerge = (targetObj: any, sourceObj: any): any => {
            if ((isPlainObject(targetObj) && isPlainObject(sourceObj)) || (isArray(targetObj) && isArray(sourceObj))) {
                // @ts-ignore
                ArrayUtils.eachArrayOrObject(sourceObj, (value: any, key: keyof typeof sourceObj) => {
                    // @ts-ignore
                    targetObj[key] = handleMerge(targetObj[key], value);
                });
                return targetObj;
            }
            return sourceObj;
        };

        for (let source of sources) {
            if (source) {
                handleMerge(target, source);
            }
        }

        return target;
    }




    /**
     * 获取对象的原型。
     *
     * @param obj - 要获取原型的对象。
     * @returns 对象的原型，如果无法确定则返回 undefined。
     * 
     * 示例:
     * ```typescript
     * const obj = {};
     * const proto = getProto(obj);
     * console.log(proto === Object.prototype); // 输出: true
     * 
     * const fn = function() {};
     * const fnProto = getProto(fn);
     * console.log(fnProto === Function.prototype); // 输出: true
     * ```
     */

    static getProto<T>(obj: T): object | undefined {
        const getPrototypeOf = Object.getPrototypeOf;
        const ObjectCtr = {}.constructor;
        if (!isObject(obj)) return undefined;
        if (typeof getPrototypeOf === 'function') return getPrototypeOf(obj);
        const proto = (obj as any).__proto__;
        if (proto !== undefined || proto === null) return proto;
        if (isFunction((obj as any).constructor)) return (obj as any).constructor.prototype;
        if (obj instanceof ObjectCtr) return ObjectCtr.prototype;
        return undefined;
    }
    /**
     * Inverts the keys and values of an object. The keys of the input object become the values of the output object and vice versa.
     *
     * This function takes an object and creates a new object by inverting its keys and values. If the input object has duplicate values,
     * the key of the last occurrence will be used as the value for the new key in the output object. It effectively creates a reverse mapping
     * of the input object's key-value pairs.
     *
     * @template K - Type of the keys in the input object (string, number, symbol)
     * @template V - Type of the values in the input object (string, number, symbol)
     * @param {Record<K, V>} obj - The input object whose keys and values are to be inverted
     * @returns {{ [key in V]: K }} - A new object with keys and values inverted
     *
     * @example
     * invert({ a: 1, b: 2, c: 3 }); // { 1: 'a', 2: 'b', 3: 'c' }
     * invert({ 1: 'a', 2: 'b', 3: 'c' }); // { a: '1', b: '2', c: '3' }
     * invert({ a: 1, 2: 'b', c: 3, 4: 'd' }); // { 1: 'a', b: '2', 3: 'c', d: '4' }
     * invert({ a: Symbol('sym1'), b: Symbol('sym2') }); // { [Symbol('sym1')]: 'a', [Symbol('sym2')]: 'b' }
     */
    static invert<K extends PropertyKey, V extends PropertyKey>(obj: Record<K, V>): { [key in V]: K } {
        const result = {} as { [key in V]: K };
        for (const key in obj) {
            const value = obj[key as K] as V;
            result[value] = key;
        }

        return result;
    }

    /**
     * Creates a new object with specified keys omitted.
     *
     * This function takes an object and an array of keys, and returns a new object that
     * excludes the properties corresponding to the specified keys.
     *
     * @template T - The type of object.
     * @template K - The type of keys in object.
     * @param {T} obj - The object to omit keys from.
     * @param {K[]} keys - An array of keys to be omitted from the object.
     * @returns {Omit<T, K>} A new object with the specified keys omitted.
     *
     * @example
     * const obj = { a: 1, b: 2, c: 3 };
     * const result = omit(obj, ['b', 'c']);
     * // result will be { a: 1 }
     */
    static omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
        const result = { ...obj };

        for (const key of keys) {
            delete result[key];
        }

        return result as Omit<T, K>;
    }


    /**
      * Creates a new object composed of the properties that do not satisfy the predicate function.
      *
      * This function takes an object and a predicate function, and returns a new object that
      * includes only the properties for which the predicate function returns false.
      *
      * @template T - The type of object.
      * @param {T} obj - The object to omit properties from.
      * @param {(value: T[string], key: keyof T) => boolean} shouldOmit - A predicate function that determines
      * whether a property should be omitted. It takes the property's key and value as arguments and returns `true`
      * if the property should be omitted, and `false` otherwise.
      * @returns {Partial<T>} A new object with the properties that do not satisfy the predicate function.
      *
      * @example
      * const obj = { a: 1, b: 'omit', c: 3 };
      * const shouldOmit = (key, value) => typeof value === 'string';
      * const result = omitBy(obj, shouldOmit);
      * // result will be { a: 1, c: 3 }
      */
    static omitBy<T extends Record<string, any>>(
        obj: T,
        shouldOmit: (value: T[keyof T], key: keyof T) => boolean
    ): Partial<T> {
        const result: Partial<T> = {};
        for (const [key, value] of Object.entries(obj)) {
            if (shouldOmit(value, key)) {
                continue;
            }
            (result as any)[key] = value;
        }
        return result;
    }


    /**
 * Creates a new object composed of the picked object properties.
 *
 * This function takes an object and an array of keys, and returns a new object that
 * includes only the properties corresponding to the specified keys.
 *
 * @template T - The type of object.
 * @template K - The type of keys in object.
 * @param {T} obj - The object to pick keys from.
 * @param {K[]} keys - An array of keys to be picked from the object.
 * @returns {Pick<T, K>} A new object with the specified keys picked.
 *
 * @example
 * const obj = { a: 1, b: 2, c: 3 };
 * const result = pick(obj, ['a', 'c']);
 * // result will be { a: 1, c: 3 }
 */
    static pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
        const result = {} as Pick<T, K>;
        for (const key of keys) {
            result[key] = obj[key];
        }
        return result;
    }


    /**
     * Creates a new object composed of the properties that satisfy the predicate function.
     *
     * This function takes an object and a predicate function, and returns a new object that
     * includes only the properties for which the predicate function returns true.
     *
     * @template T - The type of object.
     * @param {T} obj - The object to pick properties from.
     * @param {(value: T[keyof T], key: keyof T) => boolean} shouldPick - A predicate function that determines
     * whether a property should be picked. It takes the property's key and value as arguments and returns `true`
     * if the property should be picked, and `false` otherwise.
     * @returns {Partial<T>} A new object with the properties that satisfy the predicate function.
     *
     * @example
     * const obj = { a: 1, b: 'pick', c: 3 };
     * const shouldPick = (value) => typeof value === 'string';
     * const result = pickBy(obj, shouldPick);
     * // result will be { b: 'pick' }
     */
    static pickBy<T extends Record<string, any>>(
        obj: T,
        shouldPick: (value: T[keyof T], key: keyof T) => boolean
    ): Partial<T> {
        const result: Partial<T> = {};

        for (const [key, value] of Object.entries(obj)) {
            if (!shouldPick(value, key)) {
                continue;
            }

            (result as any)[key] = value;
        }

        return result;
    }

}
