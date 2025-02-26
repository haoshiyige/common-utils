import { isFunction, isObject } from "./general";

const toString = Object.prototype.toString;

export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`;
}

export function isDef<T = unknown>(val?: T): val is T {
  return typeof val !== 'undefined';
}

export function isUnDef<T = unknown>(val?: T): val is T {
  return !isDef(val);
}



export function isNull(val: unknown): val is null {
  return val === null;
}

export function isNullAndUnDef(val: unknown): val is null | undefined {
  return isUnDef(val) && isNull(val);
}

export function isNullOrUnDef(val: unknown): val is null | undefined {
  return isUnDef(val) || isNull(val);
}

export function isNumber(val: unknown): val is number {
  return is(val, 'Number');
}




export function isBoolean(val: unknown): val is boolean {
  return is(val, 'Boolean');
}



// export function isArray(val: any): val is Array<any> {
//   return val && Array.isArray(val);
// }

export function isWindow(val: any): val is Window {
  return typeof window !== 'undefined' && is(val, 'Window');
}


export const isServer = typeof window === 'undefined';

export const isClient = !isServer;

export function isUrl(path: string): boolean {
  const reg =
    /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
  return reg.test(path);
}

export function isBlob(val: unknown): boolean {
  return is(val, "Blob");
};


export function isAsyncFn(val: unknown): boolean {
  return is(val, "AsyncFunction");
};

export function isArrBuffer(val: unknown): boolean {
  return is(val, "ArrayBuffer");
}
export function isFile(val: unknown): boolean {
  return is(val, "File");
}


export function isJson(val: any): boolean {
  try {
    JSON.parse(val);
    return true;
  } catch (e) {
    return false;
  }
};
export function isStream(val: unknown) {
  return val !== null && isObject(val) && isFunction(val.pipe);
}
export function isEmail(val: any): boolean {
  const regEmail = /.+@.+\..+/;
  return regEmail.test(val);
}