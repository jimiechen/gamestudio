# **Godot 4.6 肉鸽 MVP 游戏 —— 开发大纲**

下面先给你一份**可落地的最简 MVP 设计大纲**，明确范围、模块与依赖关系；随后我会分部分输出每个脚本与场景的完整代码，所有美术（人物、敌人、子弹、地面）都用 Godot 内置的 `ColorRect` / `PlaceholderTexture2D` 作为占位符，零美术资源即可运行。

## **一、项目总览**

**目标**：在 Godot 4.6 中实现一个"一次能跑起来"的肉鸽游戏最小可玩版本，包含八向移动、自动生成敌人、近身伤害、击杀后升级、死亡重开。

**技术栈与节点基础**：

- 引擎：Godot 4.6（GDScript）
- 视角：2D 俯视角（Top-Down）
- 渲染：全部使用 `ColorRect` 占位符（玩家=绿色，敌人=红色，子弹=黄色，背景=深灰）
- 物理：`CharacterBody2D`（玩家/敌人） + `Area2D`（子弹、伤害判定）

## **二、核心玩法循环（Game Loop）**

玩家在空旷场地中使用 **WASD / 方向键** 进行八向移动 → 自动朝最近敌人发射子弹 → 击杀敌人获得经验 → 经验满升级选择词条（MVP 先只做"伤害+1 / 攻速+10% / 移速+10%"三选一）→ 敌人随时间增强 → 玩家死亡后回到开始界面重开。

## **三、场景结构规划**

| 场景文件          | 根节点               | 作用                  |
| ------------- | ----------------- | ------------------- |
| `Main.tscn`   | `Node2D`          | 游戏主场景，挂载玩家、敌人生成器、UI |
| `Player.tscn` | `CharacterBody2D` | 玩家（八向移动、血量、自动攻击）    |
| `Enemy.tscn`  | `CharacterBody2D` | 敌人（追踪玩家、碰撞伤害）       |
| `Bullet.tscn` | `Area2D`          | 子弹（直线飞行、命中销毁）       |
| `HUD.tscn`    | `CanvasLayer`     | 血条、经验条、等级、计时、升级选择   |

## **四、脚本与模块划分**

- `Player.gd`：八向输入、速度归一化、血量、自动索敌并发射子弹、经验获取、升级事件
- `Enemy.gd`：朝玩家移动、接触造成伤害、受击扣血、死亡掉经验
- `Bullet.gd`：按方向匀速飞行、命中敌人造成伤害、超时自毁
- `Spawner.gd`：按时间间隔在屏幕外生成敌人，随时间缩短间隔、提升血量
- `GameManager.gd`（Autoload 单例）：全局等级、经验、难度系数、游戏状态
- `HUD.gd`：刷新 UI、弹出升级三选一面板、暂停/恢复游戏

## **五、开发里程碑（建议实现顺序）**

1. 创建项目 & Autoload `GameManager`
2. `Player.tscn` + `Player.gd`：能用 WASD 八向跑
3. `Enemy.tscn` + `Spawner.gd`：敌人能追你、撞你掉血
4. `Bullet.tscn` + 玩家自动索敌发射：能击杀敌人
5. 经验 / 升级 / HUD：形成完整肉鸽循环
6. 死亡重开 & 简单难度曲线

***

下面开始**分部分输出代码**。你只需要在 Godot 4.6 中**新建一个空项目**，按顺序把每一部分的文件创建出来即可运行。

***

# **第 1 部分：项目设置与全局单例**

## **1.1 输入映射（Project Settings → Input Map）**

手动添加以下 4 个 Action（也可用默认 UI 方向键，但自定义更直观）：

| Action 名称    | 绑定按键 |
| ------------ | ---- |
| `move_up`    | W、↑  |
| `move_down`  | S、↓  |
| `move_left`  | A、←  |
| `move_right` | D、→  |

## **1.2 全局单例** **`GameManager.gd`**

新建文件 `res://GameManager.gd`，然后在 **Project Settings → Autoload** 中以名称 `GameManager` 注册它，勾选 Enable。

