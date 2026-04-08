

📋 游戏概述

游戏类型：2D俯视视角 Roguelike 生存射击游戏  
核心玩法：类似《吸血鬼幸存者》+《几何战争》的结合体  
开发引擎：Godot 4.x  
开发周期：2-4周（单人开发）


---

🎮 核心功能模块

1. 玩家系统
- 移动：WASD/摇杆控制，带惯性滑动
- 射击：鼠标瞄准，自动/手动射击
- 属性：HP、能量、移动速度、射速
- 成长：局内升级 + 局外永久强化

2. 武器系统
- 多种武器：
  - 脉冲爆裂枪（散射）
  - 电弧发射器（连锁闪电）
  - 电磁狙击枪（高伤单发）
  - 新星榴弹炮（范围爆炸）
  
3. 敌人系统
- 普通敌人（6-7种）：
  - 追踪型（红色圆形）
  - 快速型（三角形）
  - 坦克型（大型方块）
  - 远程型（菱形）
  
- BOSS（2只）：
  - 阶段一BOSS：大型红色核心
  - 阶段二BOSS：多形态变换

4. 技能系统
- 抽卡机制：每级3选1
- 技能类型：
  - 超频核心（攻速提升）
  - 零点晶核（暴击率）
  - 反弹盾（防御）
  
5. 特效系统
- 子弹碰撞粒子
- 敌人死亡爆炸
- 屏幕震动
- 霓虹光晕效果


---

🛠️ 技术实现方案

项目结构
res://
├── scenes/
│   ├── game/
│   │   ├── Game.tscn              # 主游戏场景
│   │   ├── Arena.tscn             # 竞技场
│   │   └── PauseMenu.tscn         # 暂停菜单
│   │
│   ├── player/
│   │   ├── Player.tscn            # 玩家
│   │   └── Player.gd
│   │
│   ├── enemies/
│   │   ├── Enemy.tscn             # 敌人基类
│   │   ├── BasicEnemy.tscn        # 基础敌人
│   │   ├── FastEnemy.tscn         # 快速敌人
│   │   ├── TankEnemy.tscn         # 坦克敌人
│   │   └── Boss.tscn              # BOSS
│   │
│   ├── weapons/
│   │   ├── Weapon.tscn            # 武器基类
│   │   ├── PulseGun.tscn          # 脉冲枪
│   │   ├── ArcLauncher.tscn       # 电弧发射器
│   │   └── Sniper.tscn            # 狙击枪
│   │
│   ├── bullets/
│   │   ├── Bullet.tscn            # 子弹基类
│   │   └── Bullet.gd
│   │
│   ├── ui/
│   │   ├── HUD.tscn               # 游戏界面
│   │   ├── SkillCard.tscn         # 技能卡牌
│   │   ├── SkillSelect.tscn       # 技能选择界面
│   │   ├── UpgradeMenu.tscn       # 升级菜单
│   │   └── DamageNumber.tscn      # 伤害数字
│   │
│   └── effects/
│       ├── Explosion.tscn         # 爆炸特效
│       └── MuzzleFlash.tscn       # 枪口火焰
│
├── scripts/
│   ├── core/
│   │   ├── GameManager.gd         # 游戏管理器
│   │   ├── WaveManager.gd         # 波次管理
│   │   ├── ObjectPool.gd          # 对象池
│   │   └── DamageCalculator.gd    # 伤害计算
│   │
│   ├── entities/
│   │   ├── Entity.gd              # 实体基类
│   │   ├── Character.gd           # 角色基类
│   │   └── EnemyAI.gd             # 敌人AI
│   │
│   └── systems/
│       ├── WeaponSystem.gd        # 武器系统
│       ├── SkillSystem.gd         # 技能系统
│       └── UpgradeSystem.gd       # 升级系统
│
├── resources/
│   ├── data/
│   │   ├── weapons/               # 武器数据 (.tres)
│   │   ├── enemies/               # 敌人数据
│   │   ├── skills/                # 技能数据
│   │   └── upgrades/              # 永久升级数据
│   │
│   └── shaders/
│       ├── NeonGlow.gdshader      # 霓虹光晕
│       └── ScreenShake.gdshader   # 屏幕震动
│
└── assets/
    ├── sprites/
    │   ├── player/
    │   ├── enemies/
    │   ├── bullets/
    │   └── effects/
    │
    ├── audio/
    │   ├── sfx/
    │   │   ├── shoot/
    │   │   ├── explosion/
    │   │   └── hit/
    │   └── music/
    │
    └── fonts/
        └── NeonFont.ttf

