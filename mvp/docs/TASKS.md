# 使用 TDD 开发 Godot 4.6 肉鸽 MVP —— 任务拆解

## 目录与命名约定

```
res://
├── src/
│   ├── autoload/      GameManager.gd
│   ├── actors/        Player.gd / Enemy.gd
│   ├── projectiles/   Bullet.gd
│   ├── systems/       Spawner.gd / UpgradePool.gd
│   ├── ui/            HUD.gd
│   └── utils/         MathUtils.gd（纯函数集合）
├── scenes/            *.tscn
└── tests/
    ├── unit/          纯函数/状态机测试
    ├── integration/   节点+物理+信号测试
    ├── ui/            HUD 响应测试
    └── e2e/           端到端冒烟测试
```

## 测试矩阵（55 条测试全绿 ✅）

| 层级 | 数量 | 文件 | 覆盖 |
|------|------|------|------|
| **Unit** | 24 | test_smoke, test_game_manager, test_math_utils, test_upgrade_pool | 纯函数、状态机 |
| **Integration** | 15 | test_game_loop, test_bullet_hits_enemy, test_hud_reflects_damage, test_player_movement, test_bullet_lifetime, test_enemy_behavior, test_spawner, test_player_attack | 节点+物理+信号 |
| **UI** | 7 | test_hud | HUD 响应、面板交互 |
| **E2E** | 5 | test_game_loop_smoke | 完整游戏循环 |
| **合计** | **55** | — | PRD 全量 + 验收标准 A1~A4 |

## 阶段 0：脚手架（Task 0）

### Task 0 — 初始化项目与 GUT

- **目标**：项目能跑起来，GUT 面板可见，能跑通一条 hello-world 测试。
- **Red**：在 `tests/unit/test_smoke.gd` 写 `assert_eq(1 + 1, 2, "sanity")`，预期直接通过。
- **Green**：从 AssetLib 安装 GUT，在 Project Settings 启用 GUT 插件，配置默认测试目录为 `res://tests`。
- **Refactor**：创建空目录 + `.gdkeep`。
- **完成标准**：GUT 面板点 Run All，绿色 1 passed。
- **提交**：`chore: bootstrap project with gut`

## 阶段 1：纯逻辑 —— GameManager（Task 1~5）

### Task 1 — XP 累计

- **Red**：`test_add_xp_accumulates` → 期望 `add_xp(3)` 后 `xp == 3`，`emit("xp_changed")` 被触发一次。
- **Green**：在 `GameManager.gd` 写最小实现，只处理累加与信号。
- **Refactor**：提取 `_emit_xp()`。
- **提交**：`feat(gm): add xp accumulation`

### Task 2 — 升级阈值与等级上升

- **Red**：`test_level_up_when_xp_reaches_threshold` → 初始 `xp_to_next == 5`，连续 `add_xp(5)` 后 `level == 2`、`xp == 0`，信号 `level_up` 被触发一次且参数为 2。
- **Green**：实现 `while xp >= xp_to_next` 循环与阈值递增公式。
- **Refactor**：把阈值公式抽成 `static func calc_next_threshold(current: int) -> int` 放到 `MathUtils.gd`。
- **提交**：`feat(gm): level up with growing xp threshold`

### Task 3 — 一次溢出多级

- **Red**：`test_multi_level_up_in_one_add` → 初始状态 `add_xp(100)` 应一次升多级，每级都触发一次 `level_up`。
- **Green**：确认 Task 2 的 while 循环能正确连升。
- **完成标准**：`watch_signals(GameManager)` 断言 `level_up` 触发次数 ≥ 2。
- **提交**：`test(gm): cover multi level up overflow`

### Task 4 — 升级词条应用

- **Red**：`test_apply_upgrade_modifies_stats` → 分别断言 `apply_upgrade("damage")` 后 `bonus_damage == 1`；连续两次 `apply_upgrade("attack_speed")` 后 `attack_rate_mult` 约等于 `1.21`（容差 0.001）。
- **Green**：用 `match` 语句实现三个词条分支。
- **Refactor**：抽出 `UpgradePool.gd`，把词条数据和逻辑分离。
- **提交**：`refactor(gm): extract upgrade pool`

