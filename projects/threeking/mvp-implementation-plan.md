# 最小MVP分阶段实现计划

**项目名称**: 三国幸存者 (ThreeKing Survivor)
**引擎**: Godot 4.6
**开发周期**: 10个工作日 (2周)
**目标**: 验证"生存射击"核心玩法是否有趣

---

## 1. 最小MVP定义 (必须严格遵守)

### 1.1 包含的功能 (绝对最小)

| 功能 | 说明 | 验收标准 |
|------|------|----------|
| **玩家移动** | WASD移动 | 角色可8方向移动，有惯性平滑 |
| **鼠标瞄准** | 角色朝向鼠标方向 | 角色Sprite始终面向鼠标 |
| **自动射击** | 按空格开启/关闭自动射击 | 有射击冷却，可见子弹飞出 |
| **基础敌人** | 1种敌人追踪玩家 | 敌人从屏幕边缘生成，直线追踪 |
| **击杀敌人** | 子弹命中敌人死亡 | 敌人有简单受击闪烁 |
| **玩家受伤** | 敌人触碰玩家扣血 | 玩家有受伤闪烁，血条减少 |
| **死亡结算** | 血量为0游戏结束 | 显示生存时间和击杀数 |
| **极简UI** | 血条(绿色)、分数(数字) | 使用Godot内置ProgressBar+Label |
| **重新开始** | 按R键重新开始 | 重置所有状态 |

### 1.2 明确排除的功能 (MVP绝对不做)

| 功能 | 为什么排除 | 何时添加 |
|------|-----------|----------|
| **多种武器** | 增加复杂度，非核心验证 | 阶段2 |
| **技能系统** | 需要大量平衡调整 | 阶段2 |
| **升级系统** | 需要数值设计 | 阶段2 |
| **波次系统** | 简单随机生成足够验证 | 阶段2 |
| **BOSS** | 需要复杂AI和平衡 | 阶段3 |
| **特效** | 使用简单闪烁足够 | 阶段2 |
| **音效** | 静音足够验证核心玩法 | 阶段2 |
| **复杂UI** | 内置UI足够 | 阶段2 |
| **Shader** | 增加复杂度无必要 | 阶段3 |
| **存档系统** | 单次游玩足够验证 | 阶段3 |
| **设置菜单** | 使用默认设置足够 | 阶段3 |

### 1.3 MVP成功标准 (必须全部满足)

**技术标准**:
- [ ] 游戏能在Windows上运行，稳定60FPS
- [ ] 无崩溃、无卡死、无明显BUG
- [ ] 内存占用<200MB

**玩法标准**:
- [ ] 测试者能理解游戏目标(生存+击杀)
- [ ] 测试者能操作角色移动和射击
- [ ] 测试者愿意玩超过5分钟
- [ ] 测试者想再玩一次

**质量标准**:
- [ ] 操作响应延迟<100ms
- [ ] 碰撞检测准确无穿墙
- [ ] 分数计算准确

---

## 2. 分阶段实现计划

### 阶段1: 基础框架 (第1-3天)

**目标**: 能跑、能控制、能开枪

#### 第1天: 项目搭建 + 玩家移动

| 时间 | 任务 | 产出 | 验收标准 |
|------|------|------|----------|
| 上午 | 创建Godot项目 | project.godot | 项目能打开无报错 |
| | 设置项目配置 | 渲染、输入、窗口设置 | 640x360分辨率，2D渲染 |
| | 创建目录结构 | scenes/, scripts/, assets/ | 目录清晰 |
| 下午 | 导入素材 | 玩家Sprite | playerBlue_stand.png导入 |
| | 创建Player场景 | Player.tscn | 场景结构正确 |
| | 实现Player.gd移动 | _physics_process移动 | WASD可移动，有惯性 |
| 晚上 | 测试 + 修复 | 可玩版本 | 移动流畅无BUG |