```gdscript
# res://GameManager.gd
extends Node

signal xp_changed(current_xp: int, xp_to_next: int)
signal level_up(new_level: int)
signal player_died
signal game_time_changed(seconds: float)

var level: int = 1
var xp: int = 0
var xp_to_next: int = 5

var game_time: float = 0.0
var is_running: bool = false

# 玩家可被升级修改的属性（MVP 三选一词条的落点）
var bonus_damage: int = 0         # 伤害加成
var attack_rate_mult: float = 1.0 # 攻速倍率（越大越快）
var move_speed_mult: float = 1.0  # 移速倍率

func start_run() -> void:
    level = 1
    xp = 0
    xp_to_next = 5
    game_time = 0.0
    bonus_damage = 0
    attack_rate_mult = 1.0
    move_speed_mult = 1.0
    is_running = true
    emit_signal(&"xp_changed", xp, xp_to_next)

func _process(delta: float) -> void:
    if is_running:
        game_time += delta
        emit_signal(&"game_time_changed", game_time)

func add_xp(amount: int) -> void:
    xp += amount
    while xp >= xp_to_next:
        xp -= xp_to_next
        level += 1
        xp_to_next = int(xp_to_next * 1.35) + 2
        emit_signal(&"level_up", level)
    emit_signal(&"xp_changed", xp, xp_to_next)

func apply_upgrade(id: String) -> void:
    match id:
        "damage":
            bonus_damage += 1
        "attack_speed":
            attack_rate_mult *= 1.10
        "move_speed":
            move_speed_mult *= 1.10

func player_has_died() -> void:
    is_running = false
    emit_signal(&"player_died")
```

**说明**：`GameManager` 作为整局游戏的状态中心，玩家、敌人、HUD 都从它读写，避免节点互相耦合。

***

# **第 2 部分：玩家（八向移动 + 自动射击）**

## **2.1** **`Player.tscn`** **节点结构**

```
Player (CharacterBody2D)      # 脚本: Player.gd
├── Visual (ColorRect)        # 占位符：32x32，绿色
├── Collision (CollisionShape2D) # RectangleShape2D 32x32
├── AttackTimer (Timer)       # 自动攻击计时器
└── HurtCooldown (Timer)      # 受伤无敌帧
```

创建步骤：

1. 新建场景，根节点选 `CharacterBody2D`，重命名为 `Player`。
2. 子节点加 `ColorRect`：`size = (32,32)`，`position = (-16,-16)`，`color = 绿色 (0.3, 0.9, 0.4)`。
3. 加 `CollisionShape2D`，Shape 选 `RectangleShape2D`，`size = (32,32)`。
4. 加两个 `Timer`，分别命名 `AttackTimer`（`wait_time=0.6`，`autostart=false`，`one_shot=false`）、`HurtCooldown`（`wait_time=0.6`，`one_shot=true`）。
5. 给 `Player` 设置 Collision Layer = 1，Mask = 2（敌人放在第 2 层）。
6. 挂上下面脚本。保存为 `res://Player.tscn`。

## **2.2** **`Player.gd`**