核心脚本实现

1. 玩家控制器 (Player.gd)
extends CharacterBody2D
class_name Player

@export var speed: float = 200.0
@export var max_hp: float = 100.0
@export var energy: float = 120.0

var current_hp: float
var aim_direction: Vector2
var is_aiming: bool = false

@onready var sprite: Sprite2D = $Sprite2D
@onready var aim_circle: Sprite2D = $AimCircle
@onready var weapon_slot: Node2D = $WeaponSlot

signal hp_changed(new_hp: float)
signal energy_changed(new_energy: float)

func _ready():
    current_hp = max_hp
    Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)

func _process(delta):
    _handle_aiming()
    _update_aim_circle()

func _physics_process(delta):
    _handle_movement(delta)
    move_and_slide()

func _handle_movement(delta):
    var input_dir = Vector2.ZERO
    input_dir.x = Input.get_action_strength("ui_right") - Input.get_action_strength("ui_left")
    input_dir.y = Input.get_action_strength("ui_down") - Input.get_action_strength("ui_up")
    
    if input_dir.length() > 0:
        input_dir = input_dir.normalized()
        velocity = input_dir * speed
    else:
        velocity = velocity.move_toward(Vector2.ZERO, speed * 0.1)

func _handle_aiming():
    if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
        is_aiming = true
        aim_direction = (get_global_mouse_position() - global_position).normalized()
    else:
        is_aiming = false

func _update_aim_circle():
    if is_aiming:
        aim_circle.global_position = global_position + aim_direction * 40
        aim_circle.visible = true
    else:
        aim_circle.visible = false

func take_damage(amount: float):
    current_hp = max(0, current_hp - amount)
    hp_changed.emit(current_hp)
    
    if current_hp <= 0:
        die()

func die():
    # 播放死亡特效
    GameManager.game_over()
    queue_free()

func heal(amount: float):
    current_hp = min(max_hp, current_hp + amount)
    hp_changed.emit(current_hp)

2. 武器系统 (WeaponSystem.gd)
extends Node
class_name WeaponSystem

@export var current_weapon: WeaponData
var fire_rate: float = 0.1
var last_fire_time: float = 0.0
var damage_multiplier: float = 1.0

signal weapon_fired(bullet_data: Dictionary)

func _ready():
    if current_weapon:
        fire_rate = current_weapon.fire_rate

func try_fire(player_pos: Vector2, aim_dir: Vector2) -> bool:
    var current_time = Time.get_ticks_msec() / 1000.0
    
    if current_time - last_fire_time >= fire_rate:
        fire(player_pos, aim_dir)
        last_fire_time = current_time
        return true
    return false

func fire(player_pos: Vector2, aim_dir: Vector2):
    match current_weapon.weapon_type:
        "pulse":
            _fire_pulse_gun(player_pos, aim_dir)
        "arc":
            _fire_arc_launcher(player_pos, aim_dir)
        "sniper":
            _fire_sniper(player_pos, aim_dir)
        "grenade":
            _fire_grenade(player_pos, aim_dir)

func _fire_pulse_gun(pos: Vector2, dir: Vector2):
    # 散射3发子弹
    for i in range(-1, 2):
        var spread_angle = deg_to_rad(i * 15)
        var spread_dir = dir.rotated(spread_angle)
        
        var bullet_data = {
            "position": pos,
            "direction": spread_dir,
            "damage": current_weapon.damage * damage_multiplier,
            "speed": current_weapon.bullet_speed,
            "color": Color(0.2, 0.8, 1.0),
            "size": 6
        }
        weapon_fired.emit(bullet_data)