**关键代码参考**:
```gdscript
# Player.gd - 最简版本
extends CharacterBody2D

@export var speed: float = 200.0
@export var friction: float = 0.15

func _physics_process(delta):
    var input_dir = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

    if input_dir.length() > 0:
        velocity = velocity.lerp(input_dir * speed, friction)
    else:
        velocity = velocity.lerp(Vector2.ZERO, friction)

    move_and_slide()
```

#### 第2天: 瞄准 + 射击基础

| 时间 | 任务 | 产出 | 验收标准 |
|------|------|------|----------|
| 上午 | 实现鼠标瞄准 | 角色面向鼠标 | 角色Sprite朝向鼠标位置 |
| | 翻转Sprite | 左右朝向正确 | 左移时Sprite翻转 |
| 下午 | 创建子弹场景 | Bullet.tscn | 子弹场景结构正确 |
| | 实现射击 | 按空格发射子弹 | 子弹沿鼠标方向飞出 |
| | 射击冷却 | 0.2秒冷却 | 不能连续快速射击 |
| 晚上 | 子弹清理 | 出屏幕销毁 | 无内存泄漏 |

**关键代码参考**:
```gdscript
# Player.gd - 瞄准和射击
func _process(delta):
    # 瞄准
    var mouse_pos = get_global_mouse_position()
    var aim_dir = (mouse_pos - global_position).normalized()

    # 翻转Sprite
    if aim_dir.x < 0:
        sprite.flip_h = true
    else:
        sprite.flip_h = false

func _input(event):
    if event.is_action_pressed("shoot"):
        shoot()

func shoot():
    var now = Time.get_ticks_msec()
    if now - last_shot_time < shoot_cooldown_ms:
        return
    last_shot_time = now

    var bullet = bullet_scene.instantiate()
    bullet.global_position = global_position
    bullet.direction = (get_global_mouse_position() - global_position).normalized()
    get_tree().current_scene.add_child(bullet)
```

#### 第3天: 地图边界 + 简单敌人

| 时间 | 任务 | 产出 | 验收标准 |
|------|------|------|----------|
| 上午 | 创建Game场景 | Game.tscn | 主游戏场景 |
| | 设置地图边界 | 640x360游戏区域 | 玩家不能走出边界 |
| | 相机跟随 | Camera2D | 相机平滑跟随玩家 |
| 下午 | 创建敌人场景 | Enemy.tscn | 敌人基础场景 |
| | 实现追踪AI | 敌人朝玩家移动 | 敌人直线追踪玩家 |
| | 敌人边界生成 | 屏幕边缘生成 | 敌人在屏幕外生成 |
| 晚上 | 整合测试 | 可玩版本 | 玩家可移动射击，敌人会追踪 |

**阶段1验收标准** (必须全部通过):
- [ ] 玩家可以WASD移动，有惯性
- [ ] 玩家面向鼠标方向
- [ ] 按空格发射子弹，有冷却
- [ ] 子弹沿鼠标方向飞出
- [ ] 敌人从屏幕边缘生成
- [ ] 敌人直线追踪玩家
- [ ] 玩家不能走出地图边界
- [ ] 运行稳定60FPS

---

### 阶段2: 核心玩法 (第4-7天)

**目标**: 能杀怪、能受伤、能结束、能重开

#### 第4天: 击杀系统

| 时间 | 任务 | 产出 | 验收标准 |
|------|------|------|----------|
| 上午 | 敌人HP系统 | 敌人有血量 | 敌人受击扣血 |
| | 碰撞检测 | Area2D碰撞 | 子弹命中敌人 |
| 下午 | 敌人死亡 | 死亡处理 | HP<=0时死亡 |
| | 死亡闪烁 | 受击反馈 | 敌人受击时闪烁 |
| | 击杀分数 | 分数增加 | 击杀敌人+10分 |
| 晚上 | 对象池优化 | 对象池 | 避免频繁实例化 |

#### 第5天: 受伤与死亡

