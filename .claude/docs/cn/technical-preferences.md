# 技术偏好

<!-- 由 /setup-engine 填充。随着用户在开发过程中做出决策而更新。 -->
<!-- 所有智能体引用此文件以获取项目特定的标准和约定。 -->

## 引擎和语言

- **引擎**: Godot 4.6
- **语言**: GDScript（主要），通过 GDExtension 使用 C++（性能关键）
- **渲染**: Forward+（桌面），Mobile（移动/网页）
- **物理**: Godot Physics 2D/3D

## 命名约定

- **类**: PascalCase（例如 `PlayerController`）
- **变量/函数**: snake_case（例如 `move_speed`）
- **信号**: snake_case 过去时（例如 `health_changed`）
- **文件**: 与类匹配的 snake_case（例如 `player_controller.gd`）
- **场景/预制件**: 与根节点匹配的 PascalCase（例如 `PlayerController.tscn`）
- **常量**: UPPER_SNAKE_CASE（例如 `MAX_HEALTH`）

## 性能预算

- **目标帧率**: 60 FPS
- **帧预算**: 16.6ms
- **绘制调用**: < 500（移动），< 2000（桌面）
- **内存上限**: 200MB（移动），1GB（桌面）

## 测试

- **框架**: GUT（Godot Unit Testing）
- **最低覆盖率**: 游戏系统 70%
- **必需测试**: 平衡公式、游戏系统、网络（如适用）

## 禁止模式

<!-- 添加绝不应出现在此项目代码库中的模式 -->
- [尚未配置 — 在做出架构决策时添加]

## 允许的库 / 插件

<!-- 在此处添加批准的第三方依赖项 -->
- [尚未配置 — 在批准依赖项时添加]

## 架构决策日志

<!-- 快速参考，链接到 docs/architecture/ 中的完整 ADR -->
- [尚无 ADR — 使用 /architecture-decision 创建一个]