func _fire_arc_launcher(pos: Vector2, dir: Vector2):
    # 发射连锁闪电
    var bullet_data = {
        "position": pos,
        "direction": dir,
        "damage": current_weapon.damage * damage_multiplier,
        "speed": current_weapon.bullet_speed,
        "color": Color(0.0, 1.0, 0.8),
        "size": 8,
        "chain_count": 3,
        "chain_range": 150.0
    }
    weapon_fired.emit(bullet_data)

func upgrade(new_weapon: WeaponData):
    current_weapon = new_weapon
    fire_rate = current_weapon.fire_rate

3. 敌人AI (EnemyAI.gd)
extends CharacterBody2D
class_name EnemyAI

enum EnemyType { BASIC, FAST, TANK, RANGED, BOSS }

@export var enemy_type: EnemyType = EnemyType.BASIC
@export var max_hp: float = 20.0
@export var speed: float = 80.0
@export var damage: float = 10.0
@export var score_value: int = 10

var current_hp: float
var player: Node2D
var attack_cooldown: float = 0.0
var state: String = "chase"

@onready var sprite: Sprite2D = $Sprite2D

signal enemy_died(score: int, position: Vector2)

func _ready():
    current_hp = max_hp
    player = get_tree().get_first_node_in_group("player")
    
    # 根据敌人类型设置属性
    _setup_enemy_type()

func _physics_process(delta):
    if not player:
        return
    
    match state:
        "chase":
            _chase_player(delta)
        "attack":
            _attack_player(delta)
        "retreat":
            _retreat_from_player(delta)

func _chase_player(delta):
    if not player:
        return
    
    var direction = (player.global_position - global_position).normalized()
    velocity = direction * speed
    move_and_slide()
    
    # 检测与玩家距离
    var distance = global_position.distance_to(player.global_position)
    if distance < 50:
        state = "attack"

func _attack_player(delta):
    attack_cooldown -= delta
    
    if attack_cooldown <= 0:
        player.take_damage(damage)
        attack_cooldown = 1.0
        
        if enemy_type == EnemyType.FAST:
            state = "retreat"
        else:
            state = "chase"

func _retreat_from_player(delta):
    if not player:
        return
    
    var direction = (global_position - player.global_position).normalized()
    velocity = direction * speed * 1.5
    move_and_slide()
    
    var distance = global_position.distance_to(player.global_position)
    if distance > 200:
        state = "chase"

func _setup_enemy_type():
    match enemy_type:
        EnemyType.BASIC:
            speed = 80
            max_hp = 20
            damage = 10
            sprite.modulate = Color(1.0, 0.2, 0.2)  # 红色
            
        EnemyType.FAST:
            speed = 150
            max_hp = 10
            damage = 5
            sprite.modulate = Color(1.0, 0.8, 0.2)  # 黄色
            
        EnemyType.TANK:
            speed = 40
            max_hp = 100
            damage = 20
            sprite.modulate = Color(0.8, 0.2, 0.8)  # 紫色
            scale = Vector2(1.5, 1.5)
            
        EnemyType.RANGED:
            speed = 60
            max_hp = 15
            damage = 15
            sprite.modulate = Color(0.2, 0.6, 1.0)  # 蓝色
            
        EnemyType.BOSS:
            speed = 50
            max_hp = 500
            damage = 30
            sprite.modulate = Color(1.0, 0.0, 0.0)  # 深红
            scale = Vector2(3.0, 3.0)

func take_damage(amount: float):
    current_hp = max(0, current_hp - amount)
    
    # 播放受击效果
    _play_hit_effect()
    
    if current_hp <= 0:
        die()

func _play_hit_effect():
    # 闪烁效果
    var tween = create_tween()
    sprite.modulate = Color.WHITE
    tween.tween_property(sprite, "modulate", sprite.modulate, 0.1)

func die():
    enemy_died.emit(score_value, global_position)
    
    # 播放死亡特效
    _spawn_death_effect()
    queue_free()

func _spawn_death_effect():
    var explosion = preload("res://scenes/effects/Explosion.tscn").instantiate()
    explosion.global_position = global_position
    explosion.color = sprite.modulate
    get_tree().current_scene.add_child(explosion)