| 时间 | 任务 | 产出 | 验收标准 |
|------|------|------|----------|
| 上午 | 玩家HP系统 | 玩家血量 | 玩家有100HP |
| | 敌人接触伤害 | 碰撞扣血 | 敌人触碰玩家-10HP |
| 下午 | 玩家受伤闪烁 | 受伤反馈 | 受伤时闪烁无敌 |
| | 无敌时间 | 无敌帧 | 受伤后1秒无敌 |
| 晚上 | 游戏结束 | 死亡界面 | HP<=0时显示GameOver |
| | 分数显示 | 最终分数 | 显示击杀数和生存时间 |

#### 第6天: UI系统

| 时间 | 任务 | 产出 | 验收标准 |
|------|------|------|----------|
| 上午 | 血条UI | 绿色血条 | 屏幕左上角显示血量 |
| | 血条更新 | 实时更新 | 受伤时血条减少 |
| 下午 | 分数显示 | 分数UI | 屏幕右上角显示分数 |
| | 生存时间 | 计时器 | 显示存活时间 |
| 晚上 | 开始界面 | Start菜单 | 按任意键开始游戏 |
| | 重新开始 | R键重启 | 游戏结束按R重新开始 |

#### 第7天: 整合与测试

| 时间 | 任务 | 产出 | 验收标准 |
|------|------|------|----------|
| 上午 | 游戏流程整合 | 完整流程 | 开始→游戏→结束→重启 |
| | BUG修复 | 稳定版本 | 无崩溃、无卡死 |
| 下午 | 数值调整 | 平衡版本 | 难度适中、有挑战性 |
| | 性能测试 | 60FPS | 同屏30敌人稳定60帧 |
| 晚上 | 最终测试 | 可发布版本 | 通过所有验收标准 |

**阶段2验收标准** (必须全部通过):
- [ ] 子弹命中敌人，敌人扣血
- [ ] 敌人HP<=0时死亡，+10分
- [ ] 敌人触碰玩家，玩家-10HP
- [ ] 玩家受伤后有1秒无敌闪烁
- [ ] 玩家HP<=0时游戏结束
- [ ] 显示GameOver、击杀数、生存时间
- [ ] 按R键可以重新开始
- [ ] 屏幕左上角显示绿色血条
- [ ] 屏幕右上角显示分数和生存时间
- [ ] 同屏30敌人稳定60FPS

---

### 阶段3: 验证与优化 (第8-10天)

**目标**: 验证好玩、修复问题、准备展示

#### 第8天: 玩家测试

| 时间 | 任务 | 产出 | 验收标准 |
|------|------|------|----------|
| 上午 | 准备测试版本 | 可执行文件 | 导出Windows可执行文件 |
| | 编写测试指南 | 测试文档 | 告诉测试者如何操作 |
| 下午 | 邀请测试者 | 3-5人测试 | 同事/朋友试玩 |
| | 观察测试 | 测试记录 | 观察玩家行为和反馈 |
| 晚上 | 收集反馈 | 反馈汇总 | 记录所有问题和建议 |
| | 分类问题 | 优先级列表 | P0(必须修)/P1(应该修)/P2(可以延后) |

**关键问题**:
- 测试者能立刻理解怎么玩吗？
- 测试者觉得操作流畅吗？
- 测试者觉得难度合适吗？
- 测试者想再玩一次吗？
- 测试者最不喜欢什么？

#### 第9天: 问题修复

| 时间 | 任务 | 产出 | 验收标准 |
|------|------|------|----------|
| 上午 | 修复P0问题 | 紧急修复 | 所有P0问题修复 |
| | 修复P1问题 | 重要修复 | 尽量多修复P1 |
| 下午 | 优化性能 | 性能提升 | 解决卡顿问题 |
| | 调整数值 | 平衡版本 | 根据反馈调整难度 |
| 晚上 | 回归测试 | 稳定版本 | 修复没有引入新BUG |

