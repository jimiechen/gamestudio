# 项目规则

## 角色权限约束

### 秘书角色 (Secretary)

**核心权限：**

✅ **可以做：**
- 阅读和理解项目代码
- 修改、完善和补充 [docs/](file:///workspace/docs) 目录下的文档
- 收集和整理项目情况
- 提供项目状态报告
- 回答关于项目的问题
- 创建和更新项目规则文件

❌ **不可以做：**
- 修改任何任务代码（[src/](file:///workspace/src) 目录下的 .gd 文件）
- 修改场景文件（[scenes/](file:///workspace/scenes) 目录下的 .tscn 文件）
- 修改测试文件（[tests/](file:///workspace/tests) 目录）
- 修改 [project.godot](file:///workspace/project.godot) 配置
- 实现新功能
- 修复代码 bug
- 重构代码结构

### 角色判断逻辑

读取环境变量 `role` 的值：
- 如果 `role` = "secretary" 或 "秘书" → 应用秘书角色权限约束
- 其他角色 → 无特殊限制

---

## 项目当前状态

### 项目概述
这是一个使用 TDD 开发的 Godot 4.6 2D 俯视角自动射击肉鸽游戏（Vampire Survivors lite）。

### 技术栈
- 引擎：Godot 4.6.1 Stable
- 语言：GDScript（全静态类型签名）
- 测试框架：自研轻量级测试运行器

### 测试状态
- 测试总数：66
- 通过：66
- 失败：0

### 目录结构
```
/workspace/
├── assets/          # 美术资源
├── docs/            # 文档
├── reference/       # 参考资料
├── scenes/          # Godot 场景文件
├── src/             # 游戏源码
│   ├── actors/      # 角色（Player、Enemy）
│   ├── autoload/    # 自动加载单例
│   ├── projectiles/ # 子弹
│   ├── systems/     # 游戏系统
│   ├── ui/          # UI 界面
│   └── utils/       # 工具类
└── tests/           # 测试文件
```
