import { EnumFactory } from '../../src/enumFactory/enumFactory';

describe('EnumFactory 测试', () => {
    /**
     * 简单字符串枚举测试数据
     */
    const simpleEnum = {
        DRAFT: '草稿',
        PUBLISHED: '已发布',
        ARCHIVED: '已归档'
    };

    /**
     * 复杂对象枚举测试数据
     */
    const complexEnum = [
        { key: 'DRAFT', label: '草稿', value: 0, color: 'gray' },
        { key: 'PUBLISHED', label: '已发布', value: 1, color: 'green' },
        { key: 'ARCHIVED', label: '已归档', value: 2, color: 'blue' }
    ].reduce((acc, curr) => ({ ...acc, [curr.key]: curr }), {});

    describe('基础功能测试', () => {
        /**
         * 测试简单字符串枚举的初始化
         */
        test('应正确初始化简单字符串枚举', () => {
            const factory = new EnumFactory(simpleEnum);
            expect(factory.getKeys()).toEqual(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
            expect(factory.getLabels()).toEqual(['草稿', '已发布', '已归档']);
        });

        /**
         * 测试复杂对象枚举的初始化
         */
        test('应正确初始化复杂对象枚举', () => {
            const factory = new EnumFactory<number>(complexEnum);
            expect(factory.getByKey('DRAFT')?.value).toBe(0);
            expect(factory.getByValue(1)?.label).toBe('已发布');
        });
    });

    describe('查询功能测试', () => {
        const factory = new EnumFactory<number>(complexEnum);

        /**
         * 测试通过键查询
         */
        test('应能通过键查询到正确的枚举项', () => {
            const item = factory.getByKey('DRAFT');
            expect(item?.label).toBe('草稿');
            expect(item?.value).toBe(0);
        });

        /**
         * 测试标签搜索功能
         */
        test('应能正确执行标签搜索', () => {
            const results = factory.searchByLabel('草稿');
            expect(results).toHaveLength(1);
            expect(results[0].key).toBe('DRAFT');
        });

        /**
         * 测试带高亮的文本搜索
         */
        test('应能正确执行带高亮的文本搜索', () => {
            const results = factory.searchByTextWithHighlight('草稿');
            expect(results[0].label).toContain('<mark');
            expect(results[0].label).toContain('草稿');
        });
    });

    describe('更新和删除功能测试', () => {
        let factory: EnumFactory<number>;

        beforeEach(() => {
            factory = new EnumFactory<number>(complexEnum);
        });

        /**
         * 测试更新枚举项
         */
        test('应能正确更新枚举项', () => {
            factory.updateItem('DRAFT', { label: '新草稿' });
            expect(factory.getByKey('DRAFT')?.label).toBe('新草稿');
        });

        /**
         * 测试删除枚举项
         */
        test('应能正确删除枚举项', () => {
            factory.deleteEntry('DRAFT');
            expect(factory.getByKey('DRAFT')).toBeUndefined();
            expect(factory.getKeys()).toHaveLength(2);
        });
    });

    describe('工具函数测试', () => {
        const factory = new EnumFactory<number>(complexEnum);

        /**
         * 测试表格格式化函数
         */
        test('表格格式化函数应返回正确的标签', () => {
            expect(factory.tableFormater(null, null, 0)).toBe('草稿');
            expect(factory.tableFormater(null, null, 'DRAFT')).toBe('草稿');
            expect(factory.tableFormater(null, null, '不存在')).toBe('notfound');
        });

        /**
         * 测试反转功能
         */
        test('应能正确反转枚举项顺序', () => {
            const originalFirst = factory.getFirst(1)[0];
            factory.reverse();
            const newFirst = factory.getFirst(1)[0];
            expect(originalFirst).not.toEqual(newFirst);
        });

        /**
         * 测试过滤功能
         */
        test('应能正确过滤枚举项', () => {
            const filtered = factory.filter(item => item.value! > 0);
            expect(filtered).toHaveLength(2);
            expect(filtered[0].key).toBe('PUBLISHED');
        });
    });
});