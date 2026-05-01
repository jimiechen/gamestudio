# **使用 TDD 开发 Godot 4.6 肉鸽 MVP —— 任务拆解与 Vibe Coding 规范**

下面这份文档会先讲清楚**在 Godot 4.6 中做 TDD 的技术选型与工作流**，再给出**符合 Vibe Coding 规范的任务拆解（Task Breakdown）**。每个任务都按「红 → 绿 → 重构」三段式描述，可直接喂给 AI 编程助手逐个执行，也可以作为你自己推进开发的 checklist。

## **一、前置：为什么这样安排**

传统 TDD 在游戏开发里容易水土不服——渲染、物理、帧循环天然难以单元测试。因此我采用**"能测尽测 + 关键集成点用场景测试"** 的实用策略：

- **纯逻辑层（GameManager、升级计算、索敌函数、血量扣减）→ 单元测试**，这是 TDD 收益最高的部分。
- **物理/输入/渲染（八向移动方向、敌人追踪、子弹命中）→ 场景级集成测试**，用 GUT 的 `SceneTree` 仿真跑一帧。
- **视觉反馈（Tween、颜色变化）→ 冒烟测试**，只断言"没有报错、节点仍存在"。

测试框架选用 **[GUT（Godot Unit Test）9.x](https://github.com/bitwes/Gut)**，它是 Godot 4 生态最成熟的 TDD 框架，支持 `assert_eq`、`autofree`、`watch_signals`、`yield_frames` 等特性。

## **二、Vibe Coding 规范（本项目约定）**

"Vibe Coding" 的核心是**让 AI 与人协作时保持节奏稳定、上下文清晰、可回滚**。本项目遵循以下 7 条硬性约定：

1. **一次一个任务**：每条任务只做一件事，完成后 commit，绝不把多个关注点塞进同一次改动。
2. **红绿重构三段式**：先写失败的测试（Red）→ 写最小实现让它通过（Green）→ 清理代码不改行为（Refactor）。
3. **测试先行、断言具体**：断言具体数值或状态，不用 `assert_true(x != null)` 这种弱断言。
4. **显式类型 + 静态签名**：所有 GDScript 函数签名都写明参数和返回类型，便于 AI 读懂上下文。
5. **纯函数优先**：能提取成无副作用函数的逻辑（如 `calc_xp_to_next`、`normalize_input`）一律抽出，方便测试。
6. **单一职责节点**：一个 `.gd` 只负责一类行为，跨节点通信走 signal 或 Autoload，不互相 `get_node()` 穿透。
7. **提交信息格式**：`test: xxx` / `feat: xxx` / `refactor: xxx` / `fix: xxx`，便于回滚定位。

## **三、目录与命名约定**

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
    ├── unit/          test_game_manager.gd 等
    └── integration/   test_player_movement.gd 等
```

所有纯函数放在 `src/utils/` 或以 `static func` 形式挂在类上，便于单测不启动场景树。

## **四、任务拆解（20 个任务，按执行顺序）**

### **阶段 0：脚手架（Task 0）**

#### **Task 0 — 初始化项目与 GUT**

- **目标**：项目能跑起来，GUT 面板可见，能跑通一条 hello-world 测试。
- **Red**：在 `tests/unit/test_smoke.gd` 写 `assert_eq(1 + 1, 2, "sanity")`，预期直接通过。
- **Green**：从 AssetLib 安装 GUT，在 Project Settings 启用 GUT 插件，配置默认测试目录为 `res://tests`。
- **Refactor**：把上面的"目录与命名约定"落盘（创建空目录 + `.gdkeep`）。
- **完成标准**：`Ctrl+Alt+G` 打开 GUT 面板，点 Run All，绿色 1 passed。
- **提交**：`chore: bootstrap project with gut`

### **阶段 1：纯逻辑 —— GameManager（Task 1~5）**

这一阶段不涉及任何场景节点，全部可单测，是 TDD 最舒服的部分。

#### **Task 1 — XP 累计**

- **Red**：`test_add_xp_accumulates` → 期望 `add_xp(3)` 后 `xp == 3`，`emit("xp_changed")` 被触发一次。
- **Green**：在 `GameManager.gd` 写最小实现，只处理累加与信号。
- **Refactor**：提取 `_emit_xp()`。
- **提交**：`feat(gm): add xp accumulation`

#### **Task 2 — 升级阈值与等级上升**

- **Red**：`test_level_up_when_xp_reaches_threshold` → 初始 `xp_to_next == 5`，连续 `add_xp(5)` 后 `level == 2`、`xp == 0`，信号 `level_up` 被触发一次且参数为 2。
- **Green**：实现 `while xp >= xp_to_next` 循环与阈值递增公式。
- **Refactor**：把阈值公式抽成 `static func calc_next_threshold(current: int) -> int` 放到 `MathUtils.gd`，并为它单独写一条测试。
- **提交**：`feat(gm): level up with growing xp threshold`

#### **Task 3 — 一次溢出多级**

- **Red**：`test_multi_level_up_in_one_add` → 初始状态 `add_xp(100)` 应一次升多级，每级都触发一次 `level_up`。
- **Green**：确认 Task 2 的 while 循环能正确连升，不行再修。
- **完成标准**：`watch_signals(GameManager)` 断言 `level_up` 触发次数 ≥ 2。
- **提交**：`test(gm): cover multi level up overflow`

#### **Task 4 — 升级词条应用**

- **Red**：`test_apply_upgrade_modifies_stats` → 分别断言 `apply_upgrade("damage")` 后 `bonus_damage == 1`；连续两次 `apply_upgrade("attack_speed")` 后 `attack_rate_mult` 约等于 `1.21`（用 `assert_almost_eq`，容差 0.001）。
- **Green**：用 `match` 语句实现三个词条分支。
- **Refactor**：抽出 `UpgradePool.gd`，让 `apply_upgrade` 调用 `UpgradePool.apply(id, stats)`，把词条数据和逻辑分离，方便后续扩展。
- **提交**：`refactor(gm): extract upgrade pool`

#### **Task 5 — 重开清零**

- **Red**：`test_start_run_resets_state` → 先升级、加经验、修改倍率，调用 `start_run()` 后所有字段回到初始值，`is_running == true`。
- **Green**：在 `start_run()` 里显式重置所有字段。
- **提交**：`feat(gm): reset state on start_run`

### **阶段 2：玩家逻辑（Task 6~9）**

玩家涉及输入和物理，因此把"输入向量归一化"和"索敌"抽成纯函数单测，"实际移动"用场景集成测试。

#### **Task 6 — 输入向量归一化（纯函数）**

- **Red**：在 `MathUtils.gd` 测试 `normalize_input(Vector2(1, 1)).length()` 约等于 `1.0`；`normalize_input(Vector2.ZERO) == Vector2.ZERO`。
- **Green**：`static func normalize_input(v: Vector2) -> Vector2`，长度大于 0 时归一化。
- **提交**：`feat(utils): normalize input vector`

#### **Task 7 — 索敌：找最近敌人（纯函数）**

- **Red**：`test_find_nearest_from_positions` → 给定自身位置 `(0,0)` 和候选数组 `[(100,0),(10,0),(50,50)]`，返回索引 `1`。
- **Green**：`static func find_nearest_index(origin: Vector2, positions: Array[Vector2]) -> int` 遍历 `distance_squared_to`。
- **Refactor**：`Player.gd` 的 `_find_nearest_enemy()` 改为先收集位置数组、再调用这个纯函数拿到索引，渲染/查询和算法解耦。
- **提交**：`refactor(player): extract nearest target math`

#### **Task 8 — 玩家移动集成测试**

- **Red**：在 `tests/integration/test_player_movement.gd` 里 `add_child_autofree(player)`；用 `Input.action_press(&"move_right")` 模拟输入，`await get_tree().physics_frame` 两帧后断言 `player.global_position.x > 0`。
- **Green**：`Player.gd` 实现 `_physics_process` 的八向读取与 `move_and_slide()`。
- **Refactor**：把 `base_speed * GameManager.move_speed_mult` 的计算抽成 `get_current_speed() -> float`，为后续测试移速词条生效做铺垫。
- **提交**：`feat(player): 8-directional movement`

#### **Task 9 — 受伤与无敌帧**

- **Red**：`test_take_damage_reduces_hp` → `take_damage(2)` 后 `current_health == 8`、`health_changed` 触发且参数正确；连续两次 `take_damage(2)` 立刻调用，第二次不扣血（无敌帧）。
- **Green**：实现 `can_be_hurt` 标志 + `HurtCooldown` Timer；测试中用 `simulate(player, 0.7, 0.02)` 让冷却走完再验证第三次能扣。
- **Refactor**：把视觉反馈（Tween modulate）包到 `_flash_hurt()` 私有方法，便于未来单独替换。
- **提交**：`feat(player): damage with iframes`

### **阶段 3：子弹与攻击（Task 10~12）**

#### **Task 10 — 子弹方向与伤害载荷**

- **Red**：`test_bullet_setup_sets_direction_and_damage` → 调用 `bullet.setup(Vector2(1,0), 5)` 后 `direction == Vector2.RIGHT`、`damage == 5`、`rotation` 约为 0。
- **Green**：`Bullet.setup()` 最小实现。
- **提交**：`feat(bullet): setup direction and damage`

#### **Task 11 — 子弹直线飞行**

- **Red**：把子弹实例加入树，初始 `(0,0)`，`setup(Vector2.RIGHT, 1)`；等 0.1 秒后断言 `position.x` 约等于 `520 * 0.1`（容差 10）。
- **Green**：`_process` 中 `position += direction * speed * delta`。
- **提交**：`feat(bullet): linear flight`

#### **Task 12 — 命中敌人扣血与自毁**

- **Red**：在场景里造一个带 `take_damage` 的假敌人（mock，放在 `tests/helpers/fake_enemy.gd`），让子弹 `body_entered` 触发后断言：假敌人血量减 1、子弹被 `queue_free`（用 `is_instance_valid(bullet) == false`）。
- **Green**：`Bullet._on_body_entered` 实现。
- **Refactor**：命中逻辑抽成 `_try_hit(body) -> bool`。
- **提交**：`feat(bullet): hit detection and free`

### **阶段 4：敌人（Task 13~15）**

#### **Task 13 — 敌人追踪方向（纯函数）**

- **Red**：`test_chase_direction` → 给 `seek_direction(Vector2.ZERO, Vector2(3,4))` 应返回长度 1 的向量，且 `.x ≈ 0.6, .y ≈ 0.8`。
- **Green**：`static func seek_direction(from, to) -> Vector2`。
- **提交**：`feat(enemy): seek direction math`

#### **Task 14 — 敌人受伤死亡掉经验**

- **Red**：mock `GameManager.add_xp`（GUT 的 `stub(...).to_do_nothing()` + 监听调用）；`take_damage(99)` 后断言 `GameManager.add_xp` 被调用 1 次、参数为 `xp_reward`，敌人 `is_instance_valid == false`。
- **Green**：实现 `take_damage` → 血量 ≤ 0 时 `add_xp` + `queue_free`。
- **提交**：`feat(enemy): death rewards xp`

#### **Task 15 — 接触伤害冷却**

- **Red**：场景中放敌人与假玩家 `(position = 敌人位置)`，跑 1 秒物理，断言假玩家的 `take_damage` 被调用 **2 次**（0.5s 冷却一次）。
- **Green**：实现 `_touch_cd` 计时器逻辑。
- **Refactor**：常量提取 `const TOUCH_COOLDOWN := 0.5`。
- **提交**：`feat(enemy): contact damage with cooldown`

### **阶段 5：系统层（Task 16~18）**

#### **Task 16 — Spawner 刷怪间隔曲线（纯函数）**

- **Red**：`test_interval_shrinks_over_time` → `calc_interval(base=1.2, elapsed=0) == 1.2`；`calc_interval(1.2, 60)` ≈ `max(0.15, 0.6)` = `0.6`；`calc_interval(1.2, 9999)` 被夹到 `0.15`（下限）。
- **Green**：`static func calc_interval(base: float, elapsed: float) -> float`。
- **Refactor**：`Spawner.gd` 改为调用这个纯函数，彻底解耦时间曲线与节点。
- **提交**：`feat(spawner): shrinking interval curve`

#### **Task 17 — 出生点在玩家周围随机圆上**

- **Red**：`test_spawn_position_is_on_ring` → 调 100 次 `calc_spawn_position(Vector2(100,100), 500, rng)`，每次结果到 `(100,100)` 的距离都约等于 500（容差 0.01）。
- **Green**：`static func calc_spawn_position(center, radius, rng: RandomNumberGenerator) -> Vector2`，传入 rng 便于测试确定性。
- **提交**：`feat(spawner): ring spawn position`

#### **Task 18 — 升级池三选一不重复**

- **Red**：`test_pick_three_unique` → 重复 50 次 `UpgradePool.pick_three(rng)`，每次返回 3 个、彼此 id 不同。
- **Green**：`shuffle` + `slice(0,3)`。
- **Refactor**：当池内总词条数 < 3 时回退为允许重复（写第二条测试覆盖这个分支）。
- **提交**：`feat(upgrade): pick three unique`

### **阶段 6：UI 与端到端（Task 19~20）**

#### **Task 19 — HUD 响应信号**

- **Red**：加载 `HUD.tscn` 到场景树；发 `GameManager.emit_signal(&"xp_changed", 3, 10)`；`await get_tree().process_frame`；断言 `xp_bar.value == 3`、`xp_bar.max_value == 10`。
- **Green**：在 `HUD._ready()` 连接信号并实现 `_on_xp_changed`。
- **Refactor**：把 UI 更新逻辑抽成无副作用的方法 `apply_xp_view(cur, max_v)`，测试可直接调它断言。
- **提交**：`feat(hud): react to xp signal`

#### **Task 20 — 端到端冒烟测试**

- **Red**：在 `tests/integration/test_game_loop.gd` 加载 `Main.tscn`，跑 3 秒物理仿真，断言：玩家仍存活、至少生成过 1 个敌人、`GameManager.game_time > 2.5`、没有任何 `push_error`。
- **Green**：补齐 `Main.gd` 的信号连接与初始化。
- **Refactor**：对 3 秒内出现的异常做截图保存（GUT 的 `add_fail_message`）便于排查。
- **提交**：`test(e2e): main scene smoke`

## **五、推进节奏建议**

这份拆解按"一人专注推进"估算约 **6~10 小时**完成 MVP：阶段 1 是 TDD 练手的好地方，强烈建议一字不落跑完红绿重构；阶段 2 开始涉及场景，如果某条测试写起来过于笨重（比如需要 mock 一堆子节点），果断把测试目标往纯函数上挪——这不是偷懒，而是**让可测性反过来驱动更好的架构**，也是 TDD 最有价值的副作用。

整个拆解的关键设计决策是：**把"数学 / 状态机 / 数据"与"节点 / 物理 / 渲染"彻底分层**。你会发现 GameManager、UpgradePool、MathUtils 里堆了绝大多数"会出 bug 的逻辑"，而这些恰好是可以被几十行 GUT 测试全覆盖的部分；Player、Enemy、Bullet 这些节点脚本最后只剩下"读输入、调用纯函数、移动/销毁"的胶水代码，bug 率和测试成本都被压到最低。

如果你在某一步卡住，最有效的修复动作永远是：**回看上一条 commit 的测试，确认它是否还绿，不绿就先回滚再重来**，而不是在当前混乱的状态里继续打补丁——这也是 Vibe Coding 规范第 1 条"一次一个任务 + 可回滚"的根本用意。

*内容由 AI 生成仅供参考*