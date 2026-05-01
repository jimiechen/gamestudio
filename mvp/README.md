# Godot 4.6 肉鸽 MVP

一个使用 TDD（测试驱动开发）从零构建的 2D 俯视角自动射击肉鸽游戏（Vampire Survivors lite）。全部视觉资源使用 Godot 内置的 ColorRect 占位，零外部美术依赖，F5 即可运行。

---

## 项目状态

| 指标 | 数值 |
|------|------|
| **测试总数** | 66 |
| **通过** | 66 |
| **失败** | 0 |
| **代码覆盖率** | Unit + Integration + UI + E2E 四层全覆盖 |

---

## 目录结构

```
res://
├── src/
│   ├── autoload/      GameManager.gd          # 全局单例：状态、XP、升级
│   ├── actors/        Player.gd / Enemy.gd    # 玩家与敌人逻辑
│   ├── projectiles/   Bullet.gd               # 子弹飞行与命中
│   ├── systems/       Spawner.gd              # 敌人生成曲线
│   │                  UpgradePool.gd          # 升级词条池（6 条）
│   ├── ui/            HUD.gd                  # HUD、血条、经验条、升级面板
│   └── utils/         MathUtils.gd            # 纯函数：归一化、索敌、阈值公式
├── scenes/            *.tscn                  # Godot 场景文件
├── tests/
│   ├── unit/          纯函数/状态机测试（24 条）
│   ├── integration/   节点+物理+信号测试（17 条）
│   ├── ui/            HUD 响应与面板交互（7 条）
│   └── e2e/           端到端与稳态仿真（8 条）
├── docs/
│   ├── PRD.md         产品需求文档 v0.2
│   └── TASKS.md       TDD 任务拆解（Task 0~28）
└── project.godot      Godot 项目配置
```

---

## 核心玩法循环

移动 → 自动射击最近敌人 → 击杀得经验 → 升级三选一 → 敌人变强 → 死亡 → 重开

### 操作
- **WASD / 方向键**：八向移动（对角线速度归一化）
- **R**：死亡后重开

### 玩家属性
| 属性 | 初始值 |
|------|--------|
| 血量 | 10 |
| 基础移速 | 220 |
| 基础伤害 | 1 |
| 攻击间隔 | 0.6s |
| 无敌帧 | 0.6s |

### 升级词条池（6 条，每次随机抽 3）
| 词条 ID | 效果 | 叠加方式 | 上限 |
|---------|------|----------|------|
| damage | 伤害 +1 | 加法 | 无上限 |
| multishot | 弹幕 +1（带散射） | 加法 | 5 |
| attack_speed | 攻速 +15% | 乘法 | 3.0x |
| move_speed | 移速 +10% | 乘法 | 无上限 |
| pierce | 穿透 +1 | 加法 | 3 |
| bullet_speed | 弹速 +20% | 乘法 | 3.0x |

---

## 运行方式

### 1. 运行游戏
用 Godot 4.6.1+ 打开项目，按 **F5** 运行主场景。

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

### 重点测试说明

- **`test_upgrade_visual_feedback`**：验证 multishot 升级真实增加子弹数，damage 升级不改变子弹数
- **`test_extreme_values`**：边界值与夹紧测试（攻速上限、阈值单调性、30 级合理性）
- **`test_balance_simulation`**：稳态仿真测试（不操作存活时间、1min 完美击杀等级、3min 敌人数上限）

---

## 设计约束（由测试守护）

- 任意 5 级路线，DPS 差异 ≥ 20%
- 30 级单级经验需求：1000~5000（阈值公式 ×1.20 + 2）
- 不操作不升级，存活时间：10~90 秒
- 1 分钟完美击杀，等级：5~12 级
- 3 分钟不输出，敌人数 < 500

---

## 技术栈

- **引擎**：Godot 4.6.1 Stable
- **语言**：GDScript（全静态类型签名）
- **测试框架**：自研轻量级测试运行器（不依赖 GUT 插件）
- **资源**：零外部美术，全部 ColorRect 占位

---

## 开发规范

- 严格遵循 **Red → Green → Refactor** TDD 三段式
- 所有数值改动必须通过极限值/稳态测试验证
- 静态类型签名，禁止 `var x = ...` 不写类型
- 提交信息格式：`feat(scope): description` / `test(scope): description`