4. 波次管理 (WaveManager.gd)
extends Node
class_name WaveManager

signal wave_started(wave_number: int)
signal wave_completed(wave_number: int)
signal boss_spawned()

@export var arena_size: Vector2 = Vector2(800, 600)

var current_wave: int = 1
var enemies_alive: int = 0
var wave_in_progress: bool = false
var enemies_to_spawn: Array[Dictionary] = []
var spawn_timer: float = 0.0

var enemy_prefab: PackedScene
var boss_prefab: PackedScene

func _ready():
    enemy_prefab = preload("res://scenes/enemies/Enemy.tscn")
    boss_prefab = preload("res://scenes/enemies/Boss.tscn")
    start_wave(1)

func _process(delta):
    if wave_in_progress and enemies_to_spawn.size() > 0:
        spawn_timer -= delta
        if spawn_timer <= 0:
            _spawn_next_enemy()
            spawn_timer = randf_range(0.5, 2.0)
    
    if wave_in_progress and enemies_alive == 0 and enemies_to_spawn.size() == 0:
        complete_wave()

func start_wave(wave_number: int):
    current_wave = wave_number
    wave_in_progress = true
    enemies_to_spawn.clear()
    
    wave_started.emit(wave_number)
    
    # 生成波次配置
    _generate_wave(wave_number)
    
    # 立即开始生成
    spawn_timer = 0.0

func _generate_wave(wave_number: int):
    # 基础敌人数量随波次增加
    var base_count = 5 + wave_number * 2
    
    # 添加普通敌人
    for i in range(base_count):
        enemies_to_spawn.append({
            "type": EnemyAI.EnemyType.BASIC,
            "hp_multiplier": 1.0 + (wave_number * 0.1)
        })
    
    # 每3波添加快速敌人
    if wave_number % 3 == 0:
        for i in range(3):
            enemies_to_spawn.append({
                "type": EnemyAI.EnemyType.FAST,
                "hp_multiplier": 1.0 + (wave_number * 0.1)
            })
    
    # 每5波添加坦克敌人
    if wave_number % 5 == 0:
        for i in range(2):
            enemies_to_spawn.append({
                "type": EnemyAI.EnemyType.TANK,
                "hp_multiplier": 1.0 + (wave_number * 0.1)
            })
    
    # BOSS波次
    if wave_number % 10 == 0:
        enemies_to_spawn.append({
            "type": EnemyAI.EnemyType.BOSS,
            "hp_multiplier": 1.0 + (wave_number * 0.05)
        })
        boss_spawned.emit()

func _spawn_next_enemy():
    if enemies_to_spawn.size() == 0:
        return
    
    var enemy_data = enemies_to_spawn.pop_front()
    var enemy = enemy_prefab.instantiate()
    
    # 随机生成位置（在竞技场边缘）
    var spawn_pos = _get_random_spawn_position()
    enemy.global_position = spawn_pos
    
    # 设置敌人类型和属性
    enemy.enemy_type = enemy_data.type
    enemy.max_hp *= enemy_data.hp_multiplier
    enemy.current_hp = enemy.max_hp
    
    # 连接死亡信号
    enemy.enemy_died.connect(_on_enemy_died)
    
    get_tree().current_scene.add_child(enemy)
    enemies_alive += 1

func _get_random_spawn_position() -> Vector2:
    # 在竞技场边缘随机生成
    var side = randi() % 4
    var margin = 50
    
    match side:
        0: # 上边
            return Vector2(randf_range(margin, arena_size.x - margin), -margin)
        1: # 右边
            return Vector2(arena_size.x + margin, randf_range(margin, arena_size.y - margin))
        2: # 下边
            return Vector2(randf_range(margin, arena_size.x - margin), arena_size.y + margin)
        3: # 左边
            return Vector2(-margin, randf_range(margin, arena_size.y - margin))
    
    return Vector2.ZERO

func _on_enemy_died(score: int, position: Vector2):
    enemies_alive -= 1
    GameManager.add_score(score)

