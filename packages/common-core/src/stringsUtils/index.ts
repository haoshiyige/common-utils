import { CharCode } from "../uri/charCode/index"
import { Constants } from './uint/index';
import { isUUID, generateUuid } from "./uuid/index";
import { buildReplaceStringWithCasePreserved } from "./Search/index"
import { ArrayUtils } from "../ArrayUtils/common";
import { language, StyleDef } from "./config/highlightConfig";

/**
 * 定义创建正则表达式的选项接口。
 */
interface RegExpOptions {
    matchCase?: boolean;   // 是否区分大小写，默认不区分
    wholeWord?: boolean;   // 是否仅匹配整个单词，默认不限制
    multiline?: boolean;   // 是否启用多行模式，默认不启用
    global?: boolean;      // 是否全局搜索，默认不全局
    unicode?: boolean;     // 是否启用 Unicode 模式，默认不启用
}
export class StringsUtils {
    private static CONTAINS_RTL: RegExp | undefined = undefined;
    private static IS_BASIC_ASCII = /^[\t\n\r\x20-\x7E]*$/;
    static UNUSUAL_LINE_TERMINATORS = /[\u2028\u2029]/;

    constructor() {

    }


    static isUUID = isUUID;
    static generateUuid = generateUuid;
    static buildReplaceStringWithCasePreserved = buildReplaceStringWithCasePreserved;


    /**
      * 检查给定的字符串是否为假值（falsy）或者仅包含空白字符。
      *
      * 该函数首先检查输入是否为 undefined 或者不是字符串类型。如果是，则返回 true。
      * 接着，它会去除字符串两端的空白字符，并检查剩余字符串的长度是否为 0。
      * 如果长度为 0，则表示字符串仅包含空白字符或为空字符串，函数返回 true；
      * 否则，返回 false 表示字符串包含非空白字符。
      *
      * @param str - 要检查的字符串，可以是 undefined。
      * @returns 如果字符串为假值（falsy）或者仅包含空白字符，则返回 true；否则返回 false。
      *
      * @example
      * // 返回 true，因为输入是 undefined
      * isFalsyOrWhitespace(undefined);
      *
      * @example
      * // 返回 true，因为空字符串被视为假值
      * isFalsyOrWhitespace("");
      *
      * @example
      * // 返回 true，因为字符串仅包含空白字符
      * isFalsyOrWhitespace("   ");
      *
      * @example
      * // 返回 false，因为字符串包含非空白字符
      * isFalsyOrWhitespace("hello");
      */


    static isFalsyOrWhitespace(str: string | undefined): boolean {
        if (!str || typeof str !== 'string') {
            return true;
        }
        return str.trim().length === 0;
    }

    /**
     * 格式化字符串，支持使用 {n} 语法插入可变数量的参数。
     *
     * 该函数接受一个字符串和一系列参数。在字符串中，可以使用 `{n}` 的形式来表示要插入第 n+1 个参数的位置，
     * 其中 n 是从 0 开始的索引。如果提供的索引超出了参数数组的范围，或者不是有效的数字，则保留原始的 `{n}`。
     *
     * @param value - 要进行格式化的字符串模板，其中可以包含 `{n}` 占位符。
     * @param args - 用于替换 `{n}` 占位符的参数列表。
     * @returns 格式化后的字符串，其中所有的 `{n}` 占位符已被相应的参数值替换。
     *
     * @example
     * // 返回 "Hello, Alice!"
     * format("Hello, {0}!", "Alice");
     *
     * @example
     * // 返回 "The answer is 42."
     * format("The answer is {0}.", 42);
     *
     * @example
     * // 返回 "First: one, Second: two, Third: three"
     * format("First: {0}, Second: {1}, Third: {2}", "one", "two", "three");
     *
     * @example
     * // 返回 "Invalid index: {3}"
     * format("Invalid index: {3}", "one", "two", "three");
     *
     * @example
     * // 返回 "No replacements needed."
     * format("No replacements needed.");
     */


    static format(value: string, ...args: any[]): string {
        const _formatRegexp = /{(\d+)}/g;
        if (args.length === 0) {
            return value;
        }
        return value.replace(_formatRegexp, function (match, group) {
            const idx = parseInt(group, 10);
            return isNaN(idx) || idx < 0 || idx >= args.length ?
                match :
                args[idx];
        });
    }


    /**
     * 根据模板字符串和键值对对象创建格式化后的字符串。
     *
     * 该函数接受一个模板字符串和一个包含键值对的对象。在模板字符串中，可以使用 `{key}` 的形式来表示要插入对象中对应键的值。
     * 如果提供的键在对象中不存在，则保留原始的 `{key}` 占位符。
     *
     * @param template - 要进行格式化的模板字符串，其中可以包含 `{key}` 占位符。
     * @param values - 包含键值对的对象，用于替换模板中的 `{key}` 占位符。
     * @returns 格式化后的字符串，其中所有的 `{key}` 占位符已被相应的对象值替换。
     *
     * @example
     * // 返回 "Hello, Alice!"
     * format2("Hello, {name}!", { name: "Alice" });
     *
     * @example
     * // 返回 "The answer is 42."
     * format2("The answer is {answer}.", { answer: 42 });
     *
     * @example
     * // 返回 "First: one, Second: two, Third: three"
     * format2("First: {first}, Second: {second}, Third: {third}", { first: "one", second: "two", third: "three" });
     *
     * @example
     * // 返回 "Invalid key: {missingKey}"
     * format2("Invalid key: {missingKey}", { first: "one", second: "two" });
     *
     * @example
     * // 返回 "No replacements needed."
     * format2("No replacements needed.", {});
     */


