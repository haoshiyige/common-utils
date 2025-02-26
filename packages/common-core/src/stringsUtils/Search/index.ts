import { StringsUtils } from "../index";
/**
 * 构建一个替换字符串，同时保留原始字符串的大小写格式。
 *
 * 该函数会根据匹配的字符串（`matches`）和要替换的模式（`pattern`），构建一个新的字符串，
 * 并确保新字符串的大小写格式与原始匹配字符串一致。此外，它还会处理特定的特殊字符（如连字符 `-` 和下划线 `_`），
 * 确保它们在替换字符串中保持一致。
 *
 * @param {string[] | null} matches - 包含匹配结果的数组。通常由正则表达式匹配返回。
 * @param {string} pattern - 要替换的模式字符串。
 * @returns {string} - 构建的替换字符串，保留了原始字符串的大小写格式。
 * 
 * // // 测试 buildReplaceStringWithCasePreserved
 * console.log(buildReplaceStringWithCasePreserved(['hello'], 'world')); // 输出: world
 * console.log(buildReplaceStringWithCasePreserved(['HELLO'], 'world')); // 输出: WORLD
 * console.log(buildReplaceStringWithCasePreserved(['Hello'], 'world')); // 输出: World
 * console.log(buildReplaceStringWithCasePreserved(['hello-world'], 'foo-bar')); // 输出: foo-bar
 * console.log(buildReplaceStringWithCasePreserved(['hello_world'], 'foo_bar')); // 输出: foo_bar
 * console.log(buildReplaceStringWithCasePreserved(['Hello-World'], 'foo-bar')); // 输出: Foo-Bar
 * console.log(buildReplaceStringWithCasePreserved(['hello_WORLD'], 'foo_BAR')); // 输出: foo_BAR
 * console.log(buildReplaceStringWithCasePreserved(['hello-WORLD'], 'foo-BAR')); // 输出: foo-BAR
 * console.log(buildReplaceStringWithCasePreserved(['hello-WoRld'], 'foo-bAr')); // 输出: foo-bAr
 */
export function buildReplaceStringWithCasePreserved(matches: string[] | null, pattern: string): string {
    if (matches && matches[0] !== '') {
        // 检查是否包含连字符或下划线
        const containsHyphens = validateSpecificSpecialCharacter(matches, pattern, '-');
        const containsUnderscores = validateSpecificSpecialCharacter(matches, pattern, '_');

        // 如果只包含连字符或只包含下划线，则调用专门的处理函数
        if (containsHyphens && !containsUnderscores) {
            return buildReplaceStringForSpecificSpecialCharacter(matches, pattern, '-');
        } else if (!containsHyphens && containsUnderscores) {
            return buildReplaceStringForSpecificSpecialCharacter(matches, pattern, '_');
        }

        // 根据匹配字符串的大小写格式调整模式字符串
        if (matches[0].toUpperCase() === matches[0]) {
            return pattern.toUpperCase();
        } else if (matches[0].toLowerCase() === matches[0]) {
            return pattern.toLowerCase();
        } else if (StringsUtils.containsUppercaseCharacter(matches[0][0]) && pattern.length > 0) {
            return pattern[0].toUpperCase() + pattern.substr(1);
        } else if (matches[0][0].toUpperCase() !== matches[0][0] && pattern.length > 0) {
            return pattern[0].toLowerCase() + pattern.substr(1);
        } else {
            // 如果无法识别大小写模式，则直接返回模式字符串
            return pattern;
        }
    } else {
        // 如果没有匹配结果或匹配结果为空字符串，则直接返回模式字符串
        return pattern;
    }
}

/**
 * 验证匹配字符串和模式字符串是否包含相同的特定特殊字符，并且这些字符的数量一致。
 *
 * @param {string[]} matches - 包含匹配结果的数组。
 * @param {string} pattern - 要替换的模式字符串。
 * @param {string} specialCharacter - 要验证的特殊字符（如连字符 `-` 或下划线 `_`）。
 * @returns {boolean} - 如果匹配字符串和模式字符串都包含相同数量的指定特殊字符，则返回 `true`，否则返回 `false`。
 *  * // // 测试 validateSpecificSpecialCharacter
  * console.log(validateSpecificSpecialCharacter(['hello-world'], 'foo-bar', '-')); // 输出: true
  * console.log(validateSpecificSpecialCharacter(['hello_world'], 'foo_bar', '_')); // 输出: true
  * console.log(validateSpecificSpecialCharacter(['hello-world'], 'foo_bar', '-')); // 输出: false
  * console.log(validateSpecificSpecialCharacter(['hello_world'], 'foo-bar', '_')); // 输出: false
 * 
 */
function validateSpecificSpecialCharacter(matches: string[], pattern: string, specialCharacter: string): boolean {
    // 检查匹配字符串和模式字符串是否都包含指定的特殊字符
    const doesContainSpecialCharacter = matches[0].indexOf(specialCharacter) !== -1 && pattern.indexOf(specialCharacter) !== -1;
    // 检查匹配字符串和模式字符串中指定特殊字符的数量是否一致
    return doesContainSpecialCharacter && matches[0].split(specialCharacter).length === pattern.split(specialCharacter).length;
}

/**
 * 构建一个替换字符串，针对特定的特殊字符（如连字符 `-` 或下划线 `_`）进行处理。
 *
 * 该函数会将模式字符串按照指定的特殊字符分割，并逐个部分构建替换字符串，确保每个部分的大小写格式与匹配字符串一致。
 *
 * @param {string[]} matches - 包含匹配结果的数组。
 * @param {string} pattern - 要替换的模式字符串。
 * @param {string} specialCharacter - 要处理的特殊字符（如连字符 `-` 或下划线 `_`）。
 * @returns {string} - 构建的替换字符串，保留了原始字符串的大小写格式，并正确处理了特殊字符。
 * 
 * 
 * 
 * 
 * @public 测试 buildReplaceStringForSpecificSpecialCharacter
 * console.log(buildReplaceStringForSpecificSpecialCharacter(['hello-world'], 'foo-bar', '-')); // 输出: foo-bar
 * console.log(buildReplaceStringForSpecificSpecialCharacter(['hello_world'], 'foo_bar', '_')); // 输出: foo_bar
 * console.log(buildReplaceStringForSpecificSpecialCharacter(['Hello-World'], 'foo-bar', '-')); // 输出: Foo-Bar
 * console.log(buildReplaceStringForSpecificSpecialCharacter(['hello_WORLD'], 'foo_BAR', '_')); // 输出: foo_BAR
 * 
 */

function buildReplaceStringForSpecificSpecialCharacter(matches: string[], pattern: string, specialCharacter: string): string {
    // 将模式字符串和匹配字符串按照指定的特殊字符分割
    const splitPatternAtSpecialCharacter = pattern.split(specialCharacter);
    const splitMatchAtSpecialCharacter = matches[0].split(specialCharacter);
    let replaceString: string = '';
    // 逐个部分构建替换字符串
    splitPatternAtSpecialCharacter.forEach((splitValue, index) => {
        // 递归调用 `buildReplaceStringWithCasePreserved` 处理每个部分
        replaceString += buildReplaceStringWithCasePreserved([splitMatchAtSpecialCharacter[index]], splitValue) + specialCharacter;
    });
    // 移除最后一个多余的特殊字符
    return replaceString.slice(0, -1);
}