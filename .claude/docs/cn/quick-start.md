# 游戏工作室智能体架构 -- 快速入门指南

## 这是什么？

这是一个完整的 Claude Code 智能体架构，用于游戏开发。它将 48 个专业 AI 智能体组织成一个模拟真实游戏开发团队的工作室层级结构，包含明确的职责、委派规则和协调协议。它包含针对 Godot、Unity 和 Unreal 的引擎专家智能体 —— 每个引擎都有专门的子专家负责主要子系统。所有设计智能体和模板都基于成熟的游戏设计理论（MDA 框架、自我决定理论、心流状态、Bartle 玩家类型）。使用与你的项目匹配的引擎套件。

## 如何使用

### 1. 了解层级结构

智能体分为三个层级：

- **Tier 1 (Opus)**：负责高层决策的总监
  - `creative-director`（创意总监）-- 愿景和创意冲突解决
  - `technical-director`（技术总监）-- 架构和技术决策
  - `producer`（制作人）-- 日程安排、协调和风险管理

- **Tier 2 (Sonnet)**：部门负责人，负责各自领域
  - `game-designer`（游戏设计师）、`lead-programmer`（主程序员）、`art-director`（美术总监）、`audio-director`（音频总监）、
    `narrative-director`（叙事总监）、`qa-lead`（QA 主管）、`release-manager`（发布经理）、`localization-lead`（本地化主管）

- **Tier 3 (Sonnet/Haiku)**：在各自领域执行的专业人员
  - 设计师、程序员、美术师、编剧、测试员、工程师

### 2. 为任务选择合适的智能体

问自己："在真实的游戏工作室中，哪个部门会处理这个？"

| 我需要... | 使用这个智能体 |
|-------------|---------------|
| 设计新机制 | `game-designer` |
| 编写战斗代码 | `gameplay-programmer` |
| 创建着色器 | `technical-artist` |
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
| 获取 Unreal Engine 建议 | `unreal-specialist` |
| 获取 Unity 建议 | `unity-specialist` |
| 获取 Godot 建议 | `godot-specialist` |
| 设计 GAS 能力/效果 | `ue-gas-specialist` |
| 定义 BP/C++ 边界 | `ue-blueprint-specialist` |
| 实现 UE 复制 | `ue-replication-specialist` |
| 构建 UMG/CommonUI 控件 | `ue-umg-specialist` |
| 设计 DOTS/ECS 架构 | `unity-dots-specialist` |
| 编写 Unity 着色器/VFX | `unity-shader-specialist` |
| 管理 Addressable 资源 | `unity-addressables-specialist` |
| 构建 UI Toolkit/UGUI 界面 | `unity-ui-specialist` |
| 编写地道 GDScript | `godot-gdscript-specialist` |
| 创建 Godot 着色器 | `godot-shader-specialist` |
| 构建 GDExtension 模块 | `godot-gdextension-specialist` |
| 规划实时活动和赛季 | `live-ops-designer` |
| 为玩家编写补丁说明 | `community-manager` |
| 头脑风暴新游戏想法 | 使用 `/brainstorm` 技能 |

### 3. 使用斜杠命令处理常见任务

