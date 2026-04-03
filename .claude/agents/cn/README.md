# Claude Code 游戏工作室 - 智能体使用指南

本文档介绍 Claude Code 游戏工作室架构中的 48 个专业 AI 智能体，帮助你了解每个智能体的职责和使用场景。

## 智能体层级结构

```
Tier 1 (Opus) - 领导层
├── creative-director      创意总监
├── technical-director     技术总监
└── producer               制作人

Tier 2 (Sonnet) - 部门负责人
├── game-designer          游戏设计师
├── lead-programmer        主程序员
├── art-director           美术总监
├── audio-director         音频总监
├── narrative-director     叙事总监
├── qa-lead                QA 主管
├── release-manager        发布经理
└── localization-lead      本地化主管

Tier 3 (Sonnet/Haiku) - 专业人员
├── 设计师
├── 程序员
├── 美术师
├── 音频
├── QA
└── 其他专家
```

---

## Tier 1 - 领导层智能体 (Opus)

### creative-director（创意总监）
**使用场景**：重大创意决策、支柱冲突、基调/方向问题

**何时使用**：
- 游戏设计 vs 叙事冲突（游戏叙事对齐）
- 美术 vs 音频基调分歧（美学连贯性）
- 任何"这会改变游戏身份"的决策
- 部门负责人无法解决的支柱冲突
- 创意意图与生产能力碰撞的范围问题

**核心能力**：
- 愿景守护和支柱管理
- MDA 框架应用
- 玩家心理学（SDT、心流状态）
- 范围削减优先级

---

### technical-director（技术总监）
**使用场景**：架构决策、技术选择、性能策略

**何时使用**：
- 代码决策影响架构时
- 任何跨系统技术冲突
- 性能预算违规
- 技术采用请求

**核心能力**：
- 架构所有权和 ADR 创建
- 技术评估和批准
- 性能预算管理
- 技术风险评估

---

### producer（制作人）
**使用场景**：冲刺规划、里程碑跟踪、风险管理、跨部门协调

**何时使用**：
- 任何调度冲突
- 部门之间的资源竞争
- 来自任何智能体的范围担忧
- 外部依赖延迟

**核心能力**：
- 冲刺规划和里程碑管理
- 范围管理和协商
- 风险管理和登记
- 跨部门协调

---

## Tier 2 - 部门负责人智能体 (Sonnet)

### game-designer（游戏设计师）
**使用场景**：机制、系统、进度、经济、平衡

**何时使用**：
- 设计核心循环和系统
- 创建游戏设计文档 (GDD)
- 平衡数值和经济
- 应用游戏设计理论（MDA、SDT、Bartle）

**委派给**：
- `systems-designer` - 详细子系统设计
- `level-designer` - 空间和遭遇设计
- `economy-designer` - 经济平衡和战利品表

---

### lead-programmer（主程序员）
**使用场景**：代码架构、代码审查、API 设计、重构

**何时使用**：
- 代码级架构设计
- 代码审查和质量控制
- API 设计和接口契约
- 重构策略规划

**委派给**：
- `gameplay-programmer` - 游戏功能实现
- `engine-programmer` - 核心引擎系统
- `ai-programmer` - AI 和行为系统
- `network-programmer` - 网络功能
- `tools-programmer` - 开发工具
- `ui-programmer` - UI 系统实现

---

### art-director（美术总监）
**使用场景**：风格指南、美术圣经、资源标准、UI/UX 方向

**何时使用**：
- 定义视觉风格和方向
- 创建美术圣经
- 审查资源合规性
- UI/UX 视觉方向

---

### audio-director（音频总监）
**使用场景**：音乐方向、声音调色板、音频实现策略

**何时使用**：
- 定义音频方向和风格
- 创建声音圣经
- 音乐和 SFX 策略
- 音频技术选择

---

### narrative-director（叙事总监）
**使用场景**：故事弧线、世界观构建、角色设计、对话策略

**何时使用**：
- 故事和情节设计
- 世界观和传说构建
- 角色发展和弧线
- 对话系统策略

---

### qa-lead（QA 主管）
**使用场景**：测试策略、Bug 分类、发布准备、回归规划

**何时使用**：
- 定义测试策略
- Bug 分类和优先级
- 发布准备评估
- 回归测试规划

---

### release-manager（发布经理）
**使用场景**：构建管理、版本控制、变更日志、部署、回滚

**何时使用**：
- 管理发布流程
- 版本控制和标记
- 生成变更日志
- 部署和回滚策略

---

### localization-lead（本地化主管）
**使用场景**：字符串外部化、翻译流程、本地化测试

**何时使用**：
- 准备翻译字符串
- 管理翻译流程
- 本地化测试
- 多语言支持策略

---

## Godot 引擎特定智能体

### godot-specialist（Godot 专家）
**使用场景**：Godot 架构、API 和优化

**何时使用**：
- 添加新的自动加载或单例
- 为新系统设计场景/节点架构
- 在 GDScript、C# 或 GDExtension 之间选择
- 使用 Godot 的 Control 节点设置输入映射或 UI
- 为任何平台配置导出预设
- 优化 Godot 中的渲染、物理或内存

