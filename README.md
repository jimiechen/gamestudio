# Godot 4.6 肉鸽 MVP

一个使用 TDD（测试驱动开发）从零构建的 2D 俯视角自动射击肉鸽游戏（Vampire Survivors lite）。

当前核心玩法逻辑已完成并通过测试。早期版本使用 Godot 内置 ColorRect 作为占位视觉资源；主角 Sprite 素材已准备完成，下一步将替换 Player 的 ColorRect 占位显示。

---

## 项目状态

| 指标 | 数值 |
|------|------|
| **测试总数** | 66 |
| **通过** | 66 |
| **失败** | 0 |
| **测试覆盖层级** | Unit + Integration + UI + E2E |
| **当前阶段** | 核心玩法 MVP 已完成，正在进行美术资源替换 |
| **视觉资源状态** | ColorRect 占位 → 主角 Sprite 接入中 |

---

## 当前美术资源

当前已准备 6 张主角核心动作素材，用于替换 Player 的 ColorRect 占位图。

| 动作 | 文件名 | 用途 |
|------|--------|------|
| 待机 | `player_alchemist_idle.png` | 玩家静止时显示 |
| 移动 | `player_alchemist_move.png` | 玩家移动时显示 |
| 施法 | `player_alchemist_cast.png` | 玩家攻击 / 自动射击时短暂显示 |
| 受击 | `player_alchemist_hit.png` | 玩家受伤时显示 |
| 死亡 | `player_alchemist_death.png` | 玩家死亡时显示 |
| 拾取 | `player_alchemist_pickup.png` | 玩家拾取道具时显示 |

推荐资源路径：

```text
res://assets/player/
  player_alchemist_idle.png
  player_alchemist_move.png
  player_alchemist_cast.png
  player_alchemist_hit.png
  player_alchemist_death.png
  player_alchemist_pickup.png
```

MVP 阶段暂时使用单帧动作切换，不追求完整逐帧动画。后续可扩展为 AnimatedSprite2D 或 AnimationPlayer 控制的多帧动画。

---

## 目录结构

```text
res://
├── assets/
│   ├── player_alchemist_actions/
│   │   ├── player_alchemist_idle.png
│   │   ├── player_alchemist_move.png
│   │   ├── player_alchemist_cast.png
│   │   ├── player_alchemist_hit.png
│   │   ├── player_alchemist_death.png
│   │   └── player_alchemist_pickup.png
│   ├── spritesheet_characters_enemies.jpg
│   ├── spritesheet_player_alchemist.jpg
│   ├── spritesheet_player_alchemist_transparent.png
│   ├── scene_battle_combat.jpg
│   ├── scene_alchemy_workshop.jpg
│   ├── asset_library.json
│   └── split_spritesheet.py
├── src/
│   ├── autoload/
│   │   └── GameManager.gd          # 全局单例：状态、XP、升级
│   ├── actors/
│   │   ├── Player.gd               # 玩家移动、攻击、受伤、贴图状态切换
│   │   └── Enemy.gd                # 敌人逻辑
│   ├── projectiles/
│   │   └── Bullet.gd               # 子弹飞行与命中
│   ├── systems/
│   │   ├── Spawner.gd              # 敌人生成曲线
│   │   └── UpgradePool.gd          # 升级词条池（6 条）
│   ├── ui/
│   │   └── HUD.gd                  # HUD、血条、经验条、升级面板
│   ├── utils/
│   │   └── MathUtils.gd            # 纯函数：归一化、索敌、阈值公式
│   └── Main.gd                     # 主场景逻辑
├── scenes/
│   ├── Bullet.tscn                 # 子弹场景
│   ├── Enemy.tscn                  # 敌人场景
│   ├── HUD.tscn                    # HUD 场景
│   ├── Main.tscn                   # 主场景
│   └── Player.tscn                 # 玩家场景
├── tests/
│   ├── unit/                       # 纯函数/状态机测试（24 条）
│   ├── integration/                # 节点+物理+信号测试（17 条）
│   ├── ui/                         # HUD 响应与面板交互（7 条）
│   ├── e2e/                        # 端到端与稳态仿真（8 条）
│   ├── TestRunner.tscn             # 测试运行器场景
│   ├── test_base.gd                # 测试基类
│   ├── test_runner.gd              # 测试运行器脚本
│   └── test_runner_scene.gd        # 测试运行器场景脚本
├── docs/
│   ├── PRD.md                      # 产品需求文档 v0.2
│   └── TASKS.md                    # TDD 任务拆解（Task 0~28）
└── project.godot                   # Godot 项目配置
```

---

## 核心玩法循环

