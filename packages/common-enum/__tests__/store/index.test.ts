import { EnumStore } from '../../src/enumFactory/store/index';
import { EnumFactory } from '../../src/enumFactory/enumFactory';

describe('EnumStore', () => {
    let enumStore: EnumStore;
    const mockStatusEnum = new EnumFactory(
        "",
        {
            PENDING: { key: 'PENDING', label: '待处理', value: 0 },
            PROCESSING: { key: 'PROCESSING', label: '处理中', value: 1 },
            COMPLETED: { key: 'COMPLETED', label: '已完成', value: 2 }
        });

    const mockTypeEnum = new EnumFactory("", {
        TYPE_A: { key: 'TYPE_A', label: '类型A', value: 'a' },
        TYPE_B: { key: 'TYPE_B', label: '类型B', value: 'b' }
    });

    beforeEach(() => {
        enumStore = new EnumStore();
        // 注册测试用的枚举
        enumStore.register('status', mockStatusEnum);
        enumStore.register('type', mockTypeEnum);
    });

    describe('基础操作', () => {
        test('register 和 get', () => {
            const factory = enumStore.get('status');
            expect(factory).toBeDefined();
            expect(factory.getByKey('PENDING').value).toBe(0);
        });

        test('重复注册应该抛出错误', () => {
            expect(() => {
                enumStore.register('status', mockStatusEnum);
            }).toThrow();
        });

        test('获取不存在的枚举应该抛出错误', () => {
            expect(() => {
                enumStore.get('nonexistent');
            }).toThrow();
        });

        test('has', () => {
            expect(enumStore.has('status')).toBe(true);
            expect(enumStore.has('nonexistent')).toBe(false);
        });

        test('remove', () => {
            enumStore.remove('status');
            expect(enumStore.has('status')).toBe(false);
        });

        test('clear', () => {
            enumStore.clear();
            expect(enumStore.getKeys()).toHaveLength(0);
        });
    });

    describe('数据转换方法', () => {
        test('getOptions', () => {
            const options = enumStore.getOptions('status');
            expect(options).toHaveLength(3);
            expect(options[0]).toEqual({ label: '待处理', value: 0 });
        });

        test('getValues', () => {
            const values = enumStore.getValues('status');
            expect(values).toEqual([0, 1, 2]);
        });

        test('search', () => {
            const results = enumStore.search('status', '处理');
            expect(results).toHaveLength(2);
            expect(results[0].label).toBe('待处理');
            expect(results[1].label).toBe('处理中');
        });

        test('transform', () => {
            expect(enumStore.transform('status', 0, 'label')).toBe('待处理');
            expect(enumStore.transform('status', 0, 'key')).toBe('PENDING');
            expect(enumStore.transform('status', 0, 'full')).toEqual({
                key: 'PENDING',
                label: '待处理',
                value: 0
            });
        });
    });

    describe('扩展方法', () => {
        test('getLabelValueMap', () => {
            const map = enumStore.getLabelValueMap('status');
            expect(map).toEqual({
                '待处理': 0,
                '处理中': 1,
                '已完成': 2
            });
        });

        test('getValueByLabel', () => {
            expect(enumStore.getValueByLabel('status', '待处理')).toBe(0);
            expect(enumStore.getValueByLabel('status', '不存在')).toBeUndefined();
        });

        test('filter', () => {
            const filtered = enumStore.filter('status', item => item.value > 0);
            expect(filtered).toHaveLength(2);
            expect(filtered[0].value).toBe(1);
        });

        test('size', () => {
            expect(enumStore.size('status')).toBe(3);
            expect(enumStore.size('type')).toBe(2);
        });

        test('validate', () => {
            expect(enumStore.validate('status', 0)).toBe(true);
            expect(enumStore.validate('status', 999)).toBe(false);
        });

        test('merge', () => {
            const mergeSourceEnum = new EnumFactory({
                NEW_STATUS: { key: 'NEW_STATUS', label: '新状态', value: 3 }
            });
            enumStore.register('mergeSource', mergeSourceEnum);

            enumStore.merge('status', 'mergeSource');
            expect(enumStore.size('status')).toBe(4);
            expect(enumStore.validate('status', 3)).toBe(true);
        });
    });

    describe('观察者模式', () => {
        test('subscribe', () => {
            const mockObserver = jest.fn();
            const unsubscribe = enumStore.subscribe(mockObserver);

            enumStore.register('newEnum', mockTypeEnum);
            expect(mockObserver).toHaveBeenCalledWith('newEnum', 'register');

            unsubscribe();
            enumStore.remove('newEnum');
            expect(mockObserver).toHaveBeenCalledTimes(1);
        });
    });

    describe('导入导出', () => {
        test('export 和 import', () => {
            const exported = enumStore.export();
            enumStore.clear();
            enumStore.import(exported);

            expect(enumStore.has('status')).toBe(true);
            expect(enumStore.has('type')).toBe(true);
            expect(enumStore.getValueByLabel('status', '待处理')).toBe(0);
        });
    });

    describe('配置管理', () => {
        test('updateConfig 和 getConfig', () => {
            const newConfig = {
                enableCache: false,
                cacheTTL: 1000,
                global: {
                    debug: true
                }
            };

            enumStore.updateConfig(newConfig);
            const config = enumStore.getConfig();

            expect(config.enableCache).toBe(false);
            expect(config.cacheTTL).toBe(1000);
            expect(config.global.debug).toBe(true);
            // 确保其他配置保持默认值
            expect(config.global.autoLoad).toBe(true);
        });
    });
}); 