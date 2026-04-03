# Claude Code 游戏工作室 - Godot 2D 游戏开发指南

欢迎来到 Claude Code 游戏工作室中文文档！本指南将帮助你使用这个 AI 驱动的游戏开发架构来创建 Godot 2D 游戏。

## 目录

### 快速入门
- [快速入门指南](quick-start.md) - 了解架构概述和基本使用方法
- [设置要求](setup-requirements.md) - 安装必要的工具和依赖
- [目录结构](directory-structure.md) - 项目文件夹组织方式

### 核心概念
- [智能体名册](agent-roster.md) - 48 个专业 AI 智能体及其职责
- [智能体协调映射](agent-coordination-map.md) - 委派规则和升级路径
- [协调规则](coordination-rules.md) - 智能体如何协作
- [审查工作流程](review-workflow.md) - 代码和设计审查流程

### 开发标准
- [编码标准](coding-standards.md) - 代码和设计文档规范
- [技术偏好](technical-preferences.md) - Godot 4.6 项目配置
- [上下文管理](context-management.md) - 高效管理 AI 会话上下文
- [路径特定规则](rules-reference.md) - 自动执行的代码规范

### 可用技能（斜杠命令）
- [技能参考](skills-reference.md) - 所有 37 个斜杠命令的完整列表

### 钩子系统
- [活动钩子](hooks-reference.md) - 自动化工作流钩子概览
- [代码质量钩子](hooks-reference/pre-commit-code-quality.md) - 提交前代码检查
- [测试关卡钩子](hooks-reference/pre-push-test-gate.md) - 推送前测试验证
- [资源验证钩子](hooks-reference/post-merge-asset-validation.md) - 合并后资源检查

### 文档模板
- [游戏设计文档模板](templates/game-design-document.md) - 设计新机制/系统
- [技术设计文档模板](templates/technical-design-document.md) - 系统技术设计
- [游戏概念模板](templates/game-concept.md) - 初始游戏概念
- [冲刺计划模板](templates/sprint-plan.md) - 敏捷开发规划

### 协作协议
- [设计智能体协议](collaborative-protocols/design-agent-protocol.md) - 如何与设计智能体协作
- [实现智能体协议](collaborative-protocols/implementation-agent-protocol.md) - 如何与程序员智能体协作
- [领导智能体协议](collaborative-protocols/leadership-agent-protocol.md) - 如何与总监智能体协作

---

## Godot 2D 游戏开发快速开始

### 第一步：初始化项目

```bash
# 运行启动命令，系统会询问你的项目状态
/start

# 或者直接设置 Godot 引擎
/setup-engine godot 4.6
```

### 第二步：创建游戏概念

使用游戏概念模板来定义你的游戏：

1. 复制 [game-concept.md](templates/game-concept.md) 到 `design/gdd/my-game-concept.md`
2. 填写电梯演讲、核心幻想、独特卖点
3. 使用 MDA 框架分析玩家体验
4. 定义游戏支柱和反支柱
5. 运行 `/design-review design/gdd/my-game-concept.md` 验证

### 第三步：分解系统

```bash
# 将游戏概念分解为可实现的系统
/map-systems
```

这会：
- 识别所有需要的游戏系统
- 映射系统间的依赖关系
- 确定设计优先级
- 为每个系统生成 GDD 模板

### 第四步：设计核心系统

```bash
# 为特定系统设计详细文档
/design-system [系统名称]

# 例如：
/design-system player-movement
/design-system combat
/design-system inventory
```

### 第五步：实现功能

根据设计文档，使用适当的智能体实现代码：

- **游戏玩法代码**: `gameplay-programmer`
- **Godot 特定代码**: `godot-gdscript-specialist`
- **着色器**: `godot-shader-specialist`
- **UI 实现**: `ui-programmer`

### 第六步：测试和迭代

```bash
# 创建原型验证核心循环
/prototype [核心机制]

# 进行游戏测试
/playtest-report

# 检查平衡
/balance-check
```

### 第七步：冲刺规划

```bash
# 创建冲刺计划
/sprint-plan new

# 每日状态更新
/sprint-plan status
```

---

## Godot 特定资源