移动 → 自动射击最近敌人 → 击杀得经验 → 升级三选一 → 敌人变强 → 死亡 → 重开

---

## 操作

| 输入 | 功能 |
|------|------|
| **WASD / 方向键** | 八向移动（对角线速度归一化） |
| **R** | 死亡后重开 |

---

## 玩家属性

| 属性 | 初始值 |
|------|--------|
| 血量 | 10 |
| 基础移速 | 220 |
| 基础伤害 | 1 |
| 攻击间隔 | 0.6s |
| 无敌帧 | 0.6s |

---

## 升级词条池

每次升级从 6 条词条中随机抽取 3 条供玩家选择。

| 词条 ID | 效果 | 叠加方式 | 上限 |
|---------|------|----------|------|
| `damage` | 伤害 +1 | 加法 | 无上限 |
| `multishot` | 弹幕 +1（带散射） | 加法 | 5 |
| `attack_speed` | 攻速 +15% | 乘法 | 3.0x |
| `move_speed` | 移速 +10% | 乘法 | 无上限 |
| `pierce` | 穿透 +1 | 加法 | 3 |
| `bullet_speed` | 弹速 +20% | 乘法 | 3.0x |

---

## 运行方式

### 1. 运行游戏

使用 Godot 4.6.1+ 打开项目，按 **F5** 运行主场景。

### 2. 运行测试

```powershell
# 方式一：运行测试场景（推荐）
& 'C:\path\to\Godot_v4.6.1-stable_win64.exe' --path . --headless tests/TestRunner.tscn

# 方式二：命令行运行测试脚本
& 'C:\path\to\Godot_v4.6.1-stable_win64.exe' --path . --headless --script tests/test_runner_scene.gd
```

---

## 测试分层

| 层级 | 文件数 | 测试数 | 覆盖范围 |
|------|--------|--------|----------|
| **Unit** | 5 | 24 | 纯函数、状态机、升级池、极限值 |
| **Integration** | 9 | 17 | 节点树、物理碰撞、信号、弹幕反馈 |
| **UI** | 1 | 7 | HUD 响应、升级面板交互 |
| **E2E** | 2 | 8 | 完整循环、稳态仿真（60s~180s） |
| **合计** | **17** | **66** | — |

---

## 重点测试说明

- **`test_upgrade_visual_feedback`**：验证 `multishot` 升级真实增加子弹数，`damage` 升级不改变子弹数。
- **`test_extreme_values`**：验证边界值与夹紧逻辑，包括攻速上限、经验阈值单调性、30 级数值合理性。
- **`test_balance_simulation`**：验证稳态仿真，包括不操作存活时间、1 分钟完美击杀等级、3 分钟敌人数上限。

---

## 设计约束（由测试守护）

- 任意 5 级路线，DPS 差异 ≥ 20%。
- 30 级单级经验需求：1000~5000（阈值公式 ×1.20 + 2）。
- 不操作不升级，存活时间：10~90 秒。
- 1 分钟完美击杀，等级：5~12 级。
- 3 分钟不输出，敌人数 < 500。

---

## 技术栈

| 类型 | 内容 |
|------|------|
| **引擎** | Godot 4.6.1 Stable |
| **语言** | GDScript（全静态类型签名） |
| **测试框架** | 自研轻量级测试运行器（不依赖 GUT 插件） |
| **视觉资源** | 早期使用 ColorRect 占位；当前接入 AI 生成 PNG Sprite |
| **目标平台** | PC 本地运行，MVP 阶段优先保证 F5 可运行 |

---

## 开发规范

- 严格遵循 **Red → Green → Refactor** TDD 三段式。
- 所有数值改动必须通过极限值 / 稳态测试验证。
- GDScript 使用静态类型签名，禁止 `var x = ...` 不写类型。
- 功能优先保持最小可运行，不提前引入复杂框架。
- MVP 阶段允许单帧动作贴图切换，不强制制作完整动画。
- 提交信息格式：`feat(scope): description` / `test(scope): description` / `refactor(scope): description`。

---

## 下一阶段任务

当前下一阶段目标是将 Player 的 ColorRect 占位视觉替换为主角 Sprite。

优先任务：

1. 将主角 PNG 放入 `res://assets/player/`。
2. 修改 Player 场景，为 Player 添加或复用 `Sprite2D`。
3. 静止时显示 `player_alchemist_idle.png`。
4. 移动时显示 `player_alchemist_move.png`。
5. 攻击时短暂显示 `player_alchemist_cast.png`。
6. 保留现有碰撞体和数值逻辑，不改变已通过测试的核心玩法。
7. 补充或更新测试，验证 Player 状态切换不会破坏移动、攻击、受伤和死亡流程。