func complete_wave():
    wave_in_progress = false
    wave_completed.emit(current_wave)
    
    # 延迟后开始下一波
    await get_tree().create_timer(3.0).timeout
    start_wave(current_wave + 1)

5. 技能选择系统 (SkillSystem.gd)
extends CanvasLayer
class_name SkillSelectUI

signal skill_selected(skill_id: String)

@onready var card_container: HBoxContainer = $MarginContainer/VBoxContainer/HBoxContainer
@onready var title_label: Label = $MarginContainer/VBoxContainer/Title

var skill_cards: Array[SkillCard] = []

func _ready():
    hide()

func show_skill_select(available_skills: Array[SkillData]):
    show()
    title_label.text = "选择技能升级"
    
    # 清空旧卡片
    for card in skill_cards:
        card.queue_free()
    skill_cards.clear()
    
    # 随机选择3个技能
    var selected_skills = _select_random_skills(available_skills, min(3, available_skills.size()))
    
    # 创建卡片
    for skill_data in selected_skills:
        var card = preload("res://scenes/ui/SkillCard.tscn").instantiate()
        card.setup(skill_data)
        card.skill_chosen.connect(_on_skill_chosen)
        card_container.add_child(card)
        skill_cards.append(card)

func _select_random_skills(skills: Array[SkillData], count: int) -> Array[SkillData]:
    var shuffled = skills.duplicate()
    shuffled.shuffle()
    return shuffled.slice(0, count)

func _on_skill_chosen(skill_id: String):
    skill_selected.emit(skill_id)
    hide()

6. 对象池 (ObjectPool.gd)
extends Node
class_name ObjectPool

@export var scene: PackedScene
@export var initial_size: int = 50
@export var max_size: int = 200

var _available: Array[Node2D] = []
var _in_use: Array[Node2D] = []

func _ready():
    for i in range(initial_size):
        var obj = _create_object()
        _available.append(obj)

func _create_object() -> Node2D:
    var obj = scene.instantiate()
    obj.set_process(false)
    obj.set_physics_process(false)
    obj.visible = false
    add_child(obj)
    return obj

func get_object(position: Vector2, data: Dictionary = {}) -> Node2D:
    var obj: Node2D
    
    if _available.is_empty():
        if _in_use.size() < max_size:
            obj = _create_object()
        else:
            # 复用最早的对象
            obj = _in_use.pop_front()
            _recycle_object(obj)
    else:
        obj = _available.pop_back()
    
    _initialize_object(obj, position, data)
    _in_use.append(obj)
    
    return obj

func _initialize_object(obj: Node2D, position: Vector2, data: Dictionary):
    obj.global_position = position
    obj.visible = true
    obj.set_process(true)
    obj.set_physics_process(true)
    
    if obj.has_method("init"):
        obj.call("init", data)

func return_object(obj: Node2D):
    if _in_use.has(obj):
        _recycle_object(obj)
        _in_use.erase(obj)
        _available.append(obj)

func _recycle_object(obj: Node2D):
    obj.visible = false
    obj.set_process(false)
    obj.set_physics_process(false)
    
    if obj.has_method("reset"):
        obj.call("reset")

func clear():
    for obj in _in_use:
        return_object(obj)


---

🎨 素材清单

1. 精灵图 (Sprites)

玩家角色
assets/sprites/player/
├── player_base.png           # 基础圆形 (64x64, 青色 #00FFFF)
├── player_aim.png            # 瞄准圈 (128x128, 半透明白)
└── player_hit.png            # 受击闪烁 (64x64)

敌人
assets/sprites/enemies/
├── basic_enemy.png           # 基础敌人 (48x48, 红色 #FF3333)
├── fast_enemy.png            # 快速敌人 (三角形 48x48, 黄色 #FFCC33)
├── tank_enemy.png            # 坦克敌人 (方块 72x72, 紫色 #CC33CC)
├── ranged_enemy.png          # 远程敌人 (菱形 48x48, 蓝色 #3399FF)
└── boss_core.png             # BOSS核心 (192x192, 深红 #FF0000)

