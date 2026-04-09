# ThreeKing Survivor - 开火射击交互优化方案

**文档版本**: v1.0
**创建日期**: 2026-04-08
**适用范围**: Day 5 MVP 射击系统优化
**问题定义**: 无鼠标环境下无法控制子弹方向，当前只能向前射击，无法向其他方向开火

---

## 目录

1. [问题分析](#问题分析)
2. [候选方案对比](#候选方案对比)
3. [推荐方案：混合模式](#推荐方案混合模式)
4. [实现代码](#实现代码)
5. [输入映射配置](#输入映射配置)
6. [验证测试](#验证测试)

---

## 问题分析

### 当前设计缺陷

| 组件 | 当前实现 | 问题 |
|-----|---------|------|
| 瞄准控制 | `get_global_mouse_position()` | 无鼠标时无法获取有效方向 |
| 射击方向 | 基于鼠标位置计算 | 触摸板/键盘-only 设备失效 |
| 自动射击 | 空格键开关 | 开启后只能向前射击（无鼠标时） |

### 影响评估

- **设备兼容性**: 笔记本触摸板、键盘-only 设备、部分游戏手柄无法正常使用
- **游戏体验**: 核心玩法（射击）失效，只能被动躲避，游戏性大幅降低
- **可访问性**: 无法支持无鼠标用户

---

## 候选方案对比

| 方案 | 实现方式 | 优点 | 缺点 | 推荐度 |
|-----|---------|------|------|--------|
| **A. 方向键瞄准** | 方向键/IJKL控制8方向瞄准 | 纯键盘可玩，8方向精准 | 需要双手操作 | ⭐⭐⭐⭐ |
| **B. 移动即瞄准** | 面朝移动方向 | 单手操作，简单 | 无法边退边打 | ⭐⭐ |
| **C. 自动瞄准** | 自动锁定最近敌人 | 单手，降低门槛 | 玩家掌控感低 | ⭐⭐⭐ |
| **D. 混合模式** | 默认方向键，按Tab切换自动 | 灵活适应不同场景 | 实现复杂度较高 | ⭐⭐⭐⭐⭐ |

**推荐方案**: **D. 混合模式** - 默认方向键瞄准，支持自动瞄准作为辅助，同时保留鼠标支持。

---

## 推荐方案：混合模式

### 核心设计

```
┌─────────────────────────────────────────────────────────────┐
│                    混合瞄准模式                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   鼠标模式   │    │  方向键模式  │    │  自动模式    │   │
│  │   (默认)    │    │   (无鼠标)   │    │  (辅助)     │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                             │
│  切换方式：                                                 │
│  - Tab键：鼠标 ↔ 方向键 ↔ 自动                            │
│  - 检测到鼠标输入：自动切换到鼠标模式                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 模式说明

| 模式 | 触发条件 | 瞄准方式 | 适用场景 |
|-----|---------|---------|---------|
| 鼠标模式 | 有鼠标输入 | 鼠标位置 | 桌面环境 |
| 方向键模式 | 无鼠标、按方向键 | 8方向（45°增量） | 笔记本触摸板、键盘 |
| 自动模式 | 按Tab切换 | 自动锁定最近敌人 | 新手辅助、单手操作 |

---

## 实现代码

### Player.gd - 核心修改

```gdscript
extends CharacterBody2D
class_name Player

# ========== 瞄准模式枚举 ==========
enum AimMode {
    MOUSE,      # 鼠标瞄准
    KEYS,       # 方向键瞄准（8方向）
    AUTO,       # 自动瞄准
    MOVEMENT    # 移动方向即瞄准
}

@export var aim_mode: AimMode = AimMode.MOUSE

# 方向键瞄准时记录的最后方向
var last_key_aim_direction: Vector2 = Vector2.RIGHT

# 自动模式的检测范围
@export var auto_aim_range: float = 500.0

# 自动模式的最近敌人
var auto_target: Node2D = null

# ========== 现有属性（保持不变）==========
@export var speed: float = 220.0
@export var friction: float = 0.15
@export var shoot_cooldown: float = 0.2
@export var bullet_speed: float = 400.0
@export var bullet_damage: int = 15

var current_hp: int
var max_hp: int = 100
var is_auto_shooting: bool = false
var last_shot_time: float = 0.0
var is_invincible: bool = false
@export var invincibility_duration: float = 1.0

@onready var sprite: Sprite2D = $Sprite2D
@onready var bullet_spawn: Node2D = $BulletSpawn

const BulletScene = preload("res://scenes/Bullet.tscn")

# ========== 初始化 ==========

func _ready():
    current_hp = max_hp
    is_invincible = false
    is_auto_shooting = false
    last_shot_time = 0.0
    add_to_group("player")

    # 自动检测输入设备，选择合适的瞄准模式
    _detect_input_device()

# 检测输入设备，自动选择合适的瞄准模式
func _detect_input_device():
    # 默认使用鼠标模式
    # 如果检测到只有键盘输入，自动切换到方向键模式
    # 可以通过游戏设置菜单修改
    pass

# ========== 物理更新 ==========

func _physics_process(delta):
    _handle_movement(delta)
    _clamp_to_screen()
    move_and_slide()

func _process(delta):
    _handle_aiming()
    _handle_shooting()

# ========== 输入处理 ==========

func _input(event):
    # 切换自动射击
    if event.is_action_pressed("shoot"):
        is_auto_shooting = !is_auto_shooting

    # 切换瞄准模式
    if event.is_action_pressed("toggle_aim_mode"):
        _cycle_aim_mode()

    # 重新开始
    if event.is_action_pressed("restart"):
        if get_tree().current_scene.has_method("restart"):
            get_tree().current_scene.call("restart")

# 循环切换瞄准模式
func _cycle_aim_mode():
    aim_mode = (aim_mode + 1) % AimMode.size()
    _show_aim_mode_notification()

# 显示瞄准模式切换提示（可以添加UI提示）
func _show_aim_mode_notification():
    var mode_names = ["鼠标瞄准", "方向键瞄准", "自动瞄准", "移动瞄准"]
    var mode_name = mode_names[aim_mode]
    print("切换瞄准模式: " + mode_name)
    # 这里可以添加UI显示，如在玩家头顶显示短暂提示

# ========== 移动处理 ==========

func _handle_movement(delta):
    var input_dir = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

    if input_dir.length() > 0:
        velocity = velocity.lerp(input_dir * speed, friction)
    else:
        velocity = velocity.lerp(Vector2.ZERO, friction)

# ========== 瞄准处理（核心修改）==========

func _handle_aiming():
    match aim_mode:
        AimMode.MOUSE:
            _aim_with_mouse()
        AimMode.KEYS:
            _aim_with_keys()
        AimMode.AUTO:
            _aim_with_auto()
        AimMode.MOVEMENT:
            _aim_with_movement()

# 鼠标瞄准（原始方式）
func _aim_with_mouse():
    var mouse_pos = get_global_mouse_position()
    var aim_dir = (mouse_pos - global_position).normalized()
    _update_sprite_direction(aim_dir)

# 方向键瞄准（8方向）- 新增
func _aim_with_keys():
    # 使用方向键或IJKL控制瞄准方向
    var aim_input = Input.get_vector("aim_left", "aim_right", "aim_up", "aim_down")

    if aim_input.length() > 0:
        # 记录最后输入的方向（用于保持瞄准方向）
        last_key_aim_direction = aim_input.normalized()

    # 使用最后记录的瞄准方向更新精灵朝向
    _update_sprite_direction(last_key_aim_direction)

# 自动瞄准（锁定最近敌人）- 新增
func _aim_with_auto():
    # 寻找最近的敌人
    var target = _find_nearest_enemy()

    if target and is_instance_valid(target):
        # 计算指向敌人的方向
        var aim_dir = (target.global_position - global_position).normalized()
        _update_sprite_direction(aim_dir)
        auto_target = target
    else:
        # 没有敌人时保持当前朝向或使用移动方向
        if velocity.length() > 10:
            _update_sprite_direction(velocity.normalized())
        auto_target = null

# 移动方向即瞄准 - 新增
func _aim_with_movement():
    # 玩家始终面向移动方向
    if velocity.length() > 10:
        var aim_dir = velocity.normalized()
        _update_sprite_direction(aim_dir)

# 更新精灵朝向（共用函数）
func _update_sprite_direction(direction: Vector2):
    if direction.x < 0:
        sprite.flip_h = true
    else:
        sprite.flip_h = false

# 寻找最近的敌人
func _find_nearest_enemy() -> Node2D:
    var enemies = get_tree().get_nodes_in_group("enemies")
    var nearest: Node2D = null
    var nearest_dist = auto_aim_range  # 使用配置的检测范围

    for enemy in enemies:
        if not is_instance_valid(enemy):
            continue

        var dist = global_position.distance_to(enemy.global_position)
        if dist < nearest_dist:
            nearest_dist = dist
            nearest = enemy

    return nearest

# ========== 射击处理 ==========

func _handle_shooting():
    if not is_auto_shooting:
        return

    var now = Time.get_ticks_msec() / 1000.0
    if now - last_shot_time < shoot_cooldown:
        return

    last_shot_time = now
    _shoot()

func _shoot():
    # 根据当前瞄准模式确定射击方向
    var direction: Vector2

    match aim_mode:
        AimMode.MOUSE:
            var mouse_pos = get_global_mouse_position()
            direction = (mouse_pos - global_position).normalized()
        AimMode.KEYS:
            direction = last_key_aim_direction
        AimMode.AUTO:
            if auto_target and is_instance_valid(auto_target):
                direction = (auto_target.global_position - global_position).normalized()
            else:
                direction = Vector2.RIGHT if not sprite.flip_h else Vector2.LEFT
        AimMode.MOVEMENT, _:
            if velocity.length() > 10:
                direction = velocity.normalized()
            else:
                direction = Vector2.RIGHT if not sprite.flip_h else Vector2.LEFT

    var bullet = BulletScene.instantiate()
    bullet.global_position = bullet_spawn.global_position if bullet_spawn else global_position
    bullet.direction = direction
    bullet.speed = bullet_speed
    bullet.damage = bullet_damage
    get_tree().current_scene.add_child(bullet)

# ========== 边界限制 ==========

func _clamp_to_screen():
    var margin = 16.0
    var viewport_size = get_viewport_rect().size
    global_position.x = clamp(global_position.x, margin, viewport_size.x - margin)
    global_position.y = clamp(global_position.y, margin, viewport_size.y - margin)

# ========== 受伤与死亡 ==========

func take_damage(amount: int):
    if is_invincible:
        return

    current_hp -= amount

    if get_tree().current_scene.has_method("start_screen_shake"):
        get_tree().current_scene.call("start_screen_shake", 5.0, 0.15)

    is_invincible = true
    sprite.modulate = Color.RED

    await get_tree().create_timer(invincibility_duration).timeout

    is_invincible = false
    sprite.modulate = Color.WHITE

    if current_hp <= 0:
        die()

func die():
    if get_tree().current_scene.has_method("game_over"):
        get_tree().current_scene.call("game_over")
    queue_free()
