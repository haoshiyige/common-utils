
import { isNumber } from '@nin/shared';

/**
 * Cookie管理工具。
 * 
 * 使用方法：
 * - 设置cookie：`cookie.set('key', 'value', { expires: 7, path: '/' });`
 * - 获取cookie：`const value = cookie.get('key');`
 * - 删除cookie：`cookie.remove('key', { path: '/' });`
 * 
 * 优化点：
 * - 使用默认参数简化代码。
 * - 增加类型检查，提高代码安全性。
 * - 使用字符串字面量类型使选项更明确。
 */

type CookieOptions = {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
};

const defOpts: Required<Pick<CookieOptions, 'path'>> = { path: '/' };

function setCookie(key: string, val?: string, options?: CookieOptions): typeof exports | string | Record<string, string> {
    if (val !== undefined) {
        options = { ...defOpts, ...options }; // 合并默认选项和用户选项

        if (isNumber(options.expires)) {
            const expires = new Date();
            expires.setTime(expires.getTime() + (options.expires as number) * 864e5);
            options.expires = expires;
        }

        val = encodeURIComponent(val);
        key = encodeURIComponent(key);

        document.cookie = [
            key,
            '=',
            val,
            options.expires ? `; expires=${options.expires.toUTCString()}` : '',
            options.path ? `; path=${options.path}` : '',
            options.domain ? `; domain=${options.domain}` : '',
            options.secure ? '; secure' : ''
        ].join('');

        return exports;
    }

    const cookies = document.cookie ? document.cookie.split('; ') : [];
    let result: string | Record<string, string> = key ? undefined : {};

    for (let i = 0, len = cookies.length; i < len; i++) {
        const c = cookies[i];
        const parts = c.split('=');
        const name = decodeUriComponent(parts.shift() || '');

        const value = parts.join('=');
        const decodedValue = decodeUriComponent(value);

        if (key === name) {
            result = decodedValue;
            break;
        }

        if (!key) result[name] = decodedValue;
    }

    return result;
}

const cookie = {
    get: setCookie as (key: string) => string | Record<string, string>,
    set: setCookie as (key: string, val: string, options?: CookieOptions) => typeof exports,
    remove(key: string, options?: CookieOptions) {
        options = { ...options };
        options.expires = new Date(0); // 立即过期
        return setCookie(key, '', options);
    }
};

export default cookie;