### Task 5 — 重开清零

- **Red**：`test_start_run_resets_state` → 先升级、加经验、修改倍率，调用 `start_run()` 后所有字段回到初始值，`is_running == true`。
- **Green**：在 `start_run()` 里显式重置所有字段。
- **提交**：`feat(gm): reset state on start_run`

## 阶段 2：玩家逻辑（Task 6~9）

### Task 6 — 输入向量归一化（纯函数）

- **Red**：在 `MathUtils.gd` 测试 `normalize_input(Vector2(1, 1)).length()` 约等于 `1.0`；`normalize_input(Vector2.ZERO) == Vector2.ZERO`。
- **Green**：`static func normalize_input(v: Vector2) -> Vector2`。
- **提交**：`feat(utils): normalize input vector`

### Task 7 — 索敌：找最近敌人（纯函数）

- **Red**：`test_find_nearest_from_positions` → 给定自身位置 `(0,0)` 和候选数组 `[(100,0),(10,0),(50,50)]`，返回索引 `1`。
- **Green**：`static func find_nearest_index(origin: Vector2, positions: Array[Vector2]) -> int`。
- **Refactor**：`Player.gd` 的 `_find_nearest_enemy()` 改为调用这个纯函数。
- **提交**：`refactor(player): extract nearest target math`

### Task 8 — 玩家移动集成测试

- **Red**：加载 `Player.tscn`；用 `Input.action_press(&"move_right")` 模拟输入，等两帧后断言 `player.global_position.x > 0`。
- **Green**：`Player.gd` 实现 `_physics_process` 的八向读取与 `move_and_slide()`。
- **Refactor**：把速度计算抽成 `get_current_speed() -> float`。
- **提交**：`feat(player): 8-directional movement`

### Task 9 — 受伤与无敌帧

- **Red**：`test_take_damage_reduces_hp` → `take_damage(2)` 后 `current_health == 8`；连续两次调用，第二次不扣血（无敌帧）。
- **Green**：实现 `can_be_hurt` 标志 + `HurtCooldown` Timer。
- **Refactor**：把视觉反馈包到 `_flash_hurt()` 私有方法。
- **提交**：`feat(player): damage with iframes`

## 阶段 3：子弹与攻击（Task 10~12）

### Task 10 — 子弹方向与伤害载荷

- **Red**：`test_bullet_setup_sets_direction_and_damage` → 调用 `bullet.setup(Vector2(1,0), 5)` 后 `direction == Vector2.RIGHT`、`damage == 5`。
- **Green**：`Bullet.setup()` 最小实现。
- **提交**：`feat(bullet): setup direction and damage`

### Task 11 — 子弹直线飞行

- **Red**：把子弹实例加入树，初始 `(0,0)`，`setup(Vector2.RIGHT, 1)`；等 0.1 秒后断言 `position.x` 约等于 `520 * 0.1`。
- **Green**：`_process` 中 `position += direction * speed * delta`。
- **提交**：`feat(bullet): linear flight`

### Task 12 — 命中敌人扣血与自毁

- **Red**：场景中造一个带 `take_damage` 的假敌人，让子弹 `body_entered` 触发后断言：假敌人血量减 1、子弹被 `queue_free`。
- **Green**：`Bullet._on_body_entered` 实现。
- **Refactor**：命中逻辑抽成 `_try_hit(body) -> bool`。
- **提交**：`feat(bullet): hit detection and free`

## 阶段 4：敌人（Task 13~15）

### Task 13 — 敌人追踪方向（纯函数）

- **Red**：`test_chase_direction` → 给 `seek_direction(Vector2.ZERO, Vector2(3,4))` 应返回长度 1 的向量。
- **Green**：`static func seek_direction(from, to) -> Vector2`。
- **提交**：`feat(enemy): seek direction math`