**常见需要修复的问题**:
- 操作延迟或不流畅
- 难度过高或过低
- 敌人生成太密集或太稀疏
- 血条或分数显示不清晰
- 游戏结束条件不清晰
- 性能问题（卡顿、掉帧）

#### 第10天: 最终优化与交付

| 时间 | 任务 | 产出 | 验收标准 |
|------|------|------|----------|
| 上午 | 最后优化 | 最终版本 | 所有已知问题修复 |
| | 添加注释 | 文档化代码 | 关键代码有注释 |
| | 整理项目 | 干净的项目 | 删除无用文件和资源 |
| 下午 | 导出发布 | 可执行文件 | Windows可执行文件 |
| | 编写说明 | README文档 | 如何运行、如何玩 |
| | 准备展示 | 演示版本 | 可以给别人展示 |
| 晚上 | 最终测试 | 发布版本 | 最终验收测试通过 |
| | 备份存档 | 完整备份 | 项目安全存档 |

**交付物清单**:
- [ ] 可运行的Windows可执行文件
- [ ] 完整的Godot项目源代码
- [ ] README.md（如何运行、操作说明）
- [ ] 已知问题列表
- [ ] 下一阶段计划（如果继续）

**阶段3验收标准**:
- [ ] 至少3人测试过游戏
- [ ] 测试者能理解如何玩
- [ ] 所有P0问题已修复
- [ ] 游戏能稳定运行5分钟以上
- [ ] 可以导出Windows可执行文件
- [ ] 有基本的README文档

---

## 2. 技术实现方案

### 2.1 项目结构

```
res://
├── scenes/
│   ├── Game.tscn              # 主游戏场景
│   ├── Player.tscn            # 玩家
│   ├── Enemy.tscn             # 敌人
│   ├── Bullet.tscn            # 子弹
│   └── UI.tscn                # UI界面
├── scripts/
│   ├── Player.gd              # 玩家控制
│   ├── Enemy.gd               # 敌人AI
│   ├── Bullet.gd              # 子弹逻辑
│   ├── Game.gd                # 游戏管理
│   └── UI.gd                  # UI控制
└── assets/
    └── sprites/               # 精灵图
        ├── player.png         # 玩家图
        └── enemy.png          # 敌人图
```

### 2.2 关键脚本

#### Player.gd (最简版本)
```gdscript
extends CharacterBody2D

@export var speed: float = 200.0
@export var max_hp: int = 100
@export var shoot_cooldown: float = 0.2

var current_hp: int
var last_shot_time: float = 0.0
var is_auto_shooting: bool = false

@onready var sprite: Sprite2D = $Sprite2D
@onready var bullet_spawn: Node2D = $BulletSpawn

const BulletScene = preload("res://scenes/Bullet.tscn")

func _ready():
    current_hp = max_hp

func _process(delta):
    # 瞄准
    var mouse_pos = get_global_mouse_position()
    var aim_dir = (mouse_pos - global_position).normalized()

    # 翻转Sprite
    if aim_dir.x < 0:
        sprite.flip_h = true
    else:
        sprite.flip_h = false

    # 自动射击
    if is_auto_shooting:
        try_shoot(aim_dir)

func _physics_process(delta):
    # 移动
    var input_dir = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

    if input_dir.length() > 0:
        velocity = velocity.lerp(input_dir * speed, 0.15)
    else:
        velocity = velocity.lerp(Vector2.ZERO, 0.15)

    move_and_slide()

func _input(event):
    if event.is_action_pressed("shoot"):
        is_auto_shooting = !is_auto_shooting
    if event.is_action_pressed("restart"):
        get_tree().reload_current_scene()

func try_shoot(direction: Vector2):
    var now = Time.get_ticks_msec() / 1000.0
    if now - last_shot_time < shoot_cooldown:
        return
    last_shot_time = now

    var bullet = BulletScene.instantiate()
    bullet.global_position = bullet_spawn.global_position
    bullet.direction = direction
    get_tree().current_scene.add_child(bullet)

func take_damage(amount: int):
    current_hp -= amount
    UI.update_hp(current_hp)

    # 受伤闪烁
    sprite.modulate = Color.RED
    await get_tree().create_timer(0.1).timeout
    sprite.modulate = Color.WHITE

    if current_hp <= 0:
        die()

func die():
    GameManager.game_over()
```