| 命令 | 功能 |
|---------|-------------|
| `/start` | 首次入门 — 询问你当前的位置，引导你到正确的工作流程 |
| `/design-review` | 审查设计文档 |
| `/code-review` | 审查代码质量和架构 |
| `/playtest-report` | 创建或分析游戏测试反馈 |
| `/balance-check` | 分析游戏平衡数据 |
| `/sprint-plan` | 创建或更新冲刺计划 |
| `/architecture-decision` | 创建 ADR（架构决策记录） |
| `/asset-audit` | 审计资源合规性 |
| `/milestone-review` | 审查里程碑进度 |
| `/onboard` | 为某个角色生成入门文档 |
| `/prototype` | 搭建一次性原型 |
| `/release-checklist` | 验证发布前检查清单 |
| `/changelog` | 从 git 历史生成变更日志 |
| `/retrospective` | 运行冲刺/里程碑回顾 |
| `/estimate` | 生成结构化工作量估算 |
| `/hotfix` | 紧急修复并保留审计追踪 |
| `/tech-debt` | 扫描、追踪和优先处理技术债务 |
| `/scope-check` | 根据计划检测范围蔓延 |
| `/localize` | 本地化扫描、提取、验证 |
| `/perf-profile` | 性能分析和瓶颈识别 |
| `/gate-check` | 验证阶段准备情况（通过/关注/失败） |
| `/project-stage-detect` | 分析项目状态，检测阶段，识别差距 |
| `/reverse-document` | 从现有代码生成设计/架构文档 |
| `/setup-engine` | 配置引擎 + 版本，填充参考文档 |
| `/map-systems` | 将概念分解为系统，映射依赖关系，指导每个系统的 GDD |
| `/design-system` | 为单个游戏系统提供引导式、分段的 GDD 编写 |
| `/team-combat` | 协调完整的战斗团队流程 |
| `/team-narrative` | 协调完整的叙事团队流程 |
| `/team-ui` | 协调完整的 UI 团队流程 |
| `/team-release` | 协调完整的发布团队流程 |
| `/team-polish` | 协调完整的打磨团队流程 |
| `/team-audio` | 协调完整的音频团队流程 |
| `/team-level` | 协调完整的关卡创建流程 |
| `/launch-checklist` | 完成发布准备验证 |
| `/patch-notes` | 生成面向玩家的补丁说明 |
| `/brainstorm` | 从零开始的引导式游戏概念构思 |

### 4. 使用模板创建新文档

模板位于 `.claude/docs/templates/`：

- `game-design-document.md` -- 用于新机制和系统
- `architecture-decision-record.md` -- 用于技术决策
- `risk-register-entry.md` -- 用于新风险
- `narrative-character-sheet.md` -- 用于新角色
- `test-plan.md` -- 用于功能测试计划
- `sprint-plan.md` -- 用于冲刺规划
- `milestone-definition.md` -- 用于新里程碑
- `level-design-document.md` -- 用于新关卡
- `game-pillars.md` -- 用于核心设计支柱
- `art-bible.md` -- 用于视觉风格参考
- `technical-design-document.md` -- 用于每个系统的技术设计
- `post-mortem.md` -- 用于项目/里程碑回顾
- `sound-bible.md` -- 用于音频风格参考
- `release-checklist-template.md` -- 用于平台发布检查清单
- `changelog-template.md` -- 用于面向玩家的补丁说明
- `release-notes.md` -- 用于面向玩家的发布说明
- `incident-response.md` -- 用于线上事件响应手册
- `game-concept.md` -- 用于初始游戏概念（MDA、SDT、Flow、Bartle）
- `pitch-document.md` -- 用于向利益相关者推介游戏
- `economy-model.md` -- 用于虚拟经济设计（流入/流出模型）
- `faction-design.md` -- 用于派系身份、传说和游戏角色
- `systems-index.md` -- 用于系统分解和依赖映射
- `project-stage-report.md` -- 用于项目阶段检测输出
- `design-doc-from-implementation.md` -- 用于将现有代码反向记录为 GDD
- `architecture-doc-from-code.md` -- 用于将代码反向记录为架构文档
- `concept-doc-from-prototype.md` -- 用于将原型反向记录为概念文档

### 5. 遵循协调规则

1. 工作按层级向下流动：总监 -> 负责人 -> 专业人员
2. 冲突向上升级
3. 跨部门工作由 `producer` 协调
4. 智能体未经委派不得修改其领域之外的文件
5. 所有决策都必须记录

## 新项目的第一步

**不知道从哪里开始？** 运行 `/start`。它会询问你当前的位置，并将你引导到正确的工作流程。不会对你的游戏、引擎或经验水平做任何假设。

如果你已经知道需要什么，直接跳转到相关路径：

### 路径 A："我不知道要做什么"