子弹
assets/sprites/bullets/
├── bullet_pulse.png          # 脉冲子弹 (16x16, 渐变蓝)
├── bullet_arc.png            # 电弧子弹 (20x20, 青绿)
├── bullet_sniper.png         # 狙击子弹 (24x24, 橙色)
└── bullet_grenade.png        # 榴弹 (32x32, 红色)

特效
assets/sprites/effects/
├── explosion_01.png          # 爆炸帧1 (64x64)
├── explosion_02.png          # 爆炸帧2 (64x64)
├── explosion_03.png          # 爆炸帧3 (64x64)
├── muzzle_flash.png          # 枪口火焰 (32x32)
├── hit_spark.png             # 命中火花 (32x32)
└── glow_overlay.png          # 光晕叠加 (128x128)

2. UI素材
assets/sprites/ui/
├── health_bar_bg.png         # 血条背景 (200x20, 深灰)
├── health_bar_fill.png       # 血条填充 (200x20, 绿色渐变)
├── energy_bar_fill.png       # 能量条填充 (200x20, 蓝色渐变)
├── skill_card_bg.png         # 技能卡背景 (300x400, 半透黑)
├── skill_card_rare.png       # 稀有卡边框 (300x400, 金色)
└── button_hover.png          # 按钮悬停 (200x60)

3. 音频素材

音效 (SFX)
assets/audio/sfx/
├── shoot/
│   ├── pulse_gun.wav         # 脉冲枪射击 (0.1s)
│   ├── arc_launcher.wav      # 电弧发射 (0.2s)
│   ├── sniper_shot.wav       # 狙击枪 (0.3s)
│   └── grenade_launch.wav    # 榴弹发射 (0.4s)
│
├── explosion/
│   ├── small_explosion.wav   # 小爆炸 (0.3s)
│   ├── medium_explosion.wav  # 中爆炸 (0.5s)
│   └── large_explosion.wav   # 大爆炸 (0.8s)
│
├── hit/
│   ├── enemy_hit.wav         # 敌人受击 (0.1s)
│   ├── player_hit.wav        # 玩家受击 (0.2s)
│   └── boss_hit.wav          # BOSS受击 (0.3s)
│
├── ui/
│   ├── card_flip.wav         # 翻卡 (0.1s)
│   ├── skill_select.wav      # 技能选择 (0.2s)
│   └── level_up.wav          # 升级 (0.5s)
│
└── ambient/
    ├── arena_hum.wav         # 竞技场背景音 (循环)
    └── warning_beep.wav      # 警告提示 (0.2s)

音乐 (BGM)
assets/audio/music/
├── main_theme.ogg            # 主主题曲 (电子乐, 120BPM, 循环)
├── boss_battle.ogg           # BOSS战 (激烈电子乐, 140BPM)
└── victory.ogg               # 胜利音乐 (15s)

4. 字体
assets/fonts/
├── NeonFont.ttf              # 霓虹字体 (主UI)
└── DamageFont.ttf            # 伤害数字 (粗体)

5. Shader资源
resources/shaders/
├── neon_glow.gdshader        # 霓虹光晕效果
├── screen_shake.gdshader     # 屏幕震动
├── chromatic_aberration.gdshader  # 色差效果
└── pixelate.gdshader         # 像素化（可选）


---

🎯 核心Shader实现

霓虹光晕 Shader (neon_glow.gdshader)
shader_type canvas_item;

uniform float glow_strength : 0.5;
uniform float glow_radius : 20.0;
uniform vec4 glow_color : hint_color;

void fragment() {
    vec4 tex_color = texture(TEXTURE, UV);
    
    if (tex_color.a < 0.1) {
        discard;
    }
    
    // 计算光晕
    vec2 size = TEXTURE_PIXEL_SIZE * glow_radius;
    vec4 glow = vec4(0.0);
    
    for (float x = -1.0; x <= 1.0; x += 1.0) {
        for (float y = -1.0; y <= 1.0; y += 1.0) {
            vec2 offset = vec2(x, y) * size;
            vec4 sample_color = texture(TEXTURE, UV + offset);
            glow += sample_color;
        }
    }
    
    glow /= 9.0;
    glow.rgb *= glow_strength;
    glow.rgb = mix(glow.rgb, glow_color.rgb, 0.5);
    
    COLOR = tex_color + glow;
}


