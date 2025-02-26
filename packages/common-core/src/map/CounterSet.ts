
import { checkNewCall } from "@nin/shared";



/**
 * @description 一个通用的计数集合类（`CounterSet`），用于跟踪集合中每个元素的出现次数。
 *
 * 该类基于 `Map` 实现，允许你向集合中添加元素并记录它们的出现次数。你可以通过 `add` 方法增加某个元素的计数，
 * 通过 `delete` 方法减少某个元素的计数，或者完全移除该元素。`has` 方法可以检查集合中是否包含某个元素。
 */
@checkNewCall()
export class CounterSet<T> {

    /**
     * 内部使用的 `Map`，用于存储元素及其对应的计数值。
     */

    private map = new Map<T, number>();

    /**
     * 向集合中添加一个元素，并增加其计数。
     *
     * 如果该元素已经存在于集合中，则其计数会增加 1；如果不存在，则将其计数初始化为 1。
     *
     * @param {T} value - 要添加的元素。
     * @returns {CounterSet<T>} - 返回当前 `CounterSet` 实例，以便支持链式调用。
     */
    add(value: T): CounterSet<T> {
        this.map.set(value, (this.map.get(value) || 0) + 1);
        return this;
    }

    /**
     * 从集合中删除一个元素，并减少其计数。
     *
     * 如果该元素的计数减少到 0，则将其从集合中完全移除。如果该元素不存在于集合中，则返回 `false`。
     *
     * @param {T} value - 要删除的元素。
     * @returns {boolean} - 如果成功减少了计数或移除了元素，则返回 `true`；否则返回 `false`。
     */

    delete(value: T): boolean {
        let counter = this.map.get(value) || 0;
        if (counter === 0) return false;
        counter--;
        if (counter === 0) {
            this.map.delete(value);
        } else {
            this.map.set(value, counter);
        }
        return true;
    }

    /**
     * 检查集合中是否包含某个元素。
     *
     * 该方法只检查元素是否存在，而不考虑其计数。
     *
     * @param {T} value - 要检查的元素。
     * @returns {boolean} - 如果集合中包含该元素，则返回 `true`；否则返回 `false`。
     */
    has(value: T): boolean {
        return this.map.has(value);
    }

    /**
     * 获取某个元素的计数。
     *
     * 如果该元素不存在于集合中，则返回 0。
     *
     * @param {T} value - 要获取计数的元素。
     * @returns {number} - 该元素的计数，如果不存在则返回 0。
     */
    getCount(value: T): number {
        return this.map.get(value) || 0;
    }
}