```gdscript
# res://Player.gd
extends CharacterBody2D

signal health_changed(current: int, max_value: int)
signal died

@export var base_speed: float = 220.0
@export var max_health: int = 10
@export var base_damage: int = 1
@export var base_attack_interval: float = 0.6
@export var bullet_scene: PackedScene  # 在 Inspector 里拖入 Bullet.tscn

var current_health: int
var can_be_hurt: bool = true

@onready var attack_timer: Timer = $AttackTimer
@onready var hurt_cd: Timer = $HurtCooldown

func _ready() -> void:
    add_to_group(&"player")
    current_health = max_health
    emit_signal(&"health_changed", current_health, max_health)
    attack_timer.timeout.connect(_on_attack_timer)
    hurt_cd.timeout.connect(func(): can_be_hurt = true)
    _refresh_attack_rate()
    attack_timer.start()

func _physics_process(_delta: float) -> void:
    # 八向输入
    var input_vec := Vector2(
        Input.get_action_strength(&"move_right") - Input.get_action_strength(&"move_left"),
        Input.get_action_strength(&"move_down") - Input.get_action_strength(&"move_up")
    )
    if input_vec.length() > 0.0:
        input_vec = input_vec.normalized()  # 对角线不会更快
    velocity = input_vec * base_speed * GameManager.move_speed_mult
    move_and_slide()

func _refresh_attack_rate() -> void:
    # 攻速倍率越大，间隔越短
    attack_timer.wait_time = max(0.08, base_attack_interval / GameManager.attack_rate_mult)

func _on_attack_timer() -> void:
    _refresh_attack_rate()
    var target := _find_nearest_enemy()
    if target == null or bullet_scene == null:
        return
    var dir: Vector2 = (target.global_position - global_position).normalized()
    var b := bullet_scene.instantiate()
    b.global_position = global_position
    b.setup(dir, base_damage + GameManager.bonus_damage)
    get_tree().current_scene.add_child(b)

func _find_nearest_enemy() -> Node2D:
    var nearest: Node2D = null
    var min_d: float = INF
    for e in get_tree().get_nodes_in_group(&"enemy"):
        if not (e is Node2D):
            continue
        var d: float = global_position.distance_squared_to(e.global_position)
        if d < min_d:
            min_d = d
            nearest = e
    return nearest

func take_damage(amount: int) -> void:
    if not can_be_hurt:
        return
    can_be_hurt = false
    hurt_cd.start()
    current_health -= amount
    emit_signal(&"health_changed", current_health, max_health)
    modulate = Color(1, 0.4, 0.4)
    create_tween().tween_property(self, "modulate", Color.WHITE, 0.2)
    if current_health <= 0:
        emit_signal(&"died")
        GameManager.player_has_died()
        queue_free()
```

***

# **第 3 部分：子弹**

## **3.1** **`Bullet.tscn`** **节点结构**

```
Bullet (Area2D)               # 脚本: Bullet.gd
├── Visual (ColorRect)        # 10x10，黄色
├── Collision (CollisionShape2D) # RectangleShape2D 10x10
└── LifeTimer (Timer)         # wait_time=1.5, one_shot=true, autostart=true
```

设置：`Bullet` 的 Collision Layer = 4，Mask = 2（只检测敌人层）。

## **3.2** **`Bullet.gd`**

```gdscript
# res://Bullet.gd
extends Area2D

var direction: Vector2 = Vector2.RIGHT
var speed: float = 520.0
var damage: int = 1

func _ready() -> void:
    $LifeTimer.timeout.connect(queue_free)
    area_entered.connect(_on_area_entered)
    body_entered.connect(_on_body_entered)

func setup(dir: Vector2, dmg: int) -> void:
    direction = dir.normalized()
    damage = dmg
    rotation = direction.angle()

func _process(delta: float) -> void:
    position += direction * speed * delta

func _on_body_entered(body: Node) -> void:
    if body.is_in_group(&"enemy") and body.has_method("take_damage"):
        body.take_damage(damage)
        queue_free()

func _on_area_entered(_a: Area2D) -> void:
    pass
```

回到 `Player.tscn`，在 Inspector 把 `Bullet Scene` 字段拖入 `res://Bullet.tscn`。

***

# **第 4 部分：敌人与生成器**

## **4.1** **`Enemy.tscn`** **节点结构**

```
Enemy (CharacterBody2D)       # 脚本: Enemy.gd
├── Visual (ColorRect)        # 28x28，红色 (0.9, 0.3, 0.3)
└── Collision (CollisionShape2D) # RectangleShape2D 28x28
```

设置：`Enemy` Collision Layer = 2，Mask = 1 | 2（同时和玩家、其他敌人碰撞，避免重叠）。加到 Group：`enemy`（代码里也会自动加）。

## **4.2** **`Enemy.gd`**

