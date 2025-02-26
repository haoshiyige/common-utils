
/**
 * @description 定义一些常用的常量。
 * // 测试 Constants 枚举
 * console.log(Constants.MAX_SAFE_SMALL_INTEGER); // 输出: 1073741824
 * console.log(Constants.MIN_SAFE_SMALL_INTEGER); // 输出: -1073741824
 * console.log(Constants.MAX_UINT_8);             // 输出: 255
 * console.log(Constants.MAX_UINT_16);            // 输出: 65535
 * console.log(Constants.MAX_UINT_32);            // 输出: 4294967295
 * console.log(Constants.UNICODE_SUPPLEMENTARY_PLANE_BEGIN); // 输出: 65536
 * 
 */

export const enum Constants {
	/**
	 * V8 引擎中定义的最大 SMall Integer (SMI)。
	 * 
	 * 在 V8 中，SMI 是一种特殊的整数表示形式，用于优化小整数的存储和操作。
	 * SMI 的范围是 -2^30 到 2^30 - 1。这是因为 V8 使用了 32 位来表示 SMI，
	 * 其中 1 位用于标记是否为 SMI，1 位用于符号位，剩下的 30 位用于存储数值。
	 * 
	 * @see https://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/#tagged-values
	 */
	// MAX_SAFE_SMALL_INTEGER = (1 << 30) - 1,
	MAX_SAFE_SMALL_INTEGER = 1073741823,

	/**
	 * V8 引擎中定义的最小 SMall Integer (SMI)。
	 * 
	 * 在 V8 中，SMI 的范围是 -2^30 到 2^30 - 1。这是因为 V8 使用了 32 位来表示 SMI，
	 * 其中 1 位用于标记是否为 SMI，1 位用于符号位，剩下的 30 位用于存储数值。
	 * 
	 * @see https://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/#tagged-values
	 */
	// MIN_SAFE_SMALL_INTEGER = -(1 << 30),
	MIN_SAFE_SMALL_INTEGER = -1073741824,

	/**
	 * 可以存储在 8 位无符号整数中的最大值（2^8 - 1）。
	 */
	MAX_UINT_8 = 255, // 2^8 - 1

	/**
	 * 可以存储在 16 位无符号整数中的最大值（2^16 - 1）。
	 */
	MAX_UINT_16 = 65535, // 2^16 - 1

	/**
	 * 可以存储在 32 位无符号整数中的最大值（2^32 - 1）。
	 */
	MAX_UINT_32 = 4294967295, // 2^32 - 1

	/**
	 * Unicode 补充平面（Supplementary Plane）的起始码点。
	 * 
	 * Unicode 补充平面包含码点 U+10000 到 U+10FFFF，主要用于表示非 BMP（基本多文种平面）字符。
	 */
	UNICODE_SUPPLEMENTARY_PLANE_BEGIN = 0x010000
}

/**
 * 将给定的数字转换为 8 位无符号整数（`uint8`）。
 * 
 * 如果输入的数字小于 0，则返回 0；如果大于 `Constants.MAX_UINT_8`，则返回 `Constants.MAX_UINT_8`。
 * 否则，返回该数字的整数部分（通过按位或运算实现截断）。
 * 
 * @param {number} v - 要转换的数字。
 * @returns {number} - 转换后的 8 位无符号整数。
 * 
 * 测试
 * // 测试 toUint8 函数
 * console.log(toUint8(-1));           // 输出: 0。
 * console.log(toUint8(0));            // 输出: 0。
 * console.log(toUint8(127));          // 输出: 127。
 * console.log(toUint8(255));          // 输出: 255。
 * console.log(toUint8(256));          // 输出: 255。
 * console.log(toUint8(1000));         // 输出: 255。
 * console.log(toUint8(1.5));          // 输出: 1。
 * console.log(toUint8(123.456));      // 输出: 123。
 */

export function toUint8(v: number): number {
	if (v < 0) return 0;
	if (v > Constants.MAX_UINT_8) return Constants.MAX_UINT_8;
	return Math.floor(v) & 0xFF; // 使用与操作符确保只保留最低的8位
}

/**
 * 将给定的数字转换为 32 位无符号整数（`uint32`）。
 * 
 * 如果输入的数字小于 0，则返回 0；如果大于 `Constants.MAX_UINT_32`，则返回 `Constants.MAX_UINT_32`。
 * 否则，返回该数字的整数部分（通过按位或运算实现截断）。
 * 
 * @param {number} v - 要转换的数字。
 * @returns {number} - 转换后的 32 位无符号整数。
 * 
 *  测试 toUint32 函数
 * console.log(toUint32(-1));          // 输出: 0
 * console.log(toUint32(0));           // 输出: 0
 * console.log(toUint32(123456789));   // 输出: 123456789
 * console.log(toUint32(Constants.MAX_UINT_32)); // 输出: 4294967295
 * console.log(toUint32(Constants.MAX_UINT_32 + 1)); // 输出: 4294967295
 * console.log(toUint32(1.5));         // 输出: 1
 * console.log(toUint32(123456789.123)); // 输出: 123456789
 */

export function toUint32(v: number): number {
	if (v < 0) return 0;
	if (v > Constants.MAX_UINT_32) return Constants.MAX_UINT_32;
	return Math.floor(v); // 确保返回非负整数
}