#### Enemy.gd (最简版本)
```gdscript
extends CharacterBody2D

@export var speed: float = 100.0
@export var max_hp: int = 30
@export var damage: int = 10
@export var score_value: int = 10

var current_hp: int
var player: Node2D

@onready var sprite: Sprite2D = $Sprite2D

func _ready():
    current_hp = max_hp
    player = get_tree().get_first_node_in_group("player")
    add_to_group("enemies")

func _physics_process(delta):
    if not player:
        return

    # 简单追踪：直接朝玩家移动
    var direction = (player.global_position - global_position).normalized()
    velocity = direction * speed

    # 朝向玩家
    if direction.x < 0:
        sprite.flip_h = true
    else:
        sprite.flip_h = false

    move_and_slide()

    # 检测与玩家碰撞
    for i in range(get_slide_collision_count()):
        var collision = get_slide_collision(i)
        var collider = collision.get_collider()
        if collider.is_in_group("player"):
            collider.take_damage(damage)
            die() # 敌人自爆

func take_damage(amount: int):
    current_hp -= amount

    # 受击闪烁
    sprite.modulate = Color.WHITE
    await get_tree().create_timer(0.05).timeout
    sprite.modulate = Color(1, 0.5, 0.5) # 偏红

    if current_hp <= 0:
        die()

func die():
    GameManager.add_score(score_value)
    queue_free()
```

#### Bullet.gd (最简版本)
```gdscript
extends Area2D

@export var speed: float = 400.0
@export var damage: int = 10
@export var lifetime: float = 2.0

var direction: Vector2 = Vector2.RIGHT

@onready var sprite: Sprite2D = $Sprite2D

func _ready():
    add_to_group("bullets")

    # 生命周期
    await get_tree().create_timer(lifetime).timeout
    queue_free()

func _physics_process(delta):
    position += direction * speed * delta

func _on_body_entered(body):
    if body.is_in_group("enemies"):
        body.take_damage(damage)
        queue_free()
```

#### GameManager.gd (最简版本)
```gdscript
extends Node

var score: int = 0
var game_time: float = 0.0
var is_game_over: bool = false

@onready var enemy_spawn_timer: Timer = $EnemySpawnTimer

func _ready():
    start_game()

func _process(delta):
    if not is_game_over:
        game_time += delta
        UI.update_time(int(game_time))

func start_game():
    score = 0
    game_time = 0.0
    is_game_over = false

    # 清除旧敌人和子弹
    for enemy in get_tree().get_nodes_in_group("enemies"):
        enemy.queue_free()
    for bullet in get_tree().get_nodes_in_group("bullets"):
        bullet.queue_free()

    # 启动生成
    enemy_spawn_timer.start()

    UI.show_game_ui()

func add_score(amount: int):
    if is_game_over:
        return
    score += amount
    UI.update_score(score)

func game_over():
    if is_game_over:
        return
    is_game_over = true
    enemy_spawn_timer.stop()

    UI.show_game_over(score, int(game_time))

func _on_enemy_spawn_timer_timeout():
    if is_game_over:
        return

    # 在屏幕外随机位置生成敌人
    var spawn_pos = _get_random_spawn_position()

    var enemy = preload("res://scenes/Enemy.tscn").instantiate()
    enemy.global_position = spawn_pos
    get_tree().current_scene.add_child(enemy)

func _get_random_spawn_position() -> Vector2:
    var viewport_size = get_viewport().get_visible_rect().size
    var margin = 50

    # 随机选择屏幕的一边
    var side = randi() % 4

    match side:
        0: # 上
            return Vector2(randf_range(0, viewport_size.x), -margin)
        1: # 右
            return Vector2(viewport_size.x + margin, randf_range(0, viewport_size.y))
        2: # 下
            return Vector2(randf_range(0, viewport_size.x), viewport_size.y + margin)
        3: # 左
            return Vector2(-margin, randf_range(0, viewport_size.y))

    return Vector2.ZERO
```