### 推荐的 Godot 智能体

| 任务 | 智能体 |
|------|--------|
| Godot 架构建议 | `godot-specialist` |
| GDScript 代码 | `godot-gdscript-specialist` |
| Godot 着色器 | `godot-shader-specialist` |
| GDExtension (C++) | `godot-gdextension-specialist` |

### Godot 命名约定

- **类**: PascalCase (例如 `PlayerController`)
- **变量/函数**: snake_case (例如 `move_speed`)
- **信号**: snake_case 过去时 (例如 `health_changed`)
- **文件**: 与类匹配的 snake_case (例如 `player_controller.gd`)
- **场景**: 与根节点匹配的 PascalCase (例如 `Player.tscn`)
- **常量**: UPPER_SNAKE_CASE (例如 `MAX_HEALTH`)

### Godot 性能预算

- **目标帧率**: 60 FPS
- **帧预算**: 16.6ms
- **绘制调用**: < 500 (移动), < 2000 (桌面)
- **内存上限**: 200MB (移动), 1GB (桌面)

---

## 工作流程示例

### 示例 1：创建玩家移动系统

```bash
# 1. 设计系统
/design-system player-movement

# 2. 实现代码（委派给 gameplay-programmer）
# 3. 编写测试（GUT 框架）
# 4. 代码审查
/code-review src/gameplay/player/movement_controller.gd
```

### 示例 2：实现战斗系统

```bash
# 1. 协调战斗团队
/team-combat

# 2. 设计战斗机制
/design-system combat

# 3. 原型验证
/prototype combat

# 4. 游戏测试
/playtest-report
```

### 示例 3：发布准备

```bash
# 1. 运行发布检查清单
/release-checklist

# 2. 协调发布团队
/team-release

# 3. 生成补丁说明
/patch-notes

# 4. 最终验证
/launch-checklist
```

---

## 最佳实践

### 1. 始终从设计开始
- 使用 GDD 模板记录每个系统
- 在设计文档中获得批准后再实现
- 保持设计与代码同步

### 2. 数据驱动开发
- 所有游戏数值放入配置文件
- 使用 Godot 的 Resource 系统管理数据
- 避免硬编码魔法数字

### 3. 测试优先
- 使用 GUT 框架编写单元测试
- 目标覆盖率：游戏系统 70%
- 在提交前运行测试关卡

### 4. 版本控制
- 使用 Git 进行版本控制
- 遵循分支策略：feature → develop → main
- 提交信息引用设计文档或任务 ID

### 5. 上下文管理
- 使用 `production/session-state/active.md` 跟踪进度
- 在上下文压缩前保存状态
- 会话崩溃后从状态文件恢复

---

## 常见问题

### Q: 如何选择正确的智能体？
A: 问自己："在真实游戏工作室中，哪个部门会处理这个？" 参考 [agent-roster.md](agent-roster.md) 的智能体列表。

### Q: 遇到设计冲突怎么办？
A: 升级到共同的父级智能体。设计冲突升级到 `creative-director`，技术冲突升级到 `technical-director`。

### Q: 如何验证设计文档？
A: 运行 `/design-review [文件路径]` 来检查完整性和一致性。

### Q: 代码审查失败怎么办？
A: 根据失败类型调用相应智能体：
- 样式问题：`lead-programmer`
- 架构问题：`technical-director`
- 游戏逻辑：`gameplay-programmer`

### Q: 如何处理技术债务？
A: 运行 `/tech-debt` 扫描、跟踪和优先处理技术债务。

---

## 资源链接

- [Godot 官方文档](https://docs.godotengine.org/)
- [GDScript 风格指南](https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_styleguide.html)
- [Godot 最佳实践](https://docs.godotengine.org/en/stable/tutorials/best_practices/index.html)

---

## 获取帮助

如果你在使用过程中遇到问题：

1. 查看相关文档（本目录中的 .md 文件）
2. 运行 `/start` 获取引导式帮助
3. 询问适当的智能体（参考 [agent-roster.md](agent-roster.md)）
4. 使用 `AskUserQuestion` 工具向 AI 提出具体问题

---

**祝你的 Godot 2D 游戏开发之旅顺利！**