```gdscript
# res://Enemy.gd
extends CharacterBody2D

@export var speed: float = 95.0
@export var max_health: int = 3
@export var damage: int = 1
@export var xp_reward: int = 1

var current_health: int
var _touch_cd: float = 0.0

func _ready() -> void:
    add_to_group(&"enemy")
    current_health = max_health

func _physics_process(delta: float) -> void:
    _touch_cd = max(0.0, _touch_cd - delta)
    var player := _get_player()
    if player == null:
        return
    var dir: Vector2 = (player.global_position - global_position).normalized()
    velocity = dir * speed
    move_and_slide()

    # 接触伤害
    if _touch_cd <= 0.0 and global_position.distance_to(player.global_position) < 28.0:
        if player.has_method("take_damage"):
            player.take_damage(damage)
            _touch_cd = 0.5

func _get_player() -> Node2D:
    var arr := get_tree().get_nodes_in_group(&"player")
    return arr[0] if arr.size() > 0 else null

func take_damage(amount: int) -> void:
    current_health -= amount
    modulate = Color(1, 1, 1, 0.6)
    create_tween().tween_property(self, "modulate", Color.WHITE, 0.12)
    if current_health <= 0:
        GameManager.add_xp(xp_reward)
        queue_free()
```

## **4.3** **`Spawner.gd`（挂在 Main 场景的一个空 Node 上）**

```gdscript
# res://Spawner.gd
extends Node

@export var enemy_scene: PackedScene
@export var spawn_interval: float = 1.2
@export var spawn_radius: float = 520.0

var _t: float = 0.0

func _process(delta: float) -> void:
    if not GameManager.is_running:
        return
    _t += delta
    var cur_interval: float = max(0.15, spawn_interval - GameManager.game_time * 0.01)
    if _t >= cur_interval:
        _t = 0.0
        _spawn_one()

func _spawn_one() -> void:
    var player_arr := get_tree().get_nodes_in_group(&"player")
    if player_arr.is_empty() or enemy_scene == null:
        return
    var player: Node2D = player_arr[0]
    var angle := randf() * TAU
    var pos: Vector2 = player.global_position + Vector2(cos(angle), sin(angle)) * spawn_radius
    var e := enemy_scene.instantiate()
    e.global_position = pos
    # 随时间加血
    var t: float = GameManager.game_time
    e.max_health = 3 + int(t / 15.0)
    get_tree().current_scene.add_child(e)
```

***

# **第 5 部分：HUD 与升级三选一**

## **5.1** **`HUD.tscn`** **节点结构**

```
HUD (CanvasLayer)             # 脚本: HUD.gd
├── Root (Control, anchors=Full Rect)
│   ├── HealthBar (ProgressBar)   # 位置(20,20), size(260,20)
│   ├── XPBar (ProgressBar)       # 位置(20,48), size(260,14)
│   ├── LevelLabel (Label)        # 位置(20,70)
│   ├── TimeLabel (Label)         # 位置(20,92)
│   └── UpgradePanel (Panel, visible=false, 居中, size(360,180))
│       ├── Title (Label) "Level Up! 选择一个升级"
│       ├── Btn1 (Button)
│       ├── Btn2 (Button)
│       └── Btn3 (Button)
```

## **5.2** **`HUD.gd`**

