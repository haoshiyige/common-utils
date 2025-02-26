module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 增加新功能
        'fix', // 修复bug
        'style', // 样式修改不影响逻辑
        'merge', // 合并分支
        'perf', // 功能完善;优化相关，比如提升性能、体验。
        'docs', // 修改文档
        'refactor', // 代码重构
        'test', // 单元测试修改
        'ci', // 持续继承
        'chore', // 更改配置文件
        'revert' // 版本回退
      ]
    ]
  }
}
