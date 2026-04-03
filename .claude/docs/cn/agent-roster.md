# 智能体名册

以下智能体可用。每个在 `.claude/agents/` 中都有专用的定义文件。
根据手头任务使用最合适的智能体。当任务跨越多个领域时，
协调智能体（通常是 `producer` 或领域负责人）应该委派给专业人员。

## Tier 1 -- 领导智能体 (Opus)
| 智能体 | 领域 | 何时使用 |
|-------|--------|-------------|
| `creative-director` | 高层愿景 | 重大创意决策、支柱冲突、基调/方向 |
| `technical-director` | 技术愿景 | 架构决策、技术栈选择、性能策略 |
| `producer` | 制作管理 | 冲刺规划、里程碑跟踪、风险管理、协调 |

## Tier 2 -- 部门负责人智能体 (Sonnet)
| 智能体 | 领域 | 何时使用 |
|-------|--------|-------------|
| `game-designer` | 游戏设计 | 机制、系统、进度、经济、平衡 |
| `lead-programmer` | 代码架构 | 系统设计、代码审查、API 设计、重构 |
| `art-director` | 视觉方向 | 风格指南、美术圣经、资源标准、UI/UX 方向 |
| `audio-director` | 音频方向 | 音乐方向、声音调色板、音频实现策略 |
| `narrative-director` | 故事和编剧 | 故事弧线、世界观构建、角色设计、对话策略 |
| `qa-lead` | 质量保证 | 测试策略、Bug 分类、发布准备、回归规划 |
| `release-manager` | 发布流程 | 构建管理、版本控制、变更日志、部署、回滚 |
| `localization-lead` | 国际化 | 字符串外部化、翻译流程、本地化测试 |

## Tier 3 -- 专业智能体 (Sonnet 或 Haiku)
| 智能体 | 领域 | 模型 | 何时使用 |
|-------|--------|-------|-------------|
| `systems-designer` | 系统设计 | Sonnet | 特定机制实现、公式设计、循环 |
| `level-designer` | 关卡设计 | Sonnet | 关卡布局、节奏、遭遇设计、流程 |
| `economy-designer` | 经济/平衡 | Sonnet | 资源经济、战利品表、进度曲线 |
| `gameplay-programmer` | 游戏代码 | Sonnet | 功能实现、游戏系统代码 |
| `engine-programmer` | 引擎系统 | Sonnet | 核心引擎、渲染、物理、内存管理 |
| `ai-programmer` | AI 系统 | Sonnet | 行为树、寻路、NPC 逻辑、状态机 |
| `network-programmer` | 网络 | Sonnet | 网络代码、复制、延迟补偿、匹配 |
| `tools-programmer` | 开发工具 | Sonnet | 编辑器扩展、流程工具、调试工具 |
| `ui-programmer` | UI 实现 | Sonnet | UI 框架、界面、控件、数据绑定 |
| `technical-artist` | 技术美术 | Sonnet | 着色器、VFX、优化、美术流程工具 |
| `sound-designer` | 声音设计 | Haiku | SFX 设计文档、音频事件列表、混音说明 |
| `writer` | 对话/传说 | Sonnet | 对话编写、传说条目、物品描述 |
| `world-builder` | 世界/传说设计 | Sonnet | 世界规则、派系设计、历史、地理 |
| `qa-tester` | 测试执行 | Haiku | 编写测试用例、Bug 报告、测试检查清单 |
| `performance-analyst` | 性能 | Sonnet | 性能分析、优化建议、内存分析 |
| `devops-engineer` | 构建/部署 | Haiku | CI/CD、构建脚本、版本控制工作流 |
| `analytics-engineer` | 遥测 | Sonnet | 事件跟踪、仪表板、A/B 测试设计 |
| `ux-designer` | UX 流程 | Sonnet | 用户流程、线框图、无障碍性、输入处理 |
| `prototyper` | 快速原型 | Sonnet | 一次性原型、机制测试、可行性验证 |
| `security-engineer` | 安全 | Sonnet | 反作弊、漏洞预防、存档加密、网络安全 |
| `accessibility-specialist` | 无障碍性 | Haiku | WCAG 合规、色盲模式、重映射、文本缩放 |
| `live-ops-designer` | 实时运营 | Sonnet | 赛季、活动、战斗通行证、留存、实时经济 |
| `community-manager` | 社区 | Haiku | 补丁说明、玩家反馈、危机沟通、社区健康 |

## 引擎特定智能体（使用与你的引擎匹配的套件）

### 引擎负责人

| 智能体 | 引擎 | 模型 | 何时使用 |
| ---- | ---- | ---- | ---- |
| `unreal-specialist` | Unreal Engine 5 | Sonnet | 蓝图 vs C++、GAS 概述、UE 子系统、Unreal 优化 |
| `unity-specialist` | Unity | Sonnet | MonoBehaviour vs DOTS、Addressables、URP/HDRP、Unity 优化 |
| `godot-specialist` | Godot 4 | Sonnet | GDScript 模式、节点/场景架构、信号、Godot 优化 |

### Unreal Engine 子专家

| 智能体 | 子系统 | 模型 | 何时使用 |
| ---- | ---- | ---- | ---- |
| `ue-gas-specialist` | Gameplay Ability System | Sonnet | 能力、游戏效果、属性集、标签、预测 |
| `ue-blueprint-specialist` | 蓝图架构 | Sonnet | BP/C++ 边界、图表标准、命名、BP 优化 |
| `ue-replication-specialist` | 网络/复制 | Sonnet | 属性复制、RPC、预测、相关性、带宽 |
| `ue-umg-specialist` | UMG/CommonUI | Sonnet | 控件层级、数据绑定、CommonUI 输入、UI 性能 |

### Unity 子专家

| 智能体 | 子系统 | 模型 | 何时使用 |
| ---- | ---- | ---- | ---- |
| `unity-dots-specialist` | DOTS/ECS | Sonnet | Entity Component System、Jobs、Burst 编译器、混合渲染器 |
| `unity-shader-specialist` | 着色器/VFX | Sonnet | Shader Graph、VFX Graph、URP/HDRP 定制、后处理 |
| `unity-addressables-specialist` | 资源管理 | Sonnet | Addressable 组、异步加载、内存、内容交付 |
| `unity-ui-specialist` | UI Toolkit/UGUI | Sonnet | UI Toolkit、UXML/USS、UGUI Canvas、数据绑定、跨平台输入 |

### Godot 子专家

| 智能体 | 子系统 | 模型 | 何时使用 |
| ---- | ---- | ---- | ---- |
| `godot-gdscript-specialist` | GDScript | Sonnet | 静态类型、设计模式、信号、协程、GDScript 性能 |
| `godot-shader-specialist` | 着色器/渲染 | Sonnet | Godot 着色语言、可视化着色器、粒子、后处理 |
| `godot-gdextension-specialist` | GDExtension | Sonnet | C++/Rust 绑定、原生性能、自定义节点、构建系统 |