#### UI.gd (最简版本)
```gdscript
extends CanvasLayer

@onready var hp_bar: ProgressBar = $HPBar
@onready var score_label: Label = $ScoreLabel
@onready var time_label: Label = $TimeLabel
@onready var game_over_panel: Panel = $GameOverPanel
@onready var final_score_label: Label = $GameOverPanel/FinalScoreLabel
@onready var survival_time_label: Label = $GameOverPanel/SurvivalTimeLabel

func _ready():
    show_game_ui()

func show_game_ui():
    hp_bar.show()
    score_label.show()
    time_label.show()
    game_over_panel.hide()

func update_hp(hp: int):
    hp_bar.value = hp

func update_score(score: int):
    score_label.text = "Score: %d" % score

func update_time(time_sec: int):
    var minutes = time_sec / 60
    var seconds = time_sec % 60
    time_label.text = "Time: %02d:%02d" % [minutes, seconds]

func show_game_over(score: int, time_sec: int):
    hp_bar.hide()
    score_label.hide()
    time_label.hide()
    game_over_panel.show()

    final_score_label.text = "Final Score: %d" % score

    var minutes = time_sec / 60
    var seconds = time_sec % 60
    survival_time_label.text = "Survival Time: %02d:%02d" % [minutes, seconds]
```

### 阶段3: 整合与交付 (第8-10天)

**目标**: 稳定运行、通过测试、准备展示

#### 第8天: 测试与修复

| 时间 | 任务 | 产出 | 验收标准 |
|------|------|------|----------|
| 上午 | 功能测试 | 测试报告 | 所有功能正常工作 |
| | 边界测试 | 边界测试报告 | 边界情况处理正确 |
| 下午 | 压力测试 | 性能报告 | 同屏50敌人稳定60帧 |
| | 修复BUG | 修复版本 | 所有严重BUG修复 |
| 晚上 | 回归测试 | 稳定版本 | 修复无新问题 |

**测试清单**:
- [ ] 玩家可以向8个方向移动
- [ ] 玩家面向鼠标方向
- [ ] 按空格可以开启/关闭自动射击
- [ ] 子弹沿鼠标方向飞出
- [ ] 子弹2秒后自动销毁
- [ ] 敌人从屏幕边缘生成
- [ ] 敌人直线追踪玩家
- [ ] 子弹命中敌人，敌人扣血
- [ ] 敌人死亡时消失，+10分
- [ ] 敌人触碰玩家，玩家扣10HP
- [ ] 玩家受伤后闪烁1秒
- [ ] 玩家HP<=0时游戏结束
- [ ] 游戏结束显示分数和生存时间
- [ ] 按R键可以重新开始
- [ ] 游戏可以稳定运行5分钟以上
- [ ] 同屏50敌人稳定60FPS

#### 第9天: 优化与完善

| 时间 | 任务 | 产出 | 验收标准 |
|------|------|------|----------|
| 上午 | 数值平衡 | 平衡版本 | 难度适中 |
| | 玩家速度、血量 | 合理数值 | 移动流畅，不容易死 |
| | 敌人速度、伤害 | 合理数值 | 有挑战但公平 |
| | 射击冷却 | 合理数值 | 射击节奏舒适 |
| 下午 | 体验优化 | 优化版本 | 体验流畅 |
| | 添加操作提示 | 提示文字 | 新玩家知道怎么玩 |
| | 优化UI布局 | 清晰UI | 信息清晰可读 |
| 晚上 | 最终检查 | 完善版本 | 准备发布 |
| | 检查所有功能 | 完整功能 | 无遗漏 |
| | 检查性能 | 流畅运行 | 无卡顿 |