```gdscript
# res://HUD.gd
extends CanvasLayer

@onready var hp_bar: ProgressBar = $Root/HealthBar
@onready var xp_bar: ProgressBar = $Root/XPBar
@onready var level_label: Label = $Root/LevelLabel
@onready var time_label: Label = $Root/TimeLabel
@onready var panel: Panel = $Root/UpgradePanel
@onready var btn1: Button = $Root/UpgradePanel/Btn1
@onready var btn2: Button = $Root/UpgradePanel/Btn2
@onready var btn3: Button = $Root/UpgradePanel/Btn3

const UPGRADES := [
    {"id": "damage",       "text": "伤害 +1"},
    {"id": "attack_speed", "text": "攻速 +10%"},
    {"id": "move_speed",   "text": "移速 +10%"},
]

func _ready() -> void:
    GameManager.xp_changed.connect(_on_xp_changed)
    GameManager.level_up.connect(_on_level_up)
    GameManager.game_time_changed.connect(_on_time_changed)
    panel.visible = false

func bind_player(p: Node) -> void:
    if p.has_signal("health_changed"):
        p.health_changed.connect(_on_hp_changed)

func _on_hp_changed(cur: int, max_v: int) -> void:
    hp_bar.max_value = max_v
    hp_bar.value = cur

func _on_xp_changed(cur: int, to_next: int) -> void:
    xp_bar.max_value = to_next
    xp_bar.value = cur
    level_label.text = "Lv. %d" % GameManager.level

func _on_time_changed(t: float) -> void:
    time_label.text = "Time: %.1fs" % t

func _on_level_up(_lv: int) -> void:
    _show_upgrade_choices()

func _show_upgrade_choices() -> void:
    var pool := UPGRADES.duplicate()
    pool.shuffle()
    var picks := pool.slice(0, 3)
    var buttons := [btn1, btn2, btn3]
    for i in 3:
        var data: Dictionary = picks[i]
        var b: Button = buttons[i]
        b.text = data["text"]
        # 清理旧连接
        for c in b.pressed.get_connections():
            b.pressed.disconnect(c["callable"])
        b.pressed.connect(func(): _pick(data["id"]))
    panel.visible = true
    get_tree().paused = true
    # 让 HUD 在暂停时仍可交互
    process_mode = Node.PROCESS_MODE_ALWAYS

func _pick(id: String) -> void:
    GameManager.apply_upgrade(id)
    panel.visible = false
    get_tree().paused = false
```

***

# **第 6 部分：主场景组装与死亡重开**

## **6.1** **`Main.tscn`** **节点结构**

```
Main (Node2D)                     # 脚本: Main.gd
├── Background (ColorRect)        # size(2000,2000), position(-1000,-1000), color 深灰
├── Player (实例化 Player.tscn)    # position(0,0)
├── Spawner (Node, 挂 Spawner.gd)
├── HUD (实例化 HUD.tscn)
└── GameOverLabel (Label)         # 居中，初始 visible=false，文字 "YOU DIED  (按 R 重开)"
```

记得在 Inspector 里：

- `Spawner` 的 `Enemy Scene` 字段拖入 `Enemy.tscn`
- `Player` 的 `Bullet Scene` 字段拖入 `Bullet.tscn`

## **6.2** **`Main.gd`**

```gdscript
# res://Main.gd
extends Node2D

@onready var hud: CanvasLayer = $HUD
@onready var player: Node = $Player
@onready var game_over_label: Label = $GameOverLabel

func _ready() -> void:
    randomize()
    game_over_label.visible = false
    hud.bind_player(player)
    player.died.connect(_on_player_died)
    GameManager.start_run()

func _on_player_died() -> void:
    game_over_label.visible = true

func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventKey and event.pressed and event.keycode == KEY_R:
        get_tree().paused = false
        get_tree().reload_current_scene()
```

最后在 **Project Settings → Application → Run → Main Scene** 设置为 `res://Main.tscn`，按 F5 即可游玩。

***

## **运行后的 MVP 体验**

启动后你会看到：深灰背景中央有一个绿色方块（玩家），WASD / 方向键八向移动（对角线已归一化不会加速）；红色方块会不断从屏幕外朝你涌来，贴身时对你造成伤害并触发短暂无敌帧；绿方块每 0.6 秒自动朝最近的红方块发射一颗黄色子弹；击杀敌人获得经验，经验条满后游戏暂停并弹出三选一升级面板（伤害 / 攻速 / 移速），选完继续；敌人随时间越来越结实；血量归零时显示 "YOU DIED"，按 R 重开。

这套 MVP 的代码总量约 **300 行左右**，完全无需任何美术资源，可以作为你后续扩展的干净骨架：之后你可以把 `ColorRect` 换成 `Sprite2D` + `AnimatedSprite2D`，把升级池扩充为更多词条，把 `Spawner` 做成按波次配置的数据驱动，甚至接入房间地图和 Boss——但这些都可以在当前这套能跑的循环上稳步迭代，而不必从零重来。