### Task 14 — 敌人受伤死亡掉经验

- **Red**：mock `GameManager.add_xp`；`take_damage(99)` 后断言 `add_xp` 被调用 1 次、参数为 `xp_reward`。
- **Green**：实现 `take_damage` → 血量 ≤ 0 时 `add_xp` + `queue_free`。
- **提交**：`feat(enemy): death rewards xp`

### Task 15 — 接触伤害冷却

- **Red**：场景中放敌人与假玩家，跑 1 秒物理，断言假玩家的 `take_damage` 被调用 2 次（0.5s 冷却一次）。
- **Green**：实现 `_touch_cd` 计时器逻辑。
- **Refactor**：常量提取 `const TOUCH_COOLDOWN := 0.5`。
- **提交**：`feat(enemy): contact damage with cooldown`

## 阶段 5：系统层（Task 16~18）

### Task 16 — Spawner 刷怪间隔曲线（纯函数）

- **Red**：`test_interval_shrinks_over_time` → `calc_interval(base=1.2, elapsed=0) == 1.2`；`calc_interval(1.2, 60)` ≈ `0.6`；下限 0.15。
- **Green**：`static func calc_interval(base: float, elapsed: float) -> float`。
- **Refactor**：`Spawner.gd` 改为调用这个纯函数。
- **提交**：`feat(spawner): shrinking interval curve`

### Task 17 — 出生点在玩家周围随机圆上

- **Red**：`test_spawn_position_is_on_ring` → 调 100 次，每次结果到中心距离都约等于 500。
- **Green**：`static func calc_spawn_position(center, radius, rng) -> Vector2`。
- **提交**：`feat(spawner): ring spawn position`

### Task 18 — 升级池三选一不重复

- **Red**：`test_pick_three_unique` → 重复 50 次，每次返回 3 个、彼此 id 不同。
- **Green**：`shuffle` + `slice(0,3)`。
- **Refactor**：池内总词条数 < 3 时回退为允许重复。
- **提交**：`feat(upgrade): pick three unique`

## 阶段 6：UI 与端到端（Task 19~20）

### Task 19 — HUD 响应信号

- **Red**：加载 `HUD.tscn`；发 `GameManager.emit_signal(&"xp_changed", 3, 10)`；断言 `xp_bar.value == 3`。
- **Green**：在 `HUD._ready()` 连接信号并实现 `_on_xp_changed`。
- **Refactor**：把 UI 更新逻辑抽成 `apply_xp_view(cur, max_v)`。
- **提交**：`feat(hud): react to xp signal`

### Task 20 — 端到端冒烟测试

- **Red**：加载 `Main.tscn`，跑 3 秒物理仿真，断言：玩家仍存活、至少生成过 1 个敌人、`game_time > 2.5`。
- **Green**：补齐 `Main.gd` 的信号连接与初始化。
- **提交**：`test(e2e): main scene smoke`

## Task 26：扩展词条池到 6 条

- **Red**：写 `test_multishot_increases_bullet_count` / `test_damage_upgrade_does_not_change_bullet_count`
- **Green**：实现 multishot / pierce / bullet_speed 三个新词条，修改 Player._on_attack_timer 支持多发
- **Refactor**：提取弹幕发射逻辑到私有方法
- **提交**：`feat(upgrade): expand pool to 6 cards`

## Task 27：极限值测试套件（U21~U25）

- **Red**：写 5 条极限值测试（攻速夹紧、阈值单调性、30 级阈值合理性、敌人血量增长、满升级平衡性）
- **Green**：确保所有边界值被正确处理
- **提交**：`test(balance): boundary and threshold values`

## Task 28：稳态仿真测试套件（E6~E8）

- **Red**：写 3 条仿真测试（60s 不操作存活时间、1min 完美击杀等级、3min 敌人数上限）
- **Green**：调整平衡参数使测试通过
- **提交**：`test(balance): steady state simulation`