#### 第10天: 交付与展示

| 时间 | 任务 | 产出 | 验收标准 |
|------|------|------|----------|
| 上午 | 导出发布 | 可执行文件 | Windows .exe |
| | 项目打包 | 项目压缩包 | 完整项目文件 |
| | 编写文档 | README.md | 操作说明、开发日志 |
| 下午 | 准备展示 | 演示版本 | 可以给别人演示 |
| | 录制GIF/视频 | 展示素材 | 展示游戏画面 |
| | 准备说明文案 | 介绍文字 | 一句话介绍、特点 |
| 晚上 | 最终提交 | 完整交付物 | 所有文件就绪 |
| | 备份存档 | 安全备份 | 多份备份 |
| | 庆祝完成 | 🎉 | MVP完成！ |

**交付物清单**:
- [ ] Windows可执行文件 (.exe)
- [ ] 完整Godot项目源代码
- [ ] README.md（项目介绍、操作说明）
- [ ] 开发日志（记录开发过程）
- [ ] 演示视频或GIF
- [ ] 已知问题列表

---

## 3. 验收标准汇总

### 3.1 功能验收 (必须全部通过)

**玩家系统**:
- [ ] WASD可以向8个方向移动
- [ ] 移动有惯性和平滑感
- [ ] 角色始终面向鼠标方向
- [ ] 按空格开启/关闭自动射击
- [ ] 子弹沿鼠标方向直线飞行
- [ ] 射击有冷却时间不能连发
- [ ] 子弹2秒后自动销毁

**敌人系统**:
- [ ] 敌人从屏幕边缘随机生成
- [ ] 敌人直线朝玩家移动
- [ ] 敌人有简单碰撞体积
- [ ] 子弹命中敌人造成伤害
- [ ] 敌人HP<=0时死亡
- [ ] 敌人死亡时增加分数
- [ ] 敌人触碰玩家造成伤害

**伤害与死亡**:
- [ ] 玩家有100HP
- [ ] 受伤扣相应HP
- [ ] 受伤后有1秒无敌
- [ ] 无敌期间闪烁
- [ ] HP<=0时游戏结束
- [ ] 游戏结束显示分数和生存时间

**游戏循环**:
- [ ] 按任意键/按钮开始游戏
- [ ] 游戏中实时计分
- [ ] 游戏中实时计时
- [ ] 游戏结束可以重新开始
- [ ] 重新开始重置所有状态

**UI系统**:
- [ ] 屏幕左上角显示绿色血条
- [ ] 血条实时更新
- [ ] 屏幕右上角显示分数
- [ ] 屏幕右上角显示生存时间
- [ ] 游戏结束显示最终分数
- [ ] 游戏结束显示生存时间

### 3.2 性能验收 (必须全部通过)

- [ ] 游戏启动时间<3秒
- [ ] 同屏30个敌人稳定60FPS
- [ ] 同屏50个敌人不低于45FPS
- [ ] 内存占用<150MB
- [ ] 游戏运行5分钟无内存泄漏
- [ ] 无卡顿、无掉帧、无延迟

### 3.3 质量验收 (必须全部通过)

- [ ] 无崩溃、无卡死、无异常退出
- [ ] 无明显的BUG或逻辑错误
- [ ] 操作响应延迟<100ms
- [ ] 碰撞检测准确无穿墙
- [ ] 分数计算准确无误
- [ ] 游戏状态切换正确

### 3.4 体验验收 (尽量满足)

- [ ] 新玩家能在30秒内理解怎么玩
- [ ] 操作感觉流畅自然
- [ ] 难度适中，有挑战性但公平
- [ ] 死亡时知道原因
- [ ] 想再玩一次
- [ ] 愿意给别人推荐

---

## 4. 资源清单

### 4.1 必需资源 (必须准备)