---

📊 数据配置示例

武器数据 (PulseGun.tres)
# WeaponData 资源文件
{
    "weapon_name": "脉冲爆裂枪",
    "weapon_type": "pulse",
    "damage": 15.0,
    "fire_rate": 0.15,
    "bullet_speed": 400.0,
    "spread_angle": 15.0,
    "bullet_count": 3,
    "energy_cost": 5,
    "unlock_level": 1
}

技能数据 (OverclockCore.tres)
# SkillData 资源文件
{
    "skill_id": "overclock_core",
    "skill_name": "超频核心",
    "rarity": "rare",
    "description": "攻击速度提升20%",
    "effect_type": "attack_speed",
    "effect_value": 0.2,
    "max_stack": 3,
    "icon_path": "res://assets/sprites/ui/skill_overclock.png"
}

敌人数据 (BasicEnemy.tres)
# EnemyData 资源文件
{
    "enemy_name": "追踪核心",
    "enemy_type": "basic",
    "base_hp": 20.0,
    "base_speed": 80.0,
    "damage": 10.0,
    "score": 10,
    "sprite_color": Color(1.0, 0.2, 0.2),
    "ai_behavior": "chase",
    "drop_table": ["health_orb", "energy_orb"]
}


---

🚀 开发路线图

第1周：核心框架
[] 搭建项目结构
[] 实现玩家移动和瞄准
[] 实现基础武器射击
[] 实现敌人AI（追踪型）
[] 实现碰撞检测和伤害系统

第2周：游戏系统
[] 波次管理系统
[] 对象池优化
[] 技能选择UI
[] 升级系统
[] 添加3种敌人类型

第3周：内容扩展
[] 添加剩余武器（4种）
[] 添加剩余敌人（3种）
[] 实现BOSS战
[] 技能系统（10个技能）
[] 永久升级系统

第4周：优化和打磨
[] 添加所有特效（粒子、屏幕震动）
[] 音效和音乐集成
[] UI美化
[] 性能优化（移动端）
[] 测试和BUG修复
[] 打包发布


---

💰 成本估算

项目
费用
备注
Godot引擎
¥0
开源免费
音效素材包
¥50-100
Unity Asset Store / itch.io
字体
¥0
使用开源字体（如思源黑体）
音乐
¥0-50
免费CC协议音乐或自制
总计
¥50-150
符合视频中"不到200块"


---

📱 移动端优化要点

1. 渲染优化
  - 使用Godot 4的Mobile渲染器
  - 限制同屏粒子数量（<100）
  - 使用对象池避免频繁实例化
  - 合批静态精灵

2. 输入适配
  - 添加虚拟摇杆
  - 自动瞄准辅助
  - 触摸射击区域优化

3. 性能配置
# 项目设置
Rendering/Renderer/Renderer = "Mobile"
Physics/2D/Physics Ticks Per Second = 60
Display/Window/Stretch/Mode = "canvas_items"

4. 内存管理
  - 场景异步加载
  - 及时释放无用资源
  - 音频流式加载


---

🎮 游戏特色设计

1. 极简美学：几何图形+霓虹配色，视觉冲击力强
2. 爽快打击感：屏幕震动+粒子爆炸+音效反馈
3. Build多样性：武器×技能×升级 = 数百种组合
4. 低门槛：操作简单，上手快
5. 高重复性：Roguelike随机性，每局不同体验


---

✅ 交付物清单

1. 可执行文件
  - Windows (.exe)
  - Android (.apk)
  - Web (HTML5)

2. 源代码
  - 完整Godot项目
  - 注释清晰的脚本
  - 可编辑的资源文件

3. 文档
  - 开发文档
  - 素材使用许可
  - 部署指南


---

总开发周期：4周（全职）或 8周（兼职）  
技术难度：⭐⭐⭐☆☆（中等）  
推荐团队：1-2人（程序+美术/音效）

需要我提供具体的某个模块的详细实现代码或素材制作教程吗？