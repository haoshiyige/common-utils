import { EnumFactory } from '../../src/enumFactory/enumFactory';

describe('EnumFactory', () => {
    let enumFactory: EnumFactory<number>;

    beforeEach(() => {
        // 在每个测试用例前初始化一个新的 EnumFactory 实例
        enumFactory = new EnumFactory('status', {
            PENDING: { key: 'PENDING', label: '待处理', value: 0 },
            PROCESSING: { key: 'PROCESSING', label: '处理中', value: 1 },
            COMPLETED: { key: 'COMPLETED', label: '已完成', value: 2 },
            CANCELLED: { key: 'CANCELLED', label: '已取消', value: 3 },
            FAILED: { key: 'FAILED', label: '失败', value: 4, disabled: true }
        });
    });

    describe('toArray', () => {
        it('应该返回完整的枚举项数组', () => {
            const result = enumFactory.toArray();
            expect(result).toHaveLength(5);
            expect(result[0]).toEqual({
                key: 'PENDING',
                label: '待处理',
                value: 0
            });
        });

        it('应该只返回指定字段', () => {
            const result = enumFactory.toArray({
                fields: ['label', 'value']
            });

            expect(result[0]).toEqual({
                label: '待处理',
                value: 0
            });
            expect(result[0]).not.toHaveProperty('key');
        });

        it('应该支持自定义转换函数', () => {
            const result = enumFactory.toArray({
                transform: item => ({
                    text: item.label,
                    id: item.value
                })
            });

            expect(result[0]).toEqual({
                text: '待处理',
                id: 0
            });
        });

        it('应该支持过滤功能', () => {
            const result = enumFactory.toArray({
                filter: item => item.value > 2
            });

            expect(result).toHaveLength(2);
            expect(result[0].value).toBe(3);
            expect(result[1].value).toBe(4);
        });

        it('应该支持排序功能', () => {
            const result = enumFactory.toArray({
                sort: (a, b) => b.value - a.value
            });

            expect(result[0].value).toBe(4);
            expect(result[4].value).toBe(0);
        });

        it('应该支持组合使用过滤和排序', () => {
            const result = enumFactory.toArray({
                filter: item => item.value > 0,
                sort: (a, b) => b.value - a.value
            });

            expect(result).toHaveLength(4);
            expect(result[0].value).toBe(4);
            expect(result[3].value).toBe(1);
        });

        it('应该支持排除空值', () => {
            const enumWithEmpty = new EnumFactory('test', {
                EMPTY: { key: 'EMPTY', label: '空', value: '' },
                NULL: { key: 'NULL', label: '空', value: null },
                UNDEFINED: { key: 'UNDEFINED', label: '未定义', value: undefined },
                VALID: { key: 'VALID', label: '有效', value: 1 }
            });

            const result = enumWithEmpty.toArray({
                includeEmpty: false
            });

            expect(result).toHaveLength(1);
            expect(result[0].value).toBe(1);
        });

        it('应该支持包含空值', () => {
            const enumWithEmpty = new EnumFactory('test', {
                EMPTY: { key: 'EMPTY', label: '空', value: '' },
                NULL: { key: 'NULL', label: '空', value: null },
                UNDEFINED: { key: 'UNDEFINED', label: '未定义', value: undefined },
                VALID: { key: 'VALID', label: '有效', value: 1 }
            });

            const result = enumWithEmpty.toArray({
                includeEmpty: true
            });

            expect(result).toHaveLength(4);
        });

        it('应该支持扁平化结果', () => {
            const enumWithNested = new EnumFactory('test', {
                ITEM1: { key: 'ITEM1', label: '项目1', value: [1, 2] },
                ITEM2: { key: 'ITEM2', label: '项目2', value: [3, 4] }
            });

            const result = enumWithNested.toArray({
                transform: item => item.value,
                flatten: true
            });

            expect(result).toEqual([1, 2, 3, 4]);
        });

        it('应该支持复杂的组合场景', () => {
            const result = enumFactory.toArray({
                fields: ['label', 'value'],
                filter: item => item.value > 0,
                sort: (a, b) => b.value - a.value,
                transform: item => ({
                    text: `选项${item.value}: ${item.label}`,
                    value: item.value
                })
            });

            expect(result).toHaveLength(4);
            expect(result[0]).toEqual({
                text: '选项4: 失败',
                value: 4
            });
        });

        it('应该处理空的枚举工厂', () => {
            const emptyEnum = new EnumFactory('empty', {});
            const result = emptyEnum.toArray();
            expect(result).toHaveLength(0);
        });

        it('应该正确处理自定义属性', () => {
            const result = enumFactory.toArray({
                fields: ['key', 'label', 'value', 'disabled']
            });

            const failedItem = result.find(item => item.key === 'FAILED');
            expect(failedItem?.disabled).toBe(true);
        });
    });
}); 