1. **运行 `/start`**（或 `/brainstorm open`）— 引导式创意探索：
   什么让你兴奋，你玩过什么，你的限制条件
   - 生成 3 个概念，帮助你选择一个，定义核心循环和支柱
   - 生成游戏概念文档并推荐引擎
2. **设置引擎** — 运行 `/setup-engine`（使用头脑风暴推荐）
   - 配置 CLAUDE.md，检测知识差距，填充参考文档
   - 创建 `.claude/docs/technical-preferences.md`，包含命名约定、
     性能预算和引擎特定的默认值
   - 如果引擎版本比 LLM 的训练数据新，它会从网络获取
     当前文档，以便智能体建议正确的 API
3. **验证概念** — 运行 `/design-review design/gdd/game-concept.md`
4. **分解为系统** — 运行 `/map-systems` 映射所有系统和依赖关系
5. **设计每个系统** — 运行 `/design-system [system-name]`（或 `/map-systems next`）
   按依赖顺序编写 GDD
6. **测试核心循环** — 运行 `/prototype [core-mechanic]`
7. **进行游戏测试** — 运行 `/playtest-report` 验证假设
8. **规划第一个冲刺** — 运行 `/sprint-plan new`
9. 开始构建

### 路径 B："我知道要做什么"

如果你已经有游戏概念和引擎选择：

1. **设置引擎** — 运行 `/setup-engine [engine] [version]`
   （例如 `/setup-engine godot 4.6`）— 同时创建技术偏好
2. **编写游戏支柱** — 委派给 `creative-director`
3. **分解为系统** — 运行 `/map-systems` 枚举系统和依赖关系
4. **设计每个系统** — 运行 `/design-system [system-name]` 按依赖顺序编写 GDD
5. **创建初始 ADR** — 运行 `/architecture-decision`
6. **在 `production/milestones/` 中创建第一个里程碑**
7. **规划第一个冲刺** — 运行 `/sprint-plan new`
8. 开始构建

### 路径 C："我知道游戏但不知道引擎"

如果你有概念但不知道哪个引擎合适：

1. **不带参数运行 `/setup-engine`** — 它会询问你游戏的需求
   （2D/3D、平台、团队规模、语言偏好）并根据你的回答推荐引擎
2. 从步骤 2 开始遵循路径 B

### 路径 D："我已有现有项目"

如果你已有设计文档、原型或代码：

1. **运行 `/start`**（或 `/project-stage-detect`）— 分析已存在的内容，
   识别差距，推荐下一步
2. **如有需要配置引擎** — 如果尚未配置，运行 `/setup-engine`
3. **验证阶段准备情况** — 运行 `/gate-check` 查看当前状态
4. **规划下一个冲刺** — 运行 `/sprint-plan new`

## 文件结构参考

```
CLAUDE.md                          -- 主配置（首先阅读，约 60 行）
.claude/
  settings.json                    -- Claude Code 钩子和项目设置
  agents/                          -- 48 个智能体定义（YAML 前置元数据）
  skills/                          -- 37 个斜杠命令定义（YAML 前置元数据）
  hooks/                           -- 8 个由 settings.json 连接的钩子脚本（.sh）
  rules/                           -- 11 个路径特定的规则文件
  docs/
    quick-start.md                 -- 本文件
    technical-preferences.md       -- 项目特定标准（由 /setup-engine 填充）
    coding-standards.md            -- 代码和设计文档标准
    coordination-rules.md          -- 智能体协调规则
    context-management.md          -- 上下文预算和压缩说明
    review-workflow.md             -- 审查和签署流程
    directory-structure.md         -- 项目目录布局
    agent-roster.md                -- 完整智能体列表及层级
    skills-reference.md            -- 所有斜杠命令
    rules-reference.md             -- 路径特定规则
    hooks-reference.md             -- 活动钩子
    agent-coordination-map.md      -- 完整委派和工作流程映射
    setup-requirements.md          -- 系统先决条件（Git Bash、jq、Python）
    settings-local-template.md     -- 个人 settings.local.json 指南
    hooks-reference/               -- 钩子文档和 git 钩子示例
    templates/                     -- 28 个文档模板
```
