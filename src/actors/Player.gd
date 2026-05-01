# Player.gd
extends CharacterBody2D

signal health_changed(current: int, max_value: int)
signal died

@export var base_speed: float = 220.0
@export var max_health: int = 10
@export var base_damage: int = 1
@export var base_attack_interval: float = 0.6
@export var bullet_scene: PackedScene

var current_health: int
var can_be_hurt: bool = true

@onready var attack_timer: Timer = $AttackTimer
@onready var hurt_cd: Timer = $HurtCooldown

func _ready() -> void:
	add_to_group(&"player")
	current_health = max_health
	health_changed.emit(current_health, max_health)
	attack_timer.timeout.connect(_on_attack_timer)
	hurt_cd.timeout.connect(func(): can_be_hurt = true)
	_refresh_attack_rate()
	attack_timer.start()

func _physics_process(_delta: float) -> void:
	var input_vec := Vector2(
		Input.get_action_strength(&"move_right") - Input.get_action_strength(&"move_left"),
		Input.get_action_strength(&"move_down") - Input.get_action_strength(&"move_up")
	)
	input_vec = MathUtils.normalize_input(input_vec)
	velocity = input_vec * get_current_speed()
	move_and_slide()

func get_current_speed() -> float:
	return base_speed * GameManager.move_speed_mult

func _refresh_attack_rate() -> void:
	attack_timer.wait_time = max(0.08, base_attack_interval / GameManager.attack_rate_mult)

func _on_attack_timer() -> void:
	_refresh_attack_rate()
	var target := _find_nearest_enemy()
	if target == null or bullet_scene == null:
		return
	
	var base_dir: Vector2 = (target.global_position - global_position).normalized()
	var bullet_count: int = 1 + GameManager.bonus_multishot
	
	for i in bullet_count:
		var dir: Vector2 = base_dir
		if bullet_count > 1:
			# 散射角度：每颗子弹偏移 ±15 度
			var spread: float = deg_to_rad(30.0)
			var angle_offset: float = spread * (float(i) / float(bullet_count - 1) - 0.5)
			dir = base_dir.rotated(angle_offset)
		
		_fire_bullet(dir)

func _fire_bullet(dir: Vector2) -> void:
	var b: Node = bullet_scene.instantiate()
	b.global_position = global_position
	var dmg: int = base_damage + GameManager.bonus_damage
	var pierce: int = GameManager.bonus_pierce
	var spd_mult: float = GameManager.bullet_speed_mult
	b.setup(dir, dmg, pierce, spd_mult)
	get_tree().current_scene.add_child(b)

func _find_nearest_enemy() -> Node2D:
	var enemies := get_tree().get_nodes_in_group(&"enemy")
	var positions: Array[Vector2] = []
	for e in enemies:
		if e is Node2D:
			positions.append(e.global_position)
	
	if positions.is_empty():
		return null
	
	var idx: int = MathUtils.find_nearest_index(global_position, positions)
	return enemies[idx] as Node2D

func take_damage(amount: int) -> void:
	if not can_be_hurt:
		return
	can_be_hurt = false
	if hurt_cd != null:
		hurt_cd.start()
	current_health -= amount
	health_changed.emit(current_health, max_health)
	_flash_hurt()
	if current_health <= 0:
		died.emit()
		GameManager.player_has_died()
		queue_free()

func _flash_hurt() -> void:
	modulate = Color(1, 0.4, 0.4)
	create_tween().tween_property(self, "modulate", Color.WHITE, 0.2)