**委派给**：
- `godot-gdscript-specialist` - GDScript 架构
- `godot-shader-specialist` - 着色器和视觉效果
- `godot-gdextension-specialist` - C++/Rust 原生绑定

---

### godot-gdscript-specialist（GDScript 专家）
**使用场景**：GDScript 代码质量、静态类型、设计模式

**核心能力**：
- 强制执行静态类型
- 信号架构设计
- 状态机实现
- 资源模式
- 性能优化

**何时使用**：
- 编写 GDScript 代码
- 审查 GDScript 质量
- 优化 GDScript 性能
- 设计 GDScript 架构

---

### godot-shader-specialist（Godot 着色器专家）
**使用场景**：Godot 着色语言、可视化着色器、粒子

**核心能力**：
- Godot 着色语言（GLSL 风格）
- 可视化着色器图
- 粒子着色器
- 后处理效果
- 着色器性能优化

**何时使用**：
- 编写自定义着色器
- 创建视觉效果
- 优化 GPU 性能
- 设计材质系统

---

### godot-gdextension-specialist（GDExtension 专家）
**使用场景**：C++/Rust 绑定、原生性能、自定义节点

**核心能力**：
- godot-cpp (C++ 绑定)
- godot-rust (Rust 绑定)
- 原生代码优化
- 自定义节点类型
- 跨平台编译

**何时使用**：
- 性能关键计算
- 大数据处理
- 与原生库集成
- 自定义服务器实现

---

## 快速参考：按任务选择智能体

| 我需要... | 使用这个智能体 |
|-----------|---------------|
| 设计新机制 | `game-designer` |
| 编写战斗代码 | `gameplay-programmer` |
| 创建着色器 | `godot-shader-specialist` |
| 编写对话 | `writer` |
| 规划下一个冲刺 | `producer` |
| 审查代码质量 | `lead-programmer` |
| 编写测试用例 | `qa-tester` |
| 设计关卡 | `level-designer` |
| 修复性能问题 | `performance-analyst` |
| 设置 CI/CD | `devops-engineer` |
| 设计战利品表 | `economy-designer` |
| 解决创意冲突 | `creative-director` |
| 做架构决策 | `technical-director` |
| 管理发布 | `release-manager` |
| 准备翻译字符串 | `localization-lead` |
| 快速测试机制想法 | `prototyper` |
| 审查代码安全问题 | `security-engineer` |
| 检查无障碍合规性 | `accessibility-specialist` |
| 获取 Godot 建议 | `godot-specialist` |
| 编写地道 GDScript | `godot-gdscript-specialist` |
| 创建 Godot 着色器 | `godot-shader-specialist` |
| 构建 GDExtension 模块 | `godot-gdextension-specialist` |
| 规划实时活动 | `live-ops-designer` |
| 为玩家编写补丁说明 | `community-manager` |
| 头脑风暴新游戏想法 | `/brainstorm` 技能 |

---

## 协调规则

1. **垂直委派**：领导智能体委派给部门负责人，部门负责人委派给专业人员。对于复杂决策，永远不要跳过层级。
2. **横向协商**：同一层级的智能体可以相互协商，但不能在其领域之外做出具有约束力的决策。
3. **冲突解决**：当两个智能体意见不一致时，升级到共同的上级。如果没有共同上级，将设计冲突升级到 `creative-director`，将技术冲突升级到 `technical-director`。
4. **变更传播**：当设计变更影响多个领域时，`producer` 智能体协调传播。
5. **禁止单方面跨域更改**：智能体绝不能未经明确委派就修改其指定目录之外的文件。

---

## 使用示例

### 示例 1：设计并实现玩家移动系统

```
1. 委派给 game-designer 创建设计文档
   "设计一个平台跳跃移动系统，包含二段跳和冲刺"

2. 设计完成后，委派给 gameplay-programmer 实现
   "根据 design/gdd/player-movement.md 实现移动系统"

3. 如果需要 Godot 特定优化，咨询 godot-specialist
   "这个移动系统的物理性能如何优化？"

4. 完成后，委派给 qa-tester 编写测试
   "为移动系统编写单元测试"
```

### 示例 2：解决设计冲突

```
1. game-designer 和 narrative-director 对某个机制有分歧

2. 升级到 creative-director 进行裁决
   "game-designer 想要 X，narrative-director 想要 Y，如何决定？"

3. creative-director 分析并做出决策

4. 决策级联回相关部门执行
```

### 示例 3：冲刺规划

```
1. 委派给 producer 规划冲刺
   "/sprint-plan new"

2. producer 创建冲刺计划并分配任务给各个智能体

3. 每日状态更新
   "/sprint-plan status"

4. 冲刺结束后进行回顾
   "/retrospective"
```

---

## 更多信息

- 完整的智能体列表和层级结构：[agent-roster.md](../../docs/cn/agent-roster.md)
- 智能体协调和委派映射：[agent-coordination-map.md](../../docs/cn/agent-coordination-map.md)
- 协调规则详细说明：[coordination-rules.md](../../docs/cn/coordination-rules.md)
- 协作协议模板：[collaborative-protocols/](../../docs/cn/collaborative-protocols/)

---

**提示**：不确定使用哪个智能体？运行 `/start` 命令，系统会引导你到正确的工作流程！