**精灵图 (从现有素材获取)**:
| 资源名 | 来源 | 使用位置 |
|--------|------|----------|
| playerBlue_stand.png | Kenney素材 | 玩家角色 |
| enemyWalking_1.png | Kenney素材 | 敌人 |

**代码生成资源**:
| 资源名 | 生成方式 | 说明 |
|--------|----------|------|
| 子弹 | Polygon2D | 8边形圆形，填充青色 |
| 血条 | ProgressBar | Godot内置节点 |
| 分数文字 | Label | Godot内置节点 |

### 4.2 可选资源 (有就更好)

| 资源名 | 用途 | 优先级 |
|--------|------|--------|
| 自定义字体 | 更好的数字显示 | 低 |
| 简单音效 | 射击、爆炸反馈 | 低 |
| 粒子效果 | 死亡爆炸效果 | 低 |

### 4.3 不需要的资源 (MVP绝对不用)

| 资源名 | 原因 |
|--------|------|
| 多种武器精灵 | MVP只用1种武器 |
| 多种敌人精灵 | MVP只用1种敌人 |
| 复杂特效Shader | 用简单闪烁代替 |
| 背景音乐 | MVP静音 |
| 复杂UI素材 | 用内置UI节点 |

---

## 5. 风险管理

### 5.1 高风险项

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 性能问题 | 中 | 高 | 限制最大敌人数（50），对象池复用 |
| 不好玩 | 中 | 高 | 第7天必须测试，不好玩立即调整数值 |
| BUG过多 | 中 | 中 | 每天测试，当天修复，不留到第二天 |
| 时间不够 | 高 | 中 | 严格按优先级，可裁剪后期功能 |

### 5.2 检查点与Go/No-Go决策

**检查点1: 第3天结束 (阶段1结束)**
- [ ] 玩家可以移动、瞄准、射击
- [ ] 敌人生成并追踪
- [ ] 无严重BUG

**决策**: 如果以上未完成，延期1天或裁剪功能

**检查点2: 第7天结束 (阶段2结束)**
- [ ] 可以击杀敌人
- [ ] 可以受伤和死亡
- [ ] 游戏可以重新开始
- [ ] 有人测试过并觉得好玩

**决策**: 如果不好玩，分析原因并调整；如果严重问题，考虑停止

**检查点3: 第10天结束 (阶段3结束)**
- [ ] 所有验收标准通过
- [ ] 可执行文件导出成功
- [ ] 有人测试过最终版本

**决策**: 发布MVP或继续优化

---

## 6. 附录

### 6.1 输入映射

```
项目设置 -> 输入映射:

ui_left: A, 左箭头
ui_right: D, 右箭头
ui_up: W, 上箭头
ui_down: S, 下箭头
shoot: 空格
restart: R
```

### 6.2 项目设置

```
显示:
  窗口宽度: 640
  窗口高度: 360
  拉伸模式: canvas_items
  拉伸比例: keep

渲染:
  渲染器: Mobile (2D优化)

输入:
  鼠标可见性: 始终可见

层名称 (2D物理):
  Layer 1: player
  Layer 2: enemy
  Layer 3: bullet
```

### 6.3 快速启动命令

```bash
# 创建项目目录
mkdir -p threeking-mvp

# 打开Godot 4.6
# 项目列表 -> 新建 -> 选择 threeking-mvp 目录
# 项目名称: ThreeKingMVP

# 创建目录结构
# 在Godot文件系统中右键 -> 新建文件夹
# scenes/, scripts/, assets/

# 导入素材
# assets/右键 -> 打开文件管理器
# 复制 playerBlue_stand.png, enemyWalking_1.png 到 assets/
# 在Godot中选中，导入设置: Filter=false (像素风)
```

---

**计划完成。准备开始执行。**

执行前确认:
1. [ ] 确认10天时间安排可行
2. [ ] 确认可以每天投入足够时间
3. [ ] 准备好Godot 4.6
4. [ ] 准备好素材文件

确认后，从**阶段1第1天**开始执行。