    static format2(template: string, values: Record<string, unknown>): string {
        // 正则表达式用于匹配字符串中的 {key} 占位符
        const _format2Regexp = /\{([^\}]+)\}/g;
        if (Object.keys(values).length === 0) {
            return template;
        }
        return template.replace(_format2Regexp, (match, group) => (values[group] ?? match) as string);
    }


    /**
     * 对给定的值进行编码，使其可以安全地用作 HTML 属性的字面值。
     *
     * 该函数确保在 HTML 标签中使用时，属性值不会引起 XSS（跨站脚本攻击）。它将特殊字符转换为对应的 HTML 实体。
     *
     * @param value - 要编码的字符串。
     * @returns 编码后的字符串，可以安全地用作 HTML 属性的值。
     *
     * @example
     * // 返回 "Hello &amp;amp; Welcome"
     * htmlAttributeEncodeValue("Hello & Welcome");
     *
     * @example
     * // 返回 "It's a &lt;script&gt; tag"
     * htmlAttributeEncodeValue("It's a <script> tag");
     */
    static htmlAttributeEncodeValue(value: string): string {
        return value.replace(/[<>"'&]/g, ch => {
            switch (ch) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '"': return '&quot;';
                case '\'': return '&apos;';
                case '&': return '&amp;';
            }
            return ch;
        });
    }



    /**
     * 将字符串中的 HTML 特殊字符转换为对应的 HTML 实体，使其可以安全地用于 `HTMLElement.innerHTML` 等场景。
     *
     * 该函数防止了潜在的 XSS 攻击，通过将 `<`, `>` 和 `&` 转换为相应的 HTML 实体。
     *
     * @param html - 要转义的 HTML 字符串。
     * @returns 转义后的字符串，可以安全地插入到 HTML 内容中。
     *
     * @example
     * // 返回 "Hello &amp; Welcome"
     * escape("Hello & Welcome");
     *
     * @example
     * // 返回 "&lt;p&gt;This is a paragraph&lt;/p&gt;"
     * escape("<p>This is a paragraph</p>");
     */

    static escape(html: string): string {
        return html.replace(/[<>&]/g, function (match) {
            switch (match) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                default: return match;
            }
        });
    }



    /**
     * 对给定的字符串中的正则表达式特殊字符进行转义。
     *
     * 该函数确保字符串可以安全地用于构建正则表达式，避免因未转义的特殊字符导致的错误或意外行为。
     *
     * @param value - 要转义的字符串。
     * @returns 转义后的字符串，其中所有正则表达式特殊字符都被正确转义。
     *
     * @example
     * // 返回 "\\\{\\}\\*\\+\\?\\|\\^\\$\\.\$\$\$\$"
     * escapeRegExpCharacters("\\{}*+?|^.$[]()");
     */


    static escapeRegExpCharacters(value: string): string {
        return value.replace(/[\\\{\}\*\+\?\|\^\$\.$$$$]/g, '\\$&');
    }

    /**
      * 计算子字符串 `substr` 在字符串 `value` 中出现的次数。
      *
      * 该函数遍历整个字符串，统计指定子字符串的出现次数。如果子字符串为空，则返回 0。
      *
      * @param value - 要搜索的字符串。
      * @param substr - 要计数的子字符串。
      * @returns 子字符串在 `value` 中出现的次数。
      *
      * @example
      * // 返回 2
      * count("hello world", "l");
      *
      * @example
      * // 返回 3
      * count("ababab", "ab");
      *
      * @example
      * // 返回 0
      * count("hello world", "");
      */


    static count(value: string, substr: string): number {
        if (substr === '') {
            return 0;
        }
        let result = 0;
        let index = value.indexOf(substr);
        while (index !== -1) {
            result++;
            index = value.indexOf(substr, index + substr.length);
        }
        return result;
    }


    /**
     * 截断字符串，使其长度不超过指定的最大长度，并在末尾添加指定的后缀。
     *
     * 如果字符串的长度小于或等于最大长度，则返回原始字符串。否则，截取字符串的前 `maxLength` 个字符，
     * 并在其后添加指定的后缀（默认为省略号 `…`）。
     *
     * @param value - 要截断的字符串。
     * @param maxLength - 最大允许的字符串长度。
     * @param suffix - 截断后的后缀，默认为 `…`。
     * @returns 截断后的字符串。
     *
     * @example
     * // 返回 "Hello"
     * truncate("Hello", 5);
     *
     * @example
     * // 返回 "Hello Wo…"
     * truncate("Hello World", 8);
     *
     * @example
     * // 返回 "Hello W[...]"
     * truncate("Hello World", 8, "[...]");
     */
    static truncate(value: string, maxLength: number, suffix = '…'): string {
        if (value.length <= maxLength) {
            return value;
        }
        return `${value.substr(0, maxLength)}${suffix}`;
    }


    /**
     * 截断字符串的中间部分，使其总长度不超过指定的最大长度，并在中间插入指定的后缀。
     *
     * 如果字符串的长度小于或等于最大长度，则返回原始字符串。否则，保留字符串的前半部分和后半部分，
     * 在中间插入指定的后缀（默认为省略号 `…`），使最终字符串的总长度不超过 `maxLength`。
     *
     * @param value - 要截断的字符串。
     * @param maxLength - 最大允许的字符串长度。
     * @param suffix - 截断后的中间部分后缀，默认为 `…`。
     * @returns 截断后的字符串。
     *
     * @example
     * // 返回 "Hello"
     * truncateMiddle("Hello", 5);
     *
     * @example
     * // 返回 "Hel…rld"
     * truncateMiddle("Hello World", 8);
     *
     * @example
     * // 返回 "Hel[...]rld"
     * truncateMiddle("Hello World", 8, "[...]");
     */


    static truncateMiddle(value: string, maxLength: number, suffix = '…'): string {
        if (value.length <= maxLength) return value;
        const prefixLength = Math.ceil(maxLength / 2) - suffix.length / 2;
        const suffixLength = Math.floor(maxLength / 2) - suffix.length / 2;
        return `${value.substr(0, prefixLength)}${suffix}${value.substr(value.length - suffixLength)}`;
    }



    /**
     * 从字符串的开头和结尾移除所有指定的字符（默认为空格）。
     *
     * 该函数首先调用 `ltrim` 移除字符串开头的所有指定字符，然后调用 `rtrim` 移除字符串结尾的所有指定字符。
     *
     * @param haystack - 要处理的字符串。
     * @param needle - 要移除的字符，默认为空格。
     * @returns 处理后的字符串。
     *
     * @example
     * // 返回 "Hello World"
     * trim("   Hello World   ");
     *
     * @example
     * // 返回 "Hello World"
     * trim("___Hello World___", "_");
     */


    static trim(haystack: string, needle: string = ' '): string {
        const trimmed = this.ltrim(haystack, needle);
        return this.rtrim(trimmed, needle);
    }


    /**
     * 从字符串的开头移除所有指定的字符。
     *
     * 该函数会移除字符串开头连续出现的所有指定字符，直到遇到第一个不匹配的字符为止。
     *
     * @param haystack - 要处理的字符串。
     * @param needle - 要移除的字符。
     * @returns 处理后的字符串。
     *
     * @example
     * // 返回 "Hello World   "
     * ltrim("   Hello World   ");
     *
     * @example
     * // 返回 "Hello World___"
     * ltrim("___Hello World___", "_");
     */



    static ltrim(haystack: string, needle: string): string {
        if (!haystack || !needle) {
            return haystack;
        }
        const needleLen = needle.length;
        if (needleLen === 0 || haystack.length === 0) {
            return haystack;
        }
        let offset = 0;
        while (haystack.indexOf(needle, offset) === offset) {
            offset += needleLen;
        }
        return haystack.substring(offset);
    }



    /**
     * 从字符串的结尾移除所有指定的字符。
     *
     * 该函数会移除字符串结尾连续出现的所有指定字符，直到遇到第一个不匹配的字符为止。
     *
     * @param haystack - 要处理的字符串。
     * @param needle - 要移除的字符。
     * @returns 处理后的字符串。
     *
     * @example
     * // 返回 "   Hello World"
     * rtrim("   Hello World   ");
     *
     * @example
     * // 返回 "___Hello World"
     * rtrim("___Hello World___", "_");
     */


    static rtrim(haystack: string, needle: string): string {
        if (!haystack || !needle) {
            return haystack;
        }
        const needleLen = needle.length, haystackLen = haystack.length;
        if (needleLen === 0 || haystackLen === 0) {
            return haystack;
        }
        let offset = haystackLen, idx = -1;
        while (true) {
            idx = haystack.lastIndexOf(needle, offset - 1);
            if (idx === -1 || idx + needleLen !== offset) {
                break;
            }
            if (idx === 0) {
                return '';
            }
            offset = idx;
        }
        return haystack.substring(0, offset);
    }



    /**
     * 将简单的通配符模式转换为正则表达式模式。
     * 
     * 该函数会将给定的字符串中的特殊字符（如 - \ { } + ? | ^ $ . , [ ] ( ) # 和空格）进行转义，
     * 并将所有的 '*' 替换为 '.*'，使得它们可以在正则表达式中正确匹配。
     *
     * @param pattern - 包含通配符的简单模式字符串。
     * @returns 转换后的正则表达式模式字符串。
     */
    static convertSimple2RegExpPattern(pattern: string): string {
        return pattern.replace(/[\-\\\{\}\+\?\|\^\$\.\,$$$$\#\s]/g, '\\$&').replace(/[\*]/g, '.*');
    }

    /**
     * 去除字符串中的所有通配符 '*'。
     *
     * @param pattern - 包含通配符的字符串。
     * @returns 不包含通配符 '*' 的字符串。
     */
    static stripWildcards(pattern: string): string {
        return pattern.replace(/\*/g, '');
    }



    /**
     * 根据提供的搜索字符串和选项创建一个正则表达式对象。
     *
     * @param searchString - 用于创建正则表达式的搜索字符串。
     * @param isRegex - 如果为 true，则 `searchString` 应该是一个有效的正则表达式模式；否则，它将被视为普通文本。
     * @param options - 可选的正则表达式配置选项。
     * @returns 一个新的 RegExp 对象。
     * @throws 如果 `searchString` 是空字符串，则抛出错误。
     */
    static createRegExp(searchString: string, isRegex: boolean, options: RegExpOptions = {}): RegExp {
        if (!searchString) {
            throw new Error('Cannot create regex from empty string');
        }
        if (!isRegex) {
            searchString = this.escapeRegExpCharacters(searchString);
        }
        if (options.wholeWord) {
            if (!/\B/.test(searchString.charAt(0))) {
                searchString = '\\b' + searchString;
            }
            if (!/\B/.test(searchString.charAt(searchString.length - 1))) {
                searchString = searchString + '\\b';
            }
        }
        let modifiers = '';
        if (options.global) {
            modifiers += 'g';
        }
        if (!options.matchCase) {
            modifiers += 'i';
        }
        if (options.multiline) {
            modifiers += 'm';
        }
        if (options.unicode) {
            modifiers += 'u';
        }

        return new RegExp(searchString, modifiers);
    }

    /**
     * 检查给定的正则表达式是否可能导致无限循环。
     *
     * 该函数通过尝试使用空字符串来执行正则表达式，如果正则表达式在没有前进的情况下匹配了空字符串，
     * 则认为它可能会导致无限循环。
     *
     * @param regexp - 要检查的正则表达式对象。
     * @returns 如果正则表达式可能引起无限循环，则返回 true；否则返回 false。
     */
    static regExpLeadsToEndlessLoop(regexp: RegExp): boolean {
        // Exit early if it's one of these special cases which are meant to match
        // against an empty string
        if (regexp.source === '^' || regexp.source === '^$' || regexp.source === '$' || regexp.source === '^\\s*$') {
            return false;
        }

        // We check against an empty string. If the regular expression doesn't advance
        // (e.g. ends in an endless loop) it will match an empty string.
        const match = regexp.exec('');
        return !!(match && regexp.lastIndex === 0);
    }







    /**
 * 将数组中的字符串项连接成一个单独的字符串，忽略 undefined, null 和 false 的值。
 *
 * @param items - 包含字符串、undefined、null 或 false 的数组。
 * @param separator - 用于分隔各个字符串项的分隔符。
 * @returns 连接后的字符串。
 */
    static joinStrings(items: (string | undefined | null | false)[], separator: string): string {
        return items.filter(item => item !== undefined && item !== null && item !== false).join(separator);
    }

    /**
     * 按行分割给定的字符串，支持多种换行符（CRLF, CR, LF）。
     *
     * @param str - 要分割的字符串。
     * @returns 分割后的行数组。
     */
    static splitLines(str: string): string[] {
        return str.split(/\r\n|\r|\n/);
    }

    /**
     * 按行分割给定的字符串，并保留换行符。每行将包括其后面的换行符（如果有）。
     *
     * @param str - 要分割的字符串。
     * @returns 分割后的行数组，其中每一行可能包含换行符。
     */
    static splitLinesIncludeSeparators(str: string): string[] {
        const linesWithSeparators: string[] = [];
        const splitLinesAndSeparators = str.split(/(\r\n|\r|\n)/);
        for (let i = 0; i < Math.ceil(splitLinesAndSeparators.length / 2); i++) {
            linesWithSeparators.push(splitLinesAndSeparators[2 * i] + (splitLinesAndSeparators[2 * i + 1] ?? ''));
        }
        return linesWithSeparators;
    }

    /**
     * 返回字符串中第一个非空白字符的索引。如果字符串为空或仅包含空白字符，则返回 -1。
     *
     * @param str - 要检查的字符串。
     * @returns 第一个非空白字符的索引，或者 -1 如果没有这样的字符。
     */
    static firstNonWhitespaceIndex(str: string): number {
        for (let i = 0, len = str.length; i < len; i++) {
            const chCode = str.charCodeAt(i);
            if (chCode !== CharCode.Space && chCode !== CharCode.Tab) {
                return i;
            }
        }
        return -1;
    }

    /**
     * 返回字符串开头的空白字符部分。如果字符串只包含空白字符，则返回整个字符串。
     *
     * @param str - 要提取前导空白的字符串。
     * @param start - 开始索引，默认是0。
     * @param end - 结束索引，默认是字符串长度。
     * @returns 字符串的前导空白部分。
     */
    static getLeadingWhitespace(str: string, start: number = 0, end: number = str.length): string {
        for (let i = start; i < end; i++) {
            const chCode = str.charCodeAt(i);
            if (chCode !== CharCode.Space && chCode !== CharCode.Tab) {
                return str.substring(start, i);
            }
        }
        return str.substring(start, end);
    }

    /**
     * 返回字符串中最后一个非空白字符的索引。如果字符串为空或仅包含空白字符，则返回 -1。
     *
     * @param str - 要检查的字符串。
     * @param startIndex - 从哪个索引开始向前查找，默认是字符串的最后一个字符索引。
     * @returns 最后一个非空白字符的索引，或者 -1 如果没有这样的字符。
     */
    static lastNonWhitespaceIndex(str: string, startIndex: number = str.length - 1): number {
        for (let i = startIndex; i >= 0; i--) {
            const chCode = str.charCodeAt(i);
            if (chCode !== CharCode.Space && chCode !== CharCode.Tab) {
                return i;
            }
        }
        return -1;
    }

    /**
     * 返回字符串的缩进长度，即字符串中从开始到第一个非空白字符之间的空白字符数量。
     * 如果字符串为空或只包含空白字符，则返回字符串的总长度。
     *
     * @param str - 要测量缩进的字符串。
     * @returns 缩进长度。
     */
    static getIndentationLength(str: string): number {
        const idx = this.firstNonWhitespaceIndex(str);
        if (idx === -1) { return str.length; }
        return idx;
    }

    /**
     * 类似于 String.prototype.replace，但允许替换函数是异步的，并且可以返回 Promise。
     *
     * @param str - 要执行替换操作的原始字符串。
     * @param search - 用于匹配的正则表达式。
     * @param replacer - 异步替换函数，它接受与 String.prototype.replace 相同的参数，并返回一个 Promise<string>。
     * @returns 一个新的字符串，其中所有匹配的部分已经被替换函数处理过。
     */
    static async replaceAsync(str: string, search: RegExp, replacer: (match: string, ...args: any[]) => Promise<string>): Promise<string> {
        const parts: (string | Promise<string>)[] = [];
        let last = 0;
        for (const match of str.matchAll(search)) {
            parts.push(str.slice(last, match.index));
            if (match.index === undefined) {
                throw new Error('match.index should be defined');
            }

            last = match.index + match[0].length;
            parts.push(replacer(match[0], ...match.slice(1), match.index, str, match.groups));
        }

        parts.push(str.slice(last));

        const p = await Promise.all(parts);
        return p.join('');
    }




    /**
     * 比较两个字符串，并返回一个数值来表示它们之间的关系。
     *
     * @param a - 第一个要比较的字符串。
     * @param b - 第二个要比较的字符串。
     * @returns 如果 `a` 小于 `b`，则返回 -1；如果 `a` 大于 `b`，则返回 1；如果两者相等，则返回 0。
     */
    static compare(a: string, b: string): number {
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * 比较两个字符串的子串，并返回一个数值来表示它们之间的关系。
     *
     * @param a - 第一个要比较的字符串。
     * @param b - 第二个要比较的字符串。
     * @param aStart - `a` 字符串中开始比较的位置，默认是 0。
     * @param aEnd - `a` 字符串中停止比较的位置（不包括），默认是 `a.length`。
     * @param bStart - `b` 字符串中开始比较的位置，默认是 0。
     * @param bEnd - `b` 字符串中停止比较的位置（不包括），默认是 `b.length`。
     * @returns 如果 `a` 的子串小于 `b` 的子串，则返回 -1；如果 `a` 的子串大于 `b` 的子串，则返回 1；如果两者相等，则返回 0。
     */
    static compareSubstring(a: string, b: string, aStart: number = 0, aEnd: number = a.length, bStart: number = 0, bEnd: number = b.length): number {
        for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
            const codeA = a.charCodeAt(aStart);
            const codeB = b.charCodeAt(bStart);
            if (codeA < codeB) {
                return -1;
            } else if (codeA > codeB) {
                return 1;
            }
        }
        const aLen = aEnd - aStart;
        const bLen = bEnd - bStart;
        if (aLen < bLen) {
            return -1;
        } else if (aLen > bLen) {
            return 1;
        }
        return 0;
    }

    /**
     * 比较两个字符串，忽略大小写，并返回一个数值来表示它们之间的关系。
     *
     * @param a - 第一个要比较的字符串。
     * @param b - 第二个要比较的字符串。
     * @returns 如果 `a` 小于 `b`，则返回 -1；如果 `a` 大于 `b`，则返回 1；如果两者相等，则返回 0。
     */
    static compareIgnoreCase(a: string, b: string): number {
        return this.compareSubstringIgnoreCase(a, b, 0, a.length, 0, b.length);
    }

    /**
     * 比较两个字符串的子串，忽略大小写，并返回一个数值来表示它们之间的关系。
     *
     * @param a - 第一个要比较的字符串。
     * @param b - 第二个要比较的字符串。
     * @param aStart - `a` 字符串中开始比较的位置，默认是 0。
     * @param aEnd - `a` 字符串中停止比较的位置（不包括），默认是 `a.length`。
     * @param bStart - `b` 字符串中开始比较的位置，默认是 0。
     * @param bEnd - `b` 字符串中停止比较的位置（不包括），默认是 `b.length`。
     * @returns 如果 `a` 的子串小于 `b` 的子串，则返回 -1；如果 `a` 的子串大于 `b` 的子串，则返回 1；如果两者相等，则返回 0。
     */
    static compareSubstringIgnoreCase(a: string, b: string, aStart: number = 0, aEnd: number = a.length, bStart: number = 0, bEnd: number = b.length): number {

        for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {

            let codeA = a.charCodeAt(aStart);
            let codeB = b.charCodeAt(bStart);

            if (codeA === codeB) {
                // 如果字符相同，则继续比较下一个字符
                continue;
            }

            if (codeA >= 128 || codeB >= 128) {
                // 如果存在非ASCII字符，则回退到使用 toLowerCase 方法进行比较
                return this.compareSubstring(a.toLowerCase(), b.toLowerCase(), aStart, aEnd, bStart, bEnd);
            }

            // 将ASCII小写字母转换为大写字母以实现忽略大小写的比较
            // [97-122] (小写ASCII) --> [65-90] (大写ASCII)
            if (this.isLowerAsciiLetter(codeA)) {
                codeA -= 32;
            }
            if (this.isLowerAsciiLetter(codeB)) {
                codeB -= 32;
            }

            // 比较两个字符的编码点
            const diff = codeA - codeB;
            if (diff !== 0) {
                return diff;
            }
        }

        const aLen = aEnd - aStart;
        const bLen = bEnd - bStart;

        if (aLen < bLen) {
            return -1;
        } else if (aLen > bLen) {
            return 1;
        }

        return 0;
    }

    /**
     * 检查给定的字符编码是否为ASCII小写字母。
     *
     * @param code - 要检查的字符编码。
     * @returns 如果 `code` 是ASCII小写字母，则返回 true；否则返回 false。
     */
    static isLowerAsciiLetter(code: number): boolean {
        return code >= 97 && code <= 122; // 'a' -> 'z'
    }





    /**
     * 检查给定的字符编码是否为ASCII数字。
     *
     * @param code - 要检查的字符编码。
     * @returns 如果 `code` 是ASCII数字（'0' 到 '9'），则返回 true；否则返回 false。
     */
    static isAsciiDigit(code: number): boolean {
        return code >= CharCode.Digit0 && code <= CharCode.Digit9;
    }



    /**
     * 检查给定的字符编码是否为ASCII大写字母。
     *
     * @param code - 要检查的字符编码。
     * @returns 如果 `code` 是ASCII大写字母（'A' 到 'Z'），则返回 true；否则返回 false。
     */
    static isUpperAsciiLetter(code: number): boolean {
        return code >= CharCode.A && code <= CharCode.Z;
    }

    /**
     * 比较两个字符串，忽略大小写，并判断它们是否相等。
     *
     * @param a - 第一个要比较的字符串。
     * @param b - 第二个要比较的字符串。
     * @returns 如果 `a` 和 `b` 忽略大小写后相等，则返回 true；否则返回 false。
     */
    static equalsIgnoreCase(a: string, b: string): boolean {
        return a.length === b.length && this.compareSubstringIgnoreCase(a, b) === 0;
    }

    /**
     * 检查一个字符串是否以另一个字符串开头，忽略大小写。
     *
     * @param str - 要检查的源字符串。
     * @param candidate - 要匹配的候选前缀字符串。
     * @returns 如果 `str` 以 `candidate` 开头（忽略大小写），则返回 true；否则返回 false。
     */
    static startsWithIgnoreCase(str: string, candidate: string): boolean {
        const candidateLength = candidate.length;
        if (candidateLength > str.length) {
            return false;
        }

        return this.compareSubstringIgnoreCase(str, candidate, 0, candidateLength) === 0;
    }

    /**
     * 计算两个字符串的公共前缀长度。
     *
     * @param a - 第一个字符串。
     * @param b - 第二个字符串。
     * @returns 两个字符串的公共前缀长度。
     */
    static commonPrefixLength(a: string, b: string): number {
        const len = Math.min(a.length, b.length);
        let i: number;

        for (i = 0; i < len; i++) {
            if (a.charCodeAt(i) !== b.charCodeAt(i)) {
                return i;
            }
        }

        return len;
    }

    /**
     * 计算两个字符串的公共后缀长度。
     *
     * @param a - 第一个字符串。
     * @param b - 第二个字符串。
     * @returns 两个字符串的公共后缀长度。
     */
    static commonSuffixLength(a: string, b: string): number {
        const len = Math.min(a.length, b.length);
        let i: number;

        const aLastIndex = a.length - 1;
        const bLastIndex = b.length - 1;

        for (i = 0; i < len; i++) {
            if (a.charCodeAt(aLastIndex - i) !== b.charCodeAt(bLastIndex - i)) {
                return i;
            }
        }

        return len;
    }

    /**
     * 检查给定的字符编码是否为高代理项（High Surrogate）。
     * 
     * 根据 Unicode 标准，代理对（Surrogate Pair）用于表示超出基本多语言平面（BMP）的字符。
     * 高代理项的范围是 U+D800 到 U+DBFF。
     *
     * @param charCode - 要检查的字符编码。
     * @returns 如果 `charCode` 是高代理项，则返回 true；否则返回 false。
     * @see http://en.wikipedia.org/wiki/Surrogate_pair
     */
    static isHighSurrogate(charCode: number): boolean {
        return (0xD800 <= charCode && charCode <= 0xDBFF);
    }

    /**
     * 检查给定的字符编码是否为低代理项（Low Surrogate）。
     * 
     * 根据 Unicode 标准，代理对（Surrogate Pair）用于表示超出基本多语言平面（BMP）的字符。
     * 低代理项的范围是 U+DC00 到 U+DFFF。
     *
     * @param charCode - 要检查的字符编码。
     * @returns 如果 `charCode` 是低代理项，则返回 true；否则返回 false。
     * @see http://en.wikipedia.org/wiki/Surrogate_pair
     */
    static isLowSurrogate(charCode: number): boolean {
        return (0xDC00 <= charCode && charCode <= 0xDFFF);
    }

    /**
     * 计算由高代理项和低代理项组成的码位（Code Point）。
     * 
     * 根据 Unicode 标准，代理对（Surrogate Pair）用于表示超出基本多语言平面（BMP）的字符。
     * 码位的计算公式为：(highSurrogate - 0xD800) * 2^10 + (lowSurrogate - 0xDC00) + 0x10000。
     *
     * @param highSurrogate - 高代理项的字符编码。
     * @param lowSurrogate - 低代理项的字符编码。
     * @returns 由高代理项和低代理项组成的码位。
     * @see http://en.wikipedia.org/wiki/Surrogate_pair
     */


    static computeCodePoint(highSurrogate: number, lowSurrogate: number): number {
        return ((highSurrogate - 0xD800) << 10) + (lowSurrogate - 0xDC00) + 0x10000;
    }

    /**
     * 获取从指定偏移量开始的码位（Code Point）。
     * 
     * 该函数会处理代理对的情况。如果当前字符是一个高代理项，并且紧随其后的字符是一个低代理项，
     * 则返回由这两个代理项组成的码位；否则返回单个字符的码位。
     *
     * @param str - 包含字符的字符串。
     * @param len - 字符串的长度。
     * @param offset - 开始获取码位的偏移量。
     * @returns 从 `offset` 开始的码位。
     */
    static getNextCodePoint(str: string, len: number, offset: number): number {
        const charCode = str.charCodeAt(offset);
        if (this.isHighSurrogate(charCode) && offset + 1 < len) {
            const nextCharCode = str.charCodeAt(offset + 1);
            if (this.isLowSurrogate(nextCharCode)) {
                return this.computeCodePoint(charCode, nextCharCode);
            }
        }
        return charCode;
    }


    /**
      * 获取在指定偏移量之前的码位（Code Point）。
      * 
      * 该函数会处理代理对的情况。如果当前字符是一个低代理项，并且它前面的字符是一个高代理项，
      * 则返回由这两个代理项组成的码位；否则返回单个字符的码位。
      *
      * @param str - 包含字符的字符串。
      * @param offset - 结束获取码位的偏移量（码位结束在此偏移量之前）。
      * @returns 在 `offset` 之前的码位。
      */
    static getPrevCodePoint(str: string, offset: number): number {
        const charCode = str.charCodeAt(offset - 1);
        if (this.isLowSurrogate(charCode) && offset > 1) {
            const prevCharCode = str.charCodeAt(offset - 2);
            if (this.isHighSurrogate(prevCharCode)) {
                return this.computeCodePoint(prevCharCode, charCode);
            }
        }
        return charCode;
    }





    /**
     * 返回从给定偏移量开始的下一个图素的长度。
     *
     * @param str - 输入字符串。
     * @param initialOffset - 开始位置的偏移量。
     * @returns 组成下一个图素的码位数。
     */
    static nextCharLength(str: string, initialOffset: number): number {
        const iterator = new GraphemeIterator(str, initialOffset);
        return iterator.nextGraphemeLength();
    }

    /**
     * 返回从给定偏移量结束的前一个图素的长度。
     *
     * @param str - 输入字符串。
     * @param initialOffset - 结束位置的偏移量。
     * @returns 组成前一个图素的码位数。
     */
    static prevCharLength(str: string, initialOffset: number): number {
        const iterator = new GraphemeIterator(str, initialOffset);
        return iterator.prevGraphemeLength();
    }

    /**
     * 确定包含指定偏移量的图素的起始和结束偏移量。
     *
     * @param str - 输入字符串。
     * @param offset - 要查找边界的偏移量。
     * @returns 包含起始和结束偏移量的元组。
     */
    static getCharContainingOffset(str: string, offset: number): [number, number] {
        if (offset > 0 && StringsUtils.isLowSurrogate(str.charCodeAt(offset))) {
            offset--;
        }
        const endOffset = offset + StringsUtils.nextCharLength(str, offset);
        const startOffset = endOffset - StringsUtils.prevCharLength(str, endOffset);
        return [startOffset, endOffset];
    }

    /**
     * 计算字符串中的图素总数。
     *
     * @param str - 输入字符串。
     * @returns 字符串中的图素总数。
     */
    static charCount(str: string): number {
        const iterator = new GraphemeIterator(str);
        let length = 0;
        while (!iterator.eol()) {
            length++;
            iterator.nextGraphemeLength();
        }
        return length;
    }

    /**
     * 生成一个匹配右到左（RTL）字符的正则表达式。
     *
     * @returns 匹配RTL字符的正则表达式。
     */
    static makeContainsRtl(): RegExp {
        // Generated using https://github.com/alexdima/unicode-utils/blob/main/rtl-test.js
        return /(?:[\u05BE\u05C0\u05C3\u05C6\u05D0-\u05F4\u0608\u060B\u060D\u061B-\u064A\u066D-\u066F\u0671-\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u0710\u0712-\u072F\u074D-\u07A5\u07B1-\u07EA\u07F4\u07F5\u07FA\u07FE-\u0815\u081A\u0824\u0828\u0830-\u0858\u085E-\u088E\u08A0-\u08C9\u200F\uFB1D\uFB1F-\uFB28\uFB2A-\uFD3D\uFD50-\uFDC7\uFDF0-\uFDFC\uFE70-\uFEFC]|\uD802[\uDC00-\uDD1B\uDD20-\uDE00\uDE10-\uDE35\uDE40-\uDEE4\uDEEB-\uDF35\uDF40-\uDFFF]|\uD803[\uDC00-\uDD23\uDE80-\uDEA9\uDEAD-\uDF45\uDF51-\uDF81\uDF86-\uDFF6]|\uD83A[\uDC00-\uDCCF\uDD00-\uDD43\uDD4B-\uDFFF]|\uD83B[\uDC00-\uDEBB])/;
    }



    /**
     * Returns true if `str` contains any Unicode character that is classified as "R" or "AL".
     *
     * @param str - 输入字符串。
     * @returns 如果字符串包含任何被分类为 "R" 或 "AL" 的 Unicode 字符，则返回 true。
     */
    static containsRTL(str: string): boolean {
        if (!StringsUtils.CONTAINS_RTL) {
            StringsUtils.CONTAINS_RTL = StringsUtils.makeContainsRtl();
        }
        return StringsUtils.CONTAINS_RTL.test(str);
    }

    /**
     * Returns true if `str` contains only basic ASCII characters in the range 32 - 126 (including 32 and 126) or \n, \r, \t.
     *
     * @param str - 输入字符串。
     * @returns 如果字符串仅包含范围在 32 到 126（包括 32 和 126）的基本 ASCII 字符或 \n, \r, \t，则返回 true。
     */
    static isBasicASCII(str: string): boolean {
        return StringsUtils.IS_BASIC_ASCII.test(str);
    }
    /**
     * Returns true if `str` contains unusual line terminators, like LS or PS.
     *
     * @param str - 输入字符串。
     * @returns 如果字符串包含非标准换行符（如 LS 或 PS），则返回 true。
     */
    static containsUnusualLineTerminators(str: string): boolean {
        return StringsUtils.UNUSUAL_LINE_TERMINATORS.test(str);
    }

    /**
     * Returns true if the given character code represents a full-width character.
     *
     * @param charCode - 要检查的字符码位。
     * @returns 如果字符是全角字符，则返回 true。
     */
    static isFullWidthCharacter(charCode: number): boolean {
        // Do a cheap trick to better support wrapping of wide characters, treat them as 2 columns
        // http://jrgraphix.net/research/unicode_blocks.php
        //          2E80 - 2EFF   CJK Radicals Supplement
        //          2F00 - 2FDF   Kangxi Radicals
        //          2FF0 - 2FFF   Ideographic Description Characters
        //          3000 - 303F   CJK Symbols and Punctuation
        //          3040 - 309F   Hiragana
        //          30A0 - 30FF   Katakana
        //          3100 - 312F   Bopomofo
        //          3130 - 318F   Hangul Compatibility Jamo
        //          3190 - 319F   Kanbun
        //          31A0 - 31BF   Bopomofo Extended
        //          31F0 - 31FF   Katakana Phonetic Extensions
        //          3200 - 32FF   Enclosed CJK Letters and Months
        //          3300 - 33FF   CJK Compatibility
        //          3400 - 4DBF   CJK Unified Ideographs Extension A
        //          4DC0 - 4DFF   Yijing Hexagram Symbols
        //          4E00 - 9FFF   CJK Unified Ideographs
        //          A000 - A48F   Yi Syllables
        //          A490 - A4CF   Yi Radicals
        //          AC00 - D7AF   Hangul Syllables
        // [IGNORE] D800 - DB7F   High Surrogates
        // [IGNORE] DB80 - DBFF   High Private Use Surrogates
        // [IGNORE] DC00 - DFFF   Low Surrogates
        // [IGNORE] E000 - F8FF   Private Use Area
        //          F900 - FAFF   CJK Compatibility Ideographs
        // [IGNORE] FB00 - FB4F   Alphabetic Presentation Forms
        // [IGNORE] FB50 - FDFF   Arabic Presentation Forms-A
        // [IGNORE] FE00 - FE0F   Variation Selectors
        // [IGNORE] FE20 - FE2F   Combining Half Marks
        // [IGNORE] FE30 - FE4F   CJK Compatibility Forms
        // [IGNORE] FE50 - FE6F   Small Form Variants
        // [IGNORE] FE70 - FEFF   Arabic Presentation Forms-B
        //          FF00 - FFEF   Halfwidth and Fullwidth Forms
        //               [https://en.wikipedia.org/wiki/Halfwidth_and_fullwidth_forms]
        //               of which FF01 - FF5E fullwidth ASCII of 21 to 7E
        // [IGNORE]    and FF65 - FFDC halfwidth of Katakana and Hangul
        // [IGNORE] FFF0 - FFFF   Specials
        return (
            (charCode >= 0x2E80 && charCode <= 0xD7AF)
            || (charCode >= 0xF900 && charCode <= 0xFAFF)
            || (charCode >= 0xFF01 && charCode <= 0xFF5E)
        );
    }

    /**
     * A fast function (therefore imprecise) to check if code points are emojis.
     * Generated using https://github.com/alexdima/unicode-utils/blob/main/emoji-test.js
     *
     * @param x - 要检查的字符码位。
     * @returns 如果字符是表情符号，则返回 true。
     */
    static isEmojiImprecise(x: number): boolean {
        return (
            (x >= 0x1F1E6 && x <= 0x1F1FF) || (x === 8986) || (x === 8987) || (x === 9200)
            || (x === 9203) || (x >= 9728 && x <= 10175) || (x === 11088) || (x === 11093)
            || (x >= 127744 && x <= 128591) || (x >= 128640 && x <= 128764)
            || (x >= 128992 && x <= 129008) || (x >= 129280 && x <= 129535)
            || (x >= 129648 && x <= 129782)
        );
    }

    /**
     * Given a string and a max length returns a shortened version. Shortening
     * happens at favorable positions - such as whitespace or punctuation characters.
     * The return value can be longer than the given value of `n`. Leading whitespace is always trimmed.
     *
     * @param text - 输入字符串。
     * @param n - 最大长度。
     * @param prefix - 结果字符串前缀，默认为空字符串。
     * @returns 缩短后的字符串。
     */
    static lcut(text: string, n: number, prefix = '') {
        const trimmed = text.trimStart();
        if (trimmed.length < n) return trimmed;
        const re = /\b/g;
        let i = 0;
        while (re.test(trimmed)) {
            if (trimmed.length - re.lastIndex < n) {
                break;
            }
            i = re.lastIndex;
            re.lastIndex += 1;
        }
        if (i === 0) return trimmed;
        return prefix + trimmed.substring(i).trimStart();
    }


    // Escape codes, compiled from https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h3-Functions-using-CSI-_-ordered-by-the-final-character_s_
    // Plus additional markers for custom `\x1b]...\x07` instructions.
    static CSI_SEQUENCE = /(?:(?:\x1b$|\x9B)[=?>!]?[\d;:]*["$#'* ]?[a-zA-Z@^`{}|~])|(:?\x1b$.*?\x07)/g;

    /**
     * 遍历包含 ANSI 控制序列（Control Sequence Introducers - CSI）的字符串部分。
     * 该函数生成的对象包含原始字符串的段落，区分普通文本和 ANSI 控制序列。
     *
     * @param str 可能包含 ANSI 控制序列的输入字符串。
     * @yields 一个对象，包含两个属性：`isCode`，指示段落是否为控制序列的布尔值；
     *         和 `str`，即字符串的实际段落。
     */
    static *forAnsiStringParts(str: string) {
        let last = 0;
        for (const match of str.matchAll(StringsUtils.CSI_SEQUENCE)) {
            if (last !== match.index) {
                yield { isCode: false, str: str.substring(last, match.index) };
            }

            yield { isCode: true, str: match[0] };
            last = match.index + match[0].length;
        }

        if (last !== str.length) {
            yield { isCode: false, str: str.substring(last) };
        }
    }

    /**
     * 从提供的字符串中移除所有 ANSI 控制序列。
     *
     * @param str 要移除 ANSI 控制序列的字符串。
     * @returns 一个新的没有 ANSI 控制序列的字符串。
     *
     * @example
     * removeAnsiEscapeCodes('\u001b[31mHello, World!\u001b[0m');
     * // 'Hello, World!'
     */
    static removeAnsiEscapeCodes(str: string): string {
        if (str) {
            str = str.replace(StringsUtils.CSI_SEQUENCE, '');
        }
        return str;
    }

    static PROMPT_NON_PRINTABLE = /\\$.*?\\$/g;

    /**
     * 从类似 UNIX 样式的提示符字符串（如 `$PS1`）中移除 ANSI 控制序列。
     * 这个函数特别适用于处理命令行提示符中的颜色和样式设置。
     *
     * @param str 要移除 ANSI 控制序列的字符串。
     * @returns 一个新的没有 ANSI 控制序列的字符串。
     *
     * @example
     * removeAnsiEscapeCodesFromPrompt('\n\$\u001b[01;34m\$\\w\$\u001b[00m\$\n\$\u001b[1;32m\$> \$\u001b[0m\$');
     * // '\n\\w\n> '
     */
    removeAnsiEscapeCodesFromPrompt(str: string): string {
        return StringsUtils.removeAnsiEscapeCodes(str).replace(StringsUtils.PROMPT_NON_PRINTABLE, '');
    }

    // -- UTF-8 BOM

    static UTF8_BOM_CHARACTER = String.fromCharCode(0xFEFF);

    /**
     * 检查字符串是否以 UTF-8 BOM 字符开头。
     *
     * @param str 要检查的字符串。
     * @returns 如果字符串以 UTF-8 BOM 开头，则返回 `true`；否则返回 `false`。
     */
    static startsWithUTF8BOM(str: string): boolean {
        return !!(str && str.length > 0 && str.charCodeAt(0) === 0xFEFF);
    }

    /**
     * 从字符串中移除 UTF-8 BOM 字符。
     *
     * @param str 要处理的字符串。
     * @returns 移除 UTF-8 BOM 后的新字符串。
     */
    static stripUTF8BOM(str: string): string {
        return StringsUtils.startsWithUTF8BOM(str) ? str.substr(1) : str;
    }

    /**
     * 检查查询字符串中的字符是否在目标字符串中出现。字符不需要在目标字符串中连续出现。
     *
     * @param target 目标字符串。
     * @param query 查询字符串。
     * @returns 如果目标字符串包含查询字符串的所有字符，则返回 `true`；否则返回 `false`。
     */
    static fuzzyContains(target: string, query: string): boolean {
        if (!target || !query) {
            return false; // 如果目标或查询字符串为空，则提前返回
        }
        if (target.length < query.length) {
            return false; // 查询字符串不可能被包含在更短的目标字符串中
        }
        const queryLen = query.length;
        const targetLower = target.toLowerCase();
        let index = 0;
        let lastIndexOf = -1;
        while (index < queryLen) {
            const indexOf = targetLower.indexOf(query[index], lastIndexOf + 1);
            if (indexOf < 0) {
                return false;
            }
            lastIndexOf = indexOf;
            index++;
        }
        return true;
    }

    /**
     * 检查目标字符串中是否包含大写字母。可以选择忽略转义字符。
     *
     * @param target 目标字符串。
     * @param ignoreEscapedChars 是否忽略转义字符，默认为 `false`。
     * @returns 如果目标字符串中包含大写字母，则返回 `true`；否则返回 `false`。
     */
    static containsUppercaseCharacter(target: string, ignoreEscapedChars = false): boolean {
        if (!target) {
            return false;
        }

        if (ignoreEscapedChars) {
            target = target.replace(/\\./g, '');
        }

        return target.toLowerCase() !== target;
    }

    /**
     * 将字符串的第一个字母转换为大写。
     *
     * @param str 要处理的字符串。
     * @returns 第一个字母大写后的新字符串。
     */
    static uppercaseFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * 数字金额格式过滤(转汉字大写)
     * 例如：12000.34 => "壹万贰仟零叁角肆分"
     * @param {number} num - 被转换数字
     * @returns {string} 汉字大写表示的金额
     * 
     * 示例:
     * ```typescript
     * console.log(digitUppercase(12000.34)); // 输出: "壹万贰仟零叁角肆分"
     * console.log(digitUppercase(-12000.34)); // 输出: "欠壹万贰仟零叁角肆分"
     * console.log(digitUppercase(100.01)); // 输出: "壹佰元零壹分"
     * ```
     */

    static digitUppercase(num: number): string {
        const reg = /((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/;
        if (!reg.test(String(num))) {
            return '请输入正确的金额格式';
        } else {
            const fraction = ['角', '分'];
            const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
            const unit = [
                ['元', '万', '亿', '兆'],
                ['', '拾', '佰', '仟'],
            ];
            let head = num < 0 ? '欠' : '';
            num = Math.abs(num);
            let s = '';
            fraction.forEach((item, index) => {
                s += (digit[Math.floor(num * 10 * Math.pow(10, index)) % 10] + item).replace(/零./, '');
            });
            s = s || '整';
            num = Math.floor(num);
            for (let i = 0; i < unit[0].length && num > 0; i++) {
                let p = '';
                for (let j = 0; j < unit[1].length && num > 0; j++) {
                    p = digit[num % 10] + unit[1][j] + p;
                    num = Math.floor(num / 10);
                }
                s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
            }
            return (
                head + s.replace(/(零.)*零元/, '元')
                    .replace(/(零.)+/g, '零')
                    .replace(/^整$/, '零元整')
            );
        }
    }

    /**
     * 数字缩写格式化
     * 例如：10000 => "10k"
     * @param {number} num - 要格式化的数字
     * @param {number} digits - 小数位数，默认为2
     * @returns {string} 缩写后的数字字符串
     * 
     * 示例:
     * ```typescript
     * console.log(numberFormatter(10000)); // 输出: "10k"
     * console.log(numberFormatter(1500000, 1)); // 输出: "1.5M"
     * console.log(numberFormatter(1234567890)); // 输出: "1.23G"
     * ```
     */
    static numberFormatter(num: number, digits: number = 2): string {
        const si = [
            { value: 1e18, symbol: 'E' },
            { value: 1e15, symbol: 'P' },
            { value: 1e12, symbol: 'T' },
            { value: 1e9, symbol: 'G' },
            { value: 1e6, symbol: 'M' },
            { value: 1e3, symbol: 'k' },
        ];
        for (const entry of si) {
            if (num >= entry.value) {
                return (num / entry.value + 0.1).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + entry.symbol;
            }
        }
        return num.toString();
    }

    /**
     * 千分位格式化
     * 例如：10000 => "10,000"
     * @param {number} num - 要格式化的数字
     * @returns {string} 千分位格式化的数字字符串
     * 
     * 示例:
     * ```typescript
     * console.log(toThousandFilter(10000)); // 输出: "10,000"
     * console.log(toThousandFilter(-1000000)); // 输出: "-1,000,000"
     * ```
     */
    static toThousandFilter(num: number): string {
        return (+num || 0).toString().replace(/^-?\d+/g, (m) => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','));
    }

    /**
     * 数字金额格式过滤（货币符号）
     * 例如：10000 => "￥10,000.00"
     * @param {number} num - 被转换数字
     * @param {number} n - 保留小数位，默认为2
     * @returns {string} 格式化后的金额字符串
     * 
     * 示例:
     * ```typescript
     * console.log(currencyFilter(10000)); // 输出: "￥10,000.00"
     * console.log(currencyFilter(-123456.789, 3)); // 输出: "￥ -123,456.789"
     * ```
     */
    static currencyFilter(num: number, n: number = 2): string {
        n = n > 0 && n <= 20 ? n : 2;
        if (num === null || num === undefined) {
            return '';
        }
        const absNum = Math.abs(num);
        const formattedNum = absNum.toFixed(n);
        const parts = formattedNum.split('.');
        const integerPart = parts[0].split('').reverse();
        const decimalPart = parts[1];
        let thousandSeparated = '';
        for (let i = 0; i < integerPart.length; i++) {
            thousandSeparated += integerPart[i] + ((i + 1) % 3 === 0 && i + 1 !== integerPart.length ? ',' : '');
        }
        const reversedIntegerPart = thousandSeparated.split('').reverse().join('');
        return num < 0
            ? `￥ -${reversedIntegerPart}.${decimalPart}`
            : `￥ ${reversedIntegerPart}.${decimalPart}`;
    }


    /**
     * 金额格式化（通用）
     * @param {number} value - 传进来的值
     * @param {number} decimals - 小数位数，默认为2
     * @param {string} symbol - 货币符号，默认为"¥"
     * @returns {string} 格式化后的金额字符串
     * 
     * 示例:
     * ```typescript
     * console.log(currency(10000)); // 输出: "¥10,000.00"
     * console.log(currency(123456.789, 3, '$')); // 输出: "$123,456.789"
     * ```
     */
    static currency(value: number, decimals: number = 2, symbol: string = '¥'): string {
        value = value ? parseFloat(value.toFixed(decimals)) : 0;
        if (!isFinite(value) || (!value && value !== 0)) return '';
        decimals = decimals != null ? decimals : 2;
        const stringified = Math.abs(value).toFixed(decimals);
        const _int = decimals ? stringified.slice(0, -1 - decimals) : stringified;
        const i = _int.length % 3;
        const head = i > 0 ? _int.slice(0, i) + (_int.length > 3 ? ',' : '') : '';
        const radix = decimals ? stringified.slice(-1 - decimals) : '';
        const sign = value < 0 ? '-' : '';
        const digitsRE = /(\d{3})(?=\d)/g;
        const digits = _int.slice(i).replace(digitsRE, '$1,');

        return `${sign}${symbol}${head}${digits}${radix}`;
    }




    /**
     * 将驼峰命名法的字符串转换为下划线命名法。
     * 
     * @param {string} str - 需要转换的驼峰命名法字符串。
     * @returns {string} - 转换后的下划线命名法字符串。
     * 
     * 示例:
     * ```typescript
     * console.log(humpToUnderline('camelCaseString')); // 输出: "camel-case-string"
     * ```
     */
    static humpToUnderline = (str: string): string => {
        return str.replace(/([A-Z])/g, '-$1').toLowerCase();
    };

    /**
     * 将下划线命名法的字符串转换为驼峰命名法。
     * 
     * @param {string | undefined} str - 需要转换的下划线命名法字符串。
     * @returns {string} - 转换后的驼峰命名法字符串。如果输入为空或未定义，则返回空字符串。
     * 
     * 示例:
     * ```typescript
     * console.log(underlineToHump('under_score_string')); // 输出: "underScoreString"
     * ```
     */
    static underlineToHump = (str?: string): string => {
        if (!str) return '';
        return str.replace(/\-(\w)/g, (_, letter) => letter.toUpperCase());
    };

    /**
     * Converts the first character of string to upper case and the remaining to lower case.
     *
     * @template T - Literal type of the string.
     * @param {T} str - The string to be converted to uppercase.
     * @returns {Capitalize<T>} - The capitalized string.
     *
     * @example
     * const result = capitalize('fred') // returns 'Fred'
     * const result2 = capitalize('FRED') // returns 'Fred'
     */

    static capitalize = <T extends string>(str: T): Capitalize<T> => {
        return (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()) as Capitalize<T>;
    };

    /**
     * @description 字符串中的url替换为<a>标签
     * @param url 目标字符串
     * @param className <a>标签的class名称
     * @returns {String} 替换后的html字符串
     */
    static urlToLink = (url: string, className = ''): string => {
        const reg = /((((https?|ftp?):(?:\/\/)?)(?:[-;:&=\+\$]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\?\+=&;:%!\/@.\w_]*)#?(?:[-\+=&;%!\?\/@.\w_]*))?)/ig
        return url.replace(reg, (href: string) => {
            return `<a href="${href}" class="${className}" target="_blank">${href}</a>`
        })
    }


    /**
  * 对给定的字符串进行语法高亮处理。
  * 
  * @param str 待处理的源代码字符串
  * @param lang 源代码的语言，默认为"js"
  * @param style 自定义样式对象，默认为空对象
  * @returns 返回经过HTML标签包裹以实现语法高亮的字符串
  */
    static highlight(str: string, lang: any = "js", style: StyleDef = {}): string {
        const defStyle = {
            comment: "color:#63a35c;",
            string: "color:#183691;",
            number: "color:#0086b3;",
            keyword: "color:#a71d5d;",
            operator: "color:#994500;",
        };
        /*** 定义默认样式的接口。*/
        style = {
            ...style,
            ...defStyle
        }
        str = str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        lang = language[lang];
        let subLangSi = 0;
        const subLangs: any = [];
        ArrayUtils.eachArrayOrObject(lang, (val) => {
            if (!val.language) return;
            str = str.replace(val.re, function ($1, $2) {
                if (!$2) {
                    return $1;
                }
                subLangs[subLangSi++] = StringsUtils.highlight($2, val.language, style);
                return $1.replace($2, "___subtmpl" + (subLangSi - 1) + "___");
            });
        });
        ArrayUtils.eachArrayOrObject(lang, (val, key) => {
            if (language[val.language]) return;
            str = str.replace(val.re, "___" + key + "___$1___end" + key + "___");
        });

        const levels: any = [];
        str = str.replace(/___(?!subtmpl)\w+?___/g, function ($0) {
            const end = $0.substr(3, 3) === "end",
                tag = (!end ? $0.substr(3) : $0.substr(6)).replace(/_/g, ""),
                lastTag = levels.length > 0 ? levels[levels.length - 1] : null;

            if (
                !end &&
                (lastTag == null ||
                    tag == lastTag ||
                    (lastTag != null &&
                        lang[lastTag] &&
                        lang[lastTag].embed != undefined &&
                        lang[lastTag].embed.indexOf(tag) > -1))
            ) {
                levels.push(tag);
                return $0;
            } else if (end && tag == lastTag) {
                levels.pop();
                return $0;
            }
            return "";
        });
        ArrayUtils.eachArrayOrObject(lang, (val, key) => {
            const s = style[val.style] ? ` style="${style[val.style]}"` : "";
            str = str
                .replace(new RegExp("___end" + key + "___", "g"), "</span>")
                .replace(
                    new RegExp("___" + key + "___", "g"),
                    `<span class="${val.style}"${s}>`
                );
        });
        ArrayUtils.eachArrayOrObject(lang, (val) => {
            if (!val.language) return;
            str = str.replace(/___subtmpl\d+___/g, function ($tmpl) {
                const i = parseInt($tmpl.replace(/___subtmpl(\d+)___/, "$1"), 10);
                return subLangs[i];
            });
        });
        return str;
    }


}

class CodePointIterator {

    private readonly _str: string;
    private readonly _len: number;
    private _offset: number;

    public get offset(): number {
        return this._offset;
    }

    constructor(str: string, offset: number = 0) {
        this._str = str;
        this._len = str.length;
        this._offset = offset;
    }

    public setOffset(offset: number): void {
        this._offset = offset;
    }

    public prevCodePoint(): number {
        const codePoint = StringsUtils.getPrevCodePoint(this._str, this._offset);
        this._offset -= (codePoint >= Constants.UNICODE_SUPPLEMENTARY_PLANE_BEGIN ? 2 : 1);
        return codePoint;
    }

    public nextCodePoint(): number {
        const codePoint = StringsUtils.getNextCodePoint(this._str, this._len, this._offset);
        this._offset += (codePoint >= Constants.UNICODE_SUPPLEMENTARY_PLANE_BEGIN ? 2 : 1);
        return codePoint;
    }

    public eol(): boolean {
        return (this._offset >= this._len);
    }
}

class GraphemeIterator {
    private readonly _iterator: CodePointIterator;
    public get offset(): number {
        return this._iterator.offset;
    }
    constructor(str: string, offset: number = 0) {
        this._iterator = new CodePointIterator(str, offset);
    }
    public nextGraphemeLength(): number {
        const graphemeBreakTree = GraphemeBreakTree.getInstance();
        const iterator = this._iterator;
        const initialOffset = iterator.offset;
        let graphemeBreakType = graphemeBreakTree.getGraphemeBreakType(iterator.nextCodePoint());
        while (!iterator.eol()) {
            const offset = iterator.offset;
            const nextGraphemeBreakType = graphemeBreakTree.getGraphemeBreakType(iterator.nextCodePoint());
            if (breakBetweenGraphemeBreakType(graphemeBreakType, nextGraphemeBreakType)) {
                // move iterator back
                iterator.setOffset(offset);
                break;
            }
            graphemeBreakType = nextGraphemeBreakType;
        }
        return (iterator.offset - initialOffset);
    }

    public prevGraphemeLength(): number {
        const graphemeBreakTree = GraphemeBreakTree.getInstance();
        const iterator = this._iterator;
        const initialOffset = iterator.offset;
        let graphemeBreakType = graphemeBreakTree.getGraphemeBreakType(iterator.prevCodePoint());
        while (iterator.offset > 0) {
            const offset = iterator.offset;
            const prevGraphemeBreakType = graphemeBreakTree.getGraphemeBreakType(iterator.prevCodePoint());
            if (breakBetweenGraphemeBreakType(prevGraphemeBreakType, graphemeBreakType)) {
                // move iterator back
                iterator.setOffset(offset);
                break;
            }
            graphemeBreakType = prevGraphemeBreakType;
        }
        return (initialOffset - iterator.offset);
    }

    public eol(): boolean {
        return this._iterator.eol();
    }
}

const enum GraphemeBreakType {
    Other = 0,
    Prepend = 1,
    CR = 2,
    LF = 3,
    Control = 4,
    Extend = 5,
    Regional_Indicator = 6,
    SpacingMark = 7,
    L = 8,
    V = 9,
    T = 10,
    LV = 11,
    LVT = 12,
    ZWJ = 13,
    Extended_Pictographic = 14
}

class GraphemeBreakTree {

    private static _INSTANCE: GraphemeBreakTree | null = null;
    public static getInstance(): GraphemeBreakTree {
        if (!GraphemeBreakTree._INSTANCE) {
            GraphemeBreakTree._INSTANCE = new GraphemeBreakTree();
        }
        return GraphemeBreakTree._INSTANCE;
    }

    private readonly _data: number[];

    constructor() {
        this._data = getGraphemeBreakRawData();
    }

    public getGraphemeBreakType(codePoint: number): GraphemeBreakType {
        // !!! Let's make 7bit ASCII a bit faster: 0..31
        if (codePoint < 32) {
            if (codePoint === CharCode.LineFeed) {
                return GraphemeBreakType.LF;
            }
            if (codePoint === CharCode.CarriageReturn) {
                return GraphemeBreakType.CR;
            }
            return GraphemeBreakType.Control;
        }
        // !!! Let's make 7bit ASCII a bit faster: 32..126
        if (codePoint < 127) {
            return GraphemeBreakType.Other;
        }

        const data = this._data;
        const nodeCount = data.length / 3;
        let nodeIndex = 1;
        while (nodeIndex <= nodeCount) {
            if (codePoint < data[3 * nodeIndex]) {
                // go left
                nodeIndex = 2 * nodeIndex;
            } else if (codePoint > data[3 * nodeIndex + 1]) {
                // go right
                nodeIndex = 2 * nodeIndex + 1;
            } else {
                // hit
                return data[3 * nodeIndex + 2];
            }
        }

        return GraphemeBreakType.Other;
    }
}

function getGraphemeBreakRawData(): number[] {
    // generated using https://github.com/alexdima/unicode-utils/blob/main/grapheme-break.js
    return JSON.parse('[0,0,0,51229,51255,12,44061,44087,12,127462,127487,6,7083,7085,5,47645,47671,12,54813,54839,12,128678,128678,14,3270,3270,5,9919,9923,14,45853,45879,12,49437,49463,12,53021,53047,12,71216,71218,7,128398,128399,14,129360,129374,14,2519,2519,5,4448,4519,9,9742,9742,14,12336,12336,14,44957,44983,12,46749,46775,12,48541,48567,12,50333,50359,12,52125,52151,12,53917,53943,12,69888,69890,5,73018,73018,5,127990,127990,14,128558,128559,14,128759,128760,14,129653,129655,14,2027,2035,5,2891,2892,7,3761,3761,5,6683,6683,5,8293,8293,4,9825,9826,14,9999,9999,14,43452,43453,5,44509,44535,12,45405,45431,12,46301,46327,12,47197,47223,12,48093,48119,12,48989,49015,12,49885,49911,12,50781,50807,12,51677,51703,12,52573,52599,12,53469,53495,12,54365,54391,12,65279,65279,4,70471,70472,7,72145,72147,7,119173,119179,5,127799,127818,14,128240,128244,14,128512,128512,14,128652,128652,14,128721,128722,14,129292,129292,14,129445,129450,14,129734,129743,14,1476,1477,5,2366,2368,7,2750,2752,7,3076,3076,5,3415,3415,5,4141,4144,5,6109,6109,5,6964,6964,5,7394,7400,5,9197,9198,14,9770,9770,14,9877,9877,14,9968,9969,14,10084,10084,14,43052,43052,5,43713,43713,5,44285,44311,12,44733,44759,12,45181,45207,12,45629,45655,12,46077,46103,12,46525,46551,12,46973,46999,12,47421,47447,12,47869,47895,12,48317,48343,12,48765,48791,12,49213,49239,12,49661,49687,12,50109,50135,12,50557,50583,12,51005,51031,12,51453,51479,12,51901,51927,12,52349,52375,12,52797,52823,12,53245,53271,12,53693,53719,12,54141,54167,12,54589,54615,12,55037,55063,12,69506,69509,5,70191,70193,5,70841,70841,7,71463,71467,5,72330,72342,5,94031,94031,5,123628,123631,5,127763,127765,14,127941,127941,14,128043,128062,14,128302,128317,14,128465,128467,14,128539,128539,14,128640,128640,14,128662,128662,14,128703,128703,14,128745,128745,14,129004,129007,14,129329,129330,14,129402,129402,14,129483,129483,14,129686,129704,14,130048,131069,14,173,173,4,1757,1757,1,2200,2207,5,2434,2435,7,2631,2632,5,2817,2817,5,3008,3008,5,3201,3201,5,3387,3388,5,3542,3542,5,3902,3903,7,4190,4192,5,6002,6003,5,6439,6440,5,6765,6770,7,7019,7027,5,7154,7155,7,8205,8205,13,8505,8505,14,9654,9654,14,9757,9757,14,9792,9792,14,9852,9853,14,9890,9894,14,9937,9937,14,9981,9981,14,10035,10036,14,11035,11036,14,42654,42655,5,43346,43347,7,43587,43587,5,44006,44007,7,44173,44199,12,44397,44423,12,44621,44647,12,44845,44871,12,45069,45095,12,45293,45319,12,45517,45543,12,45741,45767,12,45965,45991,12,46189,46215,12,46413,46439,12,46637,46663,12,46861,46887,12,47085,47111,12,47309,47335,12,47533,47559,12,47757,47783,12,47981,48007,12,48205,48231,12,48429,48455,12,48653,48679,12,48877,48903,12,49101,49127,12,49325,49351,12,49549,49575,12,49773,49799,12,49997,50023,12,50221,50247,12,50445,50471,12,50669,50695,12,50893,50919,12,51117,51143,12,51341,51367,12,51565,51591,12,51789,51815,12,52013,52039,12,52237,52263,12,52461,52487,12,52685,52711,12,52909,52935,12,53133,53159,12,53357,53383,12,53581,53607,12,53805,53831,12,54029,54055,12,54253,54279,12,54477,54503,12,54701,54727,12,54925,54951,12,55149,55175,12,68101,68102,5,69762,69762,7,70067,70069,7,70371,70378,5,70720,70721,7,71087,71087,5,71341,71341,5,71995,71996,5,72249,72249,7,72850,72871,5,73109,73109,5,118576,118598,5,121505,121519,5,127245,127247,14,127568,127569,14,127777,127777,14,127872,127891,14,127956,127967,14,128015,128016,14,128110,128172,14,128259,128259,14,128367,128368,14,128424,128424,14,128488,128488,14,128530,128532,14,128550,128551,14,128566,128566,14,128647,128647,14,128656,128656,14,128667,128673,14,128691,128693,14,128715,128715,14,128728,128732,14,128752,128752,14,128765,128767,14,129096,129103,14,129311,129311,14,129344,129349,14,129394,129394,14,129413,129425,14,129466,129471,14,129511,129535,14,129664,129666,14,129719,129722,14,129760,129767,14,917536,917631,5,13,13,2,1160,1161,5,1564,1564,4,1807,1807,1,2085,2087,5,2307,2307,7,2382,2383,7,2497,2500,5,2563,2563,7,2677,2677,5,2763,2764,7,2879,2879,5,2914,2915,5,3021,3021,5,3142,3144,5,3263,3263,5,3285,3286,5,3398,3400,7,3530,3530,5,3633,3633,5,3864,3865,5,3974,3975,5,4155,4156,7,4229,4230,5,5909,5909,7,6078,6085,7,6277,6278,5,6451,6456,7,6744,6750,5,6846,6846,5,6972,6972,5,7074,7077,5,7146,7148,7,7222,7223,5,7416,7417,5,8234,8238,4,8417,8417,5,9000,9000,14,9203,9203,14,9730,9731,14,9748,9749,14,9762,9763,14,9776,9783,14,9800,9811,14,9831,9831,14,9872,9873,14,9882,9882,14,9900,9903,14,9929,9933,14,9941,9960,14,9974,9974,14,9989,9989,14,10006,10006,14,10062,10062,14,10160,10160,14,11647,11647,5,12953,12953,14,43019,43019,5,43232,43249,5,43443,43443,5,43567,43568,7,43696,43696,5,43765,43765,7,44013,44013,5,44117,44143,12,44229,44255,12,44341,44367,12,44453,44479,12,44565,44591,12,44677,44703,12,44789,44815,12,44901,44927,12,45013,45039,12,45125,45151,12,45237,45263,12,45349,45375,12,45461,45487,12,45573,45599,12,45685,45711,12,45797,45823,12,45909,45935,12,46021,46047,12,46133,46159,12,46245,46271,12,46357,46383,12,46469,46495,12,46581,46607,12,46693,46719,12,46805,46831,12,46917,46943,12,47029,47055,12,47141,47167,12,47253,47279,12,47365,47391,12,47477,47503,12,47589,47615,12,47701,47727,12,47813,47839,12,47925,47951,12,48037,48063,12,48149,48175,12,48261,48287,12,48373,48399,12,48485,48511,12,48597,48623,12,48709,48735,12,48821,48847,12,48933,48959,12,49045,49071,12,49157,49183,12,49269,49295,12,49381,49407,12,49493,49519,12,49605,49631,12,49717,49743,12,49829,49855,12,49941,49967,12,50053,50079,12,50165,50191,12,50277,50303,12,50389,50415,12,50501,50527,12,50613,50639,12,50725,50751,12,50837,50863,12,50949,50975,12,51061,51087,12,51173,51199,12,51285,51311,12,51397,51423,12,51509,51535,12,51621,51647,12,51733,51759,12,51845,51871,12,51957,51983,12,52069,52095,12,52181,52207,12,52293,52319,12,52405,52431,12,52517,52543,12,52629,52655,12,52741,52767,12,52853,52879,12,52965,52991,12,53077,53103,12,53189,53215,12,53301,53327,12,53413,53439,12,53525,53551,12,53637,53663,12,53749,53775,12,53861,53887,12,53973,53999,12,54085,54111,12,54197,54223,12,54309,54335,12,54421,54447,12,54533,54559,12,54645,54671,12,54757,54783,12,54869,54895,12,54981,55007,12,55093,55119,12,55243,55291,10,66045,66045,5,68325,68326,5,69688,69702,5,69817,69818,5,69957,69958,7,70089,70092,5,70198,70199,5,70462,70462,5,70502,70508,5,70750,70750,5,70846,70846,7,71100,71101,5,71230,71230,7,71351,71351,5,71737,71738,5,72000,72000,7,72160,72160,5,72273,72278,5,72752,72758,5,72882,72883,5,73031,73031,5,73461,73462,7,94192,94193,7,119149,119149,7,121403,121452,5,122915,122916,5,126980,126980,14,127358,127359,14,127535,127535,14,127759,127759,14,127771,127771,14,127792,127793,14,127825,127867,14,127897,127899,14,127945,127945,14,127985,127986,14,128000,128007,14,128021,128021,14,128066,128100,14,128184,128235,14,128249,128252,14,128266,128276,14,128335,128335,14,128379,128390,14,128407,128419,14,128444,128444,14,128481,128481,14,128499,128499,14,128526,128526,14,128536,128536,14,128543,128543,14,128556,128556,14,128564,128564,14,128577,128580,14,128643,128645,14,128649,128649,14,128654,128654,14,128660,128660,14,128664,128664,14,128675,128675,14,128686,128689,14,128695,128696,14,128705,128709,14,128717,128719,14,128725,128725,14,128736,128741,14,128747,128748,14,128755,128755,14,128762,128762,14,128981,128991,14,129009,129023,14,129160,129167,14,129296,129304,14,129320,129327,14,129340,129342,14,129356,129356,14,129388,129392,14,129399,129400,14,129404,129407,14,129432,129442,14,129454,129455,14,129473,129474,14,129485,129487,14,129648,129651,14,129659,129660,14,129671,129679,14,129709,129711,14,129728,129730,14,129751,129753,14,129776,129782,14,917505,917505,4,917760,917999,5,10,10,3,127,159,4,768,879,5,1471,1471,5,1536,1541,1,1648,1648,5,1767,1768,5,1840,1866,5,2070,2073,5,2137,2139,5,2274,2274,1,2363,2363,7,2377,2380,7,2402,2403,5,2494,2494,5,2507,2508,7,2558,2558,5,2622,2624,7,2641,2641,5,2691,2691,7,2759,2760,5,2786,2787,5,2876,2876,5,2881,2884,5,2901,2902,5,3006,3006,5,3014,3016,7,3072,3072,5,3134,3136,5,3157,3158,5,3260,3260,5,3266,3266,5,3274,3275,7,3328,3329,5,3391,3392,7,3405,3405,5,3457,3457,5,3536,3537,7,3551,3551,5,3636,3642,5,3764,3772,5,3895,3895,5,3967,3967,7,3993,4028,5,4146,4151,5,4182,4183,7,4226,4226,5,4253,4253,5,4957,4959,5,5940,5940,7,6070,6070,7,6087,6088,7,6158,6158,4,6432,6434,5,6448,6449,7,6679,6680,5,6742,6742,5,6754,6754,5,6783,6783,5,6912,6915,5,6966,6970,5,6978,6978,5,7042,7042,7,7080,7081,5,7143,7143,7,7150,7150,7,7212,7219,5,7380,7392,5,7412,7412,5,8203,8203,4,8232,8232,4,8265,8265,14,8400,8412,5,8421,8432,5,8617,8618,14,9167,9167,14,9200,9200,14,9410,9410,14,9723,9726,14,9733,9733,14,9745,9745,14,9752,9752,14,9760,9760,14,9766,9766,14,9774,9774,14,9786,9786,14,9794,9794,14,9823,9823,14,9828,9828,14,9833,9850,14,9855,9855,14,9875,9875,14,9880,9880,14,9885,9887,14,9896,9897,14,9906,9916,14,9926,9927,14,9935,9935,14,9939,9939,14,9962,9962,14,9972,9972,14,9978,9978,14,9986,9986,14,9997,9997,14,10002,10002,14,10017,10017,14,10055,10055,14,10071,10071,14,10133,10135,14,10548,10549,14,11093,11093,14,12330,12333,5,12441,12442,5,42608,42610,5,43010,43010,5,43045,43046,5,43188,43203,7,43302,43309,5,43392,43394,5,43446,43449,5,43493,43493,5,43571,43572,7,43597,43597,7,43703,43704,5,43756,43757,5,44003,44004,7,44009,44010,7,44033,44059,12,44089,44115,12,44145,44171,12,44201,44227,12,44257,44283,12,44313,44339,12,44369,44395,12,44425,44451,12,44481,44507,12,44537,44563,12,44593,44619,12,44649,44675,12,44705,44731,12,44761,44787,12,44817,44843,12,44873,44899,12,44929,44955,12,44985,45011,12,45041,45067,12,45097,45123,12,45153,45179,12,45209,45235,12,45265,45291,12,45321,45347,12,45377,45403,12,45433,45459,12,45489,45515,12,45545,45571,12,45601,45627,12,45657,45683,12,45713,45739,12,45769,45795,12,45825,45851,12,45881,45907,12,45937,45963,12,45993,46019,12,46049,46075,12,46105,46131,12,46161,46187,12,46217,46243,12,46273,46299,12,46329,46355,12,46385,46411,12,46441,46467,12,46497,46523,12,46553,46579,12,46609,46635,12,46665,46691,12,46721,46747,12,46777,46803,12,46833,46859,12,46889,46915,12,46945,46971,12,47001,47027,12,47057,47083,12,47113,47139,12,47169,47195,12,47225,47251,12,47281,47307,12,47337,47363,12,47393,47419,12,47449,47475,12,47505,47531,12,47561,47587,12,47617,47643,12,47673,47699,12,47729,47755,12,47785,47811,12,47841,47867,12,47897,47923,12,47953,47979,12,48009,48035,12,48065,48091,12,48121,48147,12,48177,48203,12,48233,48259,12,48289,48315,12,48345,48371,12,48401,48427,12,48457,48483,12,48513,48539,12,48569,48595,12,48625,48651,12,48681,48707,12,48737,48763,12,48793,48819,12,48849,48875,12,48905,48931,12,48961,48987,12,49017,49043,12,49073,49099,12,49129,49155,12,49185,49211,12,49241,49267,12,49297,49323,12,49353,49379,12,49409,49435,12,49465,49491,12,49521,49547,12,49577,49603,12,49633,49659,12,49689,49715,12,49745,49771,12,49801,49827,12,49857,49883,12,49913,49939,12,49969,49995,12,50025,50051,12,50081,50107,12,50137,50163,12,50193,50219,12,50249,50275,12,50305,50331,12,50361,50387,12,50417,50443,12,50473,50499,12,50529,50555,12,50585,50611,12,50641,50667,12,50697,50723,12,50753,50779,12,50809,50835,12,50865,50891,12,50921,50947,12,50977,51003,12,51033,51059,12,51089,51115,12,51145,51171,12,51201,51227,12,51257,51283,12,51313,51339,12,51369,51395,12,51425,51451,12,51481,51507,12,51537,51563,12,51593,51619,12,51649,51675,12,51705,51731,12,51761,51787,12,51817,51843,12,51873,51899,12,51929,51955,12,51985,52011,12,52041,52067,12,52097,52123,12,52153,52179,12,52209,52235,12,52265,52291,12,52321,52347,12,52377,52403,12,52433,52459,12,52489,52515,12,52545,52571,12,52601,52627,12,52657,52683,12,52713,52739,12,52769,52795,12,52825,52851,12,52881,52907,12,52937,52963,12,52993,53019,12,53049,53075,12,53105,53131,12,53161,53187,12,53217,53243,12,53273,53299,12,53329,53355,12,53385,53411,12,53441,53467,12,53497,53523,12,53553,53579,12,53609,53635,12,53665,53691,12,53721,53747,12,53777,53803,12,53833,53859,12,53889,53915,12,53945,53971,12,54001,54027,12,54057,54083,12,54113,54139,12,54169,54195,12,54225,54251,12,54281,54307,12,54337,54363,12,54393,54419,12,54449,54475,12,54505,54531,12,54561,54587,12,54617,54643,12,54673,54699,12,54729,54755,12,54785,54811,12,54841,54867,12,54897,54923,12,54953,54979,12,55009,55035,12,55065,55091,12,55121,55147,12,55177,55203,12,65024,65039,5,65520,65528,4,66422,66426,5,68152,68154,5,69291,69292,5,69633,69633,5,69747,69748,5,69811,69814,5,69826,69826,5,69932,69932,7,70016,70017,5,70079,70080,7,70095,70095,5,70196,70196,5,70367,70367,5,70402,70403,7,70464,70464,5,70487,70487,5,70709,70711,7,70725,70725,7,70833,70834,7,70843,70844,7,70849,70849,7,71090,71093,5,71103,71104,5,71227,71228,7,71339,71339,5,71344,71349,5,71458,71461,5,71727,71735,5,71985,71989,7,71998,71998,5,72002,72002,7,72154,72155,5,72193,72202,5,72251,72254,5,72281,72283,5,72344,72345,5,72766,72766,7,72874,72880,5,72885,72886,5,73023,73029,5,73104,73105,5,73111,73111,5,92912,92916,5,94095,94098,5,113824,113827,4,119142,119142,7,119155,119162,4,119362,119364,5,121476,121476,5,122888,122904,5,123184,123190,5,125252,125258,5,127183,127183,14,127340,127343,14,127377,127386,14,127491,127503,14,127548,127551,14,127744,127756,14,127761,127761,14,127769,127769,14,127773,127774,14,127780,127788,14,127796,127797,14,127820,127823,14,127869,127869,14,127894,127895,14,127902,127903,14,127943,127943,14,127947,127950,14,127972,127972,14,127988,127988,14,127992,127994,14,128009,128011,14,128019,128019,14,128023,128041,14,128064,128064,14,128102,128107,14,128174,128181,14,128238,128238,14,128246,128247,14,128254,128254,14,128264,128264,14,128278,128299,14,128329,128330,14,128348,128359,14,128371,128377,14,128392,128393,14,128401,128404,14,128421,128421,14,128433,128434,14,128450,128452,14,128476,128478,14,128483,128483,14,128495,128495,14,128506,128506,14,128519,128520,14,128528,128528,14,128534,128534,14,128538,128538,14,128540,128542,14,128544,128549,14,128552,128555,14,128557,128557,14,128560,128563,14,128565,128565,14,128567,128576,14,128581,128591,14,128641,128642,14,128646,128646,14,128648,128648,14,128650,128651,14,128653,128653,14,128655,128655,14,128657,128659,14,128661,128661,14,128663,128663,14,128665,128666,14,128674,128674,14,128676,128677,14,128679,128685,14,128690,128690,14,128694,128694,14,128697,128702,14,128704,128704,14,128710,128714,14,128716,128716,14,128720,128720,14,128723,128724,14,128726,128727,14,128733,128735,14,128742,128744,14,128746,128746,14,128749,128751,14,128753,128754,14,128756,128758,14,128761,128761,14,128763,128764,14,128884,128895,14,128992,129003,14,129008,129008,14,129036,129039,14,129114,129119,14,129198,129279,14,129293,129295,14,129305,129310,14,129312,129319,14,129328,129328,14,129331,129338,14,129343,129343,14,129351,129355,14,129357,129359,14,129375,129387,14,129393,129393,14,129395,129398,14,129401,129401,14,129403,129403,14,129408,129412,14,129426,129431,14,129443,129444,14,129451,129453,14,129456,129465,14,129472,129472,14,129475,129482,14,129484,129484,14,129488,129510,14,129536,129647,14,129652,129652,14,129656,129658,14,129661,129663,14,129667,129670,14,129680,129685,14,129705,129708,14,129712,129718,14,129723,129727,14,129731,129733,14,129744,129750,14,129754,129759,14,129768,129775,14,129783,129791,14,917504,917504,4,917506,917535,4,917632,917759,4,918000,921599,4,0,9,4,11,12,4,14,31,4,169,169,14,174,174,14,1155,1159,5,1425,1469,5,1473,1474,5,1479,1479,5,1552,1562,5,1611,1631,5,1750,1756,5,1759,1764,5,1770,1773,5,1809,1809,5,1958,1968,5,2045,2045,5,2075,2083,5,2089,2093,5,2192,2193,1,2250,2273,5,2275,2306,5,2362,2362,5,2364,2364,5,2369,2376,5,2381,2381,5,2385,2391,5,2433,2433,5,2492,2492,5,2495,2496,7,2503,2504,7,2509,2509,5,2530,2531,5,2561,2562,5,2620,2620,5,2625,2626,5,2635,2637,5,2672,2673,5,2689,2690,5,2748,2748,5,2753,2757,5,2761,2761,7,2765,2765,5,2810,2815,5,2818,2819,7,2878,2878,5,2880,2880,7,2887,2888,7,2893,2893,5,2903,2903,5,2946,2946,5,3007,3007,7,3009,3010,7,3018,3020,7,3031,3031,5,3073,3075,7,3132,3132,5,3137,3140,7,3146,3149,5,3170,3171,5,3202,3203,7,3262,3262,7,3264,3265,7,3267,3268,7,3271,3272,7,3276,3277,5,3298,3299,5,3330,3331,7,3390,3390,5,3393,3396,5,3402,3404,7,3406,3406,1,3426,3427,5,3458,3459,7,3535,3535,5,3538,3540,5,3544,3550,7,3570,3571,7,3635,3635,7,3655,3662,5,3763,3763,7,3784,3789,5,3893,3893,5,3897,3897,5,3953,3966,5,3968,3972,5,3981,3991,5,4038,4038,5,4145,4145,7,4153,4154,5,4157,4158,5,4184,4185,5,4209,4212,5,4228,4228,7,4237,4237,5,4352,4447,8,4520,4607,10,5906,5908,5,5938,5939,5,5970,5971,5,6068,6069,5,6071,6077,5,6086,6086,5,6089,6099,5,6155,6157,5,6159,6159,5,6313,6313,5,6435,6438,7,6441,6443,7,6450,6450,5,6457,6459,5,6681,6682,7,6741,6741,7,6743,6743,7,6752,6752,5,6757,6764,5,6771,6780,5,6832,6845,5,6847,6862,5,6916,6916,7,6965,6965,5,6971,6971,7,6973,6977,7,6979,6980,7,7040,7041,5,7073,7073,7,7078,7079,7,7082,7082,7,7142,7142,5,7144,7145,5,7149,7149,5,7151,7153,5,7204,7211,7,7220,7221,7,7376,7378,5,7393,7393,7,7405,7405,5,7415,7415,7,7616,7679,5,8204,8204,5,8206,8207,4,8233,8233,4,8252,8252,14,8288,8292,4,8294,8303,4,8413,8416,5,8418,8420,5,8482,8482,14,8596,8601,14,8986,8987,14,9096,9096,14,9193,9196,14,9199,9199,14,9201,9202,14,9208,9210,14,9642,9643,14,9664,9664,14,9728,9729,14,9732,9732,14,9735,9741,14,9743,9744,14,9746,9746,14,9750,9751,14,9753,9756,14,9758,9759,14,9761,9761,14,9764,9765,14,9767,9769,14,9771,9773,14,9775,9775,14,9784,9785,14,9787,9791,14,9793,9793,14,9795,9799,14,9812,9822,14,9824,9824,14,9827,9827,14,9829,9830,14,9832,9832,14,9851,9851,14,9854,9854,14,9856,9861,14,9874,9874,14,9876,9876,14,9878,9879,14,9881,9881,14,9883,9884,14,9888,9889,14,9895,9895,14,9898,9899,14,9904,9905,14,9917,9918,14,9924,9925,14,9928,9928,14,9934,9934,14,9936,9936,14,9938,9938,14,9940,9940,14,9961,9961,14,9963,9967,14,9970,9971,14,9973,9973,14,9975,9977,14,9979,9980,14,9982,9985,14,9987,9988,14,9992,9996,14,9998,9998,14,10000,10001,14,10004,10004,14,10013,10013,14,10024,10024,14,10052,10052,14,10060,10060,14,10067,10069,14,10083,10083,14,10085,10087,14,10145,10145,14,10175,10175,14,11013,11015,14,11088,11088,14,11503,11505,5,11744,11775,5,12334,12335,5,12349,12349,14,12951,12951,14,42607,42607,5,42612,42621,5,42736,42737,5,43014,43014,5,43043,43044,7,43047,43047,7,43136,43137,7,43204,43205,5,43263,43263,5,43335,43345,5,43360,43388,8,43395,43395,7,43444,43445,7,43450,43451,7,43454,43456,7,43561,43566,5,43569,43570,5,43573,43574,5,43596,43596,5,43644,43644,5,43698,43700,5,43710,43711,5,43755,43755,7,43758,43759,7,43766,43766,5,44005,44005,5,44008,44008,5,44012,44012,7,44032,44032,11,44060,44060,11,44088,44088,11,44116,44116,11,44144,44144,11,44172,44172,11,44200,44200,11,44228,44228,11,44256,44256,11,44284,44284,11,44312,44312,11,44340,44340,11,44368,44368,11,44396,44396,11,44424,44424,11,44452,44452,11,44480,44480,11,44508,44508,11,44536,44536,11,44564,44564,11,44592,44592,11,44620,44620,11,44648,44648,11,44676,44676,11,44704,44704,11,44732,44732,11,44760,44760,11,44788,44788,11,44816,44816,11,44844,44844,11,44872,44872,11,44900,44900,11,44928,44928,11,44956,44956,11,44984,44984,11,45012,45012,11,45040,45040,11,45068,45068,11,45096,45096,11,45124,45124,11,45152,45152,11,45180,45180,11,45208,45208,11,45236,45236,11,45264,45264,11,45292,45292,11,45320,45320,11,45348,45348,11,45376,45376,11,45404,45404,11,45432,45432,11,45460,45460,11,45488,45488,11,45516,45516,11,45544,45544,11,45572,45572,11,45600,45600,11,45628,45628,11,45656,45656,11,45684,45684,11,45712,45712,11,45740,45740,11,45768,45768,11,45796,45796,11,45824,45824,11,45852,45852,11,45880,45880,11,45908,45908,11,45936,45936,11,45964,45964,11,45992,45992,11,46020,46020,11,46048,46048,11,46076,46076,11,46104,46104,11,46132,46132,11,46160,46160,11,46188,46188,11,46216,46216,11,46244,46244,11,46272,46272,11,46300,46300,11,46328,46328,11,46356,46356,11,46384,46384,11,46412,46412,11,46440,46440,11,46468,46468,11,46496,46496,11,46524,46524,11,46552,46552,11,46580,46580,11,46608,46608,11,46636,46636,11,46664,46664,11,46692,46692,11,46720,46720,11,46748,46748,11,46776,46776,11,46804,46804,11,46832,46832,11,46860,46860,11,46888,46888,11,46916,46916,11,46944,46944,11,46972,46972,11,47000,47000,11,47028,47028,11,47056,47056,11,47084,47084,11,47112,47112,11,47140,47140,11,47168,47168,11,47196,47196,11,47224,47224,11,47252,47252,11,47280,47280,11,47308,47308,11,47336,47336,11,47364,47364,11,47392,47392,11,47420,47420,11,47448,47448,11,47476,47476,11,47504,47504,11,47532,47532,11,47560,47560,11,47588,47588,11,47616,47616,11,47644,47644,11,47672,47672,11,47700,47700,11,47728,47728,11,47756,47756,11,47784,47784,11,47812,47812,11,47840,47840,11,47868,47868,11,47896,47896,11,47924,47924,11,47952,47952,11,47980,47980,11,48008,48008,11,48036,48036,11,48064,48064,11,48092,48092,11,48120,48120,11,48148,48148,11,48176,48176,11,48204,48204,11,48232,48232,11,48260,48260,11,48288,48288,11,48316,48316,11,48344,48344,11,48372,48372,11,48400,48400,11,48428,48428,11,48456,48456,11,48484,48484,11,48512,48512,11,48540,48540,11,48568,48568,11,48596,48596,11,48624,48624,11,48652,48652,11,48680,48680,11,48708,48708,11,48736,48736,11,48764,48764,11,48792,48792,11,48820,48820,11,48848,48848,11,48876,48876,11,48904,48904,11,48932,48932,11,48960,48960,11,48988,48988,11,49016,49016,11,49044,49044,11,49072,49072,11,49100,49100,11,49128,49128,11,49156,49156,11,49184,49184,11,49212,49212,11,49240,49240,11,49268,49268,11,49296,49296,11,49324,49324,11,49352,49352,11,49380,49380,11,49408,49408,11,49436,49436,11,49464,49464,11,49492,49492,11,49520,49520,11,49548,49548,11,49576,49576,11,49604,49604,11,49632,49632,11,49660,49660,11,49688,49688,11,49716,49716,11,49744,49744,11,49772,49772,11,49800,49800,11,49828,49828,11,49856,49856,11,49884,49884,11,49912,49912,11,49940,49940,11,49968,49968,11,49996,49996,11,50024,50024,11,50052,50052,11,50080,50080,11,50108,50108,11,50136,50136,11,50164,50164,11,50192,50192,11,50220,50220,11,50248,50248,11,50276,50276,11,50304,50304,11,50332,50332,11,50360,50360,11,50388,50388,11,50416,50416,11,50444,50444,11,50472,50472,11,50500,50500,11,50528,50528,11,50556,50556,11,50584,50584,11,50612,50612,11,50640,50640,11,50668,50668,11,50696,50696,11,50724,50724,11,50752,50752,11,50780,50780,11,50808,50808,11,50836,50836,11,50864,50864,11,50892,50892,11,50920,50920,11,50948,50948,11,50976,50976,11,51004,51004,11,51032,51032,11,51060,51060,11,51088,51088,11,51116,51116,11,51144,51144,11,51172,51172,11,51200,51200,11,51228,51228,11,51256,51256,11,51284,51284,11,51312,51312,11,51340,51340,11,51368,51368,11,51396,51396,11,51424,51424,11,51452,51452,11,51480,51480,11,51508,51508,11,51536,51536,11,51564,51564,11,51592,51592,11,51620,51620,11,51648,51648,11,51676,51676,11,51704,51704,11,51732,51732,11,51760,51760,11,51788,51788,11,51816,51816,11,51844,51844,11,51872,51872,11,51900,51900,11,51928,51928,11,51956,51956,11,51984,51984,11,52012,52012,11,52040,52040,11,52068,52068,11,52096,52096,11,52124,52124,11,52152,52152,11,52180,52180,11,52208,52208,11,52236,52236,11,52264,52264,11,52292,52292,11,52320,52320,11,52348,52348,11,52376,52376,11,52404,52404,11,52432,52432,11,52460,52460,11,52488,52488,11,52516,52516,11,52544,52544,11,52572,52572,11,52600,52600,11,52628,52628,11,52656,52656,11,52684,52684,11,52712,52712,11,52740,52740,11,52768,52768,11,52796,52796,11,52824,52824,11,52852,52852,11,52880,52880,11,52908,52908,11,52936,52936,11,52964,52964,11,52992,52992,11,53020,53020,11,53048,53048,11,53076,53076,11,53104,53104,11,53132,53132,11,53160,53160,11,53188,53188,11,53216,53216,11,53244,53244,11,53272,53272,11,53300,53300,11,53328,53328,11,53356,53356,11,53384,53384,11,53412,53412,11,53440,53440,11,53468,53468,11,53496,53496,11,53524,53524,11,53552,53552,11,53580,53580,11,53608,53608,11,53636,53636,11,53664,53664,11,53692,53692,11,53720,53720,11,53748,53748,11,53776,53776,11,53804,53804,11,53832,53832,11,53860,53860,11,53888,53888,11,53916,53916,11,53944,53944,11,53972,53972,11,54000,54000,11,54028,54028,11,54056,54056,11,54084,54084,11,54112,54112,11,54140,54140,11,54168,54168,11,54196,54196,11,54224,54224,11,54252,54252,11,54280,54280,11,54308,54308,11,54336,54336,11,54364,54364,11,54392,54392,11,54420,54420,11,54448,54448,11,54476,54476,11,54504,54504,11,54532,54532,11,54560,54560,11,54588,54588,11,54616,54616,11,54644,54644,11,54672,54672,11,54700,54700,11,54728,54728,11,54756,54756,11,54784,54784,11,54812,54812,11,54840,54840,11,54868,54868,11,54896,54896,11,54924,54924,11,54952,54952,11,54980,54980,11,55008,55008,11,55036,55036,11,55064,55064,11,55092,55092,11,55120,55120,11,55148,55148,11,55176,55176,11,55216,55238,9,64286,64286,5,65056,65071,5,65438,65439,5,65529,65531,4,66272,66272,5,68097,68099,5,68108,68111,5,68159,68159,5,68900,68903,5,69446,69456,5,69632,69632,7,69634,69634,7,69744,69744,5,69759,69761,5,69808,69810,7,69815,69816,7,69821,69821,1,69837,69837,1,69927,69931,5,69933,69940,5,70003,70003,5,70018,70018,7,70070,70078,5,70082,70083,1,70094,70094,7,70188,70190,7,70194,70195,7,70197,70197,7,70206,70206,5,70368,70370,7,70400,70401,5,70459,70460,5,70463,70463,7,70465,70468,7,70475,70477,7,70498,70499,7,70512,70516,5,70712,70719,5,70722,70724,5,70726,70726,5,70832,70832,5,70835,70840,5,70842,70842,5,70845,70845,5,70847,70848,5,70850,70851,5,71088,71089,7,71096,71099,7,71102,71102,7,71132,71133,5,71219,71226,5,71229,71229,5,71231,71232,5,71340,71340,7,71342,71343,7,71350,71350,7,71453,71455,5,71462,71462,7,71724,71726,7,71736,71736,7,71984,71984,5,71991,71992,7,71997,71997,7,71999,71999,1,72001,72001,1,72003,72003,5,72148,72151,5,72156,72159,7,72164,72164,7,72243,72248,5,72250,72250,1,72263,72263,5,72279,72280,7,72324,72329,1,72343,72343,7,72751,72751,7,72760,72765,5,72767,72767,5,72873,72873,7,72881,72881,7,72884,72884,7,73009,73014,5,73020,73021,5,73030,73030,1,73098,73102,7,73107,73108,7,73110,73110,7,73459,73460,5,78896,78904,4,92976,92982,5,94033,94087,7,94180,94180,5,113821,113822,5,118528,118573,5,119141,119141,5,119143,119145,5,119150,119154,5,119163,119170,5,119210,119213,5,121344,121398,5,121461,121461,5,121499,121503,5,122880,122886,5,122907,122913,5,122918,122922,5,123566,123566,5,125136,125142,5,126976,126979,14,126981,127182,14,127184,127231,14,127279,127279,14,127344,127345,14,127374,127374,14,127405,127461,14,127489,127490,14,127514,127514,14,127538,127546,14,127561,127567,14,127570,127743,14,127757,127758,14,127760,127760,14,127762,127762,14,127766,127768,14,127770,127770,14,127772,127772,14,127775,127776,14,127778,127779,14,127789,127791,14,127794,127795,14,127798,127798,14,127819,127819,14,127824,127824,14,127868,127868,14,127870,127871,14,127892,127893,14,127896,127896,14,127900,127901,14,127904,127940,14,127942,127942,14,127944,127944,14,127946,127946,14,127951,127955,14,127968,127971,14,127973,127984,14,127987,127987,14,127989,127989,14,127991,127991,14,127995,127999,5,128008,128008,14,128012,128014,14,128017,128018,14,128020,128020,14,128022,128022,14,128042,128042,14,128063,128063,14,128065,128065,14,128101,128101,14,128108,128109,14,128173,128173,14,128182,128183,14,128236,128237,14,128239,128239,14,128245,128245,14,128248,128248,14,128253,128253,14,128255,128258,14,128260,128263,14,128265,128265,14,128277,128277,14,128300,128301,14,128326,128328,14,128331,128334,14,128336,128347,14,128360,128366,14,128369,128370,14,128378,128378,14,128391,128391,14,128394,128397,14,128400,128400,14,128405,128406,14,128420,128420,14,128422,128423,14,128425,128432,14,128435,128443,14,128445,128449,14,128453,128464,14,128468,128475,14,128479,128480,14,128482,128482,14,128484,128487,14,128489,128494,14,128496,128498,14,128500,128505,14,128507,128511,14,128513,128518,14,128521,128525,14,128527,128527,14,128529,128529,14,128533,128533,14,128535,128535,14,128537,128537,14]');
}

function breakBetweenGraphemeBreakType(breakTypeA: GraphemeBreakType, breakTypeB: GraphemeBreakType): boolean {
    // http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundary_Rules

    // !!! Let's make the common case a bit faster
    if (breakTypeA === GraphemeBreakType.Other) {
        // see https://www.unicode.org/Public/13.0.0/ucd/auxiliary/GraphemeBreakTest-13.0.0d10.html#table
        return (breakTypeB !== GraphemeBreakType.Extend && breakTypeB !== GraphemeBreakType.SpacingMark);
    }

    // Do not break between a CR and LF. Otherwise, break before and after controls.
    // GB3                                        CR × LF
    // GB4                       (Control | CR | LF) ÷
    // GB5                                           ÷ (Control | CR | LF)
    if (breakTypeA === GraphemeBreakType.CR) {
        if (breakTypeB === GraphemeBreakType.LF) {
            return false; // GB3
        }
    }
    if (breakTypeA === GraphemeBreakType.Control || breakTypeA === GraphemeBreakType.CR || breakTypeA === GraphemeBreakType.LF) {
        return true; // GB4
    }
    if (breakTypeB === GraphemeBreakType.Control || breakTypeB === GraphemeBreakType.CR || breakTypeB === GraphemeBreakType.LF) {
        return true; // GB5
    }

    // Do not break Hangul syllable sequences.
    // GB6                                         L × (L | V | LV | LVT)
    // GB7                                  (LV | V) × (V | T)
    // GB8                                 (LVT | T) × T
    if (breakTypeA === GraphemeBreakType.L) {
        if (breakTypeB === GraphemeBreakType.L || breakTypeB === GraphemeBreakType.V || breakTypeB === GraphemeBreakType.LV || breakTypeB === GraphemeBreakType.LVT) {
            return false; // GB6
        }
    }
    if (breakTypeA === GraphemeBreakType.LV || breakTypeA === GraphemeBreakType.V) {
        if (breakTypeB === GraphemeBreakType.V || breakTypeB === GraphemeBreakType.T) {
            return false; // GB7
        }
    }
    if (breakTypeA === GraphemeBreakType.LVT || breakTypeA === GraphemeBreakType.T) {
        if (breakTypeB === GraphemeBreakType.T) {
            return false; // GB8
        }
    }

    // Do not break before extending characters or ZWJ.
    // GB9                                           × (Extend | ZWJ)
    if (breakTypeB === GraphemeBreakType.Extend || breakTypeB === GraphemeBreakType.ZWJ) {
        return false; // GB9
    }

    // The GB9a and GB9b rules only apply to extended grapheme clusters:
    // Do not break before SpacingMarks, or after Prepend characters.
    // GB9a                                          × SpacingMark
    // GB9b                                  Prepend ×
    if (breakTypeB === GraphemeBreakType.SpacingMark) {
        return false; // GB9a
    }
    if (breakTypeA === GraphemeBreakType.Prepend) {
        return false; // GB9b
    }

    // Do not break within emoji modifier sequences or emoji zwj sequences.
    // GB11    \p{Extended_Pictographic} Extend* ZWJ × \p{Extended_Pictographic}
    if (breakTypeA === GraphemeBreakType.ZWJ && breakTypeB === GraphemeBreakType.Extended_Pictographic) {
        // Note: we are not implementing the rule entirely here to avoid introducing states
        return false; // GB11
    }

    // GB12                          sot (RI RI)* RI × RI
    // GB13                        [^RI] (RI RI)* RI × RI
    if (breakTypeA === GraphemeBreakType.Regional_Indicator && breakTypeB === GraphemeBreakType.Regional_Indicator) {
        // Note: we are not implementing the rule entirely here to avoid introducing states
        return false; // GB12 & GB13
    }

    // GB999                                     Any ÷ Any
    return true;
}