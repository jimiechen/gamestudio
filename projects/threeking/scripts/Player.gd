extends CharacterBody2D
class_name Player

enum AimMode {
	MOUSE,
	KEYS,
	AUTO,
	MOVEMENT
}

@export var aim_mode: AimMode = AimMode.KEYS

var last_key_aim_direction: Vector2 = Vector2.RIGHT

@export var auto_aim_range: float = 500.0
var auto_target: Node2D = null

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

func _ready():
	current_hp = max_hp
	is_invincible = false
	is_auto_shooting = false
	last_shot_time = 0.0
	last_key_aim_direction = Vector2.RIGHT
	add_to_group("player")
	_detect_input_device()

func _detect_input_device():
	aim_mode = AimMode.KEYS

func _physics_process(delta):
	_handle_movement(delta)
	move_and_slide()

func _process(_delta):
	_handle_aiming()
	_handle_shooting()

func _input(event):
	if event.is_action_pressed("shoot"):
		is_auto_shooting = !is_auto_shooting

	if event.is_action_pressed("toggle_aim_mode"):
		_cycle_aim_mode()

func _cycle_aim_mode():
	aim_mode = (aim_mode + 1) % AimMode.size()
	var mode_names = ["鼠标瞄准", "方向键瞄准", "自动瞄准", "移动瞄准"]
	print("切换瞄准模式: " + mode_names[aim_mode])

func _handle_movement(_delta):
	var input_dir = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

	if input_dir.length() > 0:
		velocity = velocity.lerp(input_dir * speed, friction)
	else:
		velocity = velocity.lerp(Vector2.ZERO, friction)

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

func _aim_with_mouse():
	var mouse_pos = get_global_mouse_position()
	var aim_dir = (mouse_pos - global_position).normalized()
	_update_sprite_direction(aim_dir)

func _aim_with_keys():
	var aim_input = Input.get_vector("aim_left", "aim_right", "aim_up", "aim_down")

	if aim_input.length() > 0:
		last_key_aim_direction = aim_input.normalized()

	_update_sprite_direction(last_key_aim_direction)

func _aim_with_auto():
	var target = _find_nearest_enemy()

	if target and is_instance_valid(target):
		var aim_dir = (target.global_position - global_position).normalized()
		_update_sprite_direction(aim_dir)
		auto_target = target
	else:
		if velocity.length() > 10:
			_update_sprite_direction(velocity.normalized())
		auto_target = null

func _aim_with_movement():
	if velocity.length() > 10:
		var aim_dir = velocity.normalized()
		_update_sprite_direction(aim_dir)

func _update_sprite_direction(direction: Vector2):
	if direction.x < 0:
		sprite.flip_h = true
	else:
		sprite.flip_h = false

func _find_nearest_enemy() -> Node2D:
	var enemies = get_tree().get_nodes_in_group("enemies")
	var nearest: Node2D = null
	var nearest_dist = auto_aim_range

	for enemy in enemies:
		if not is_instance_valid(enemy):
			continue

		var dist = global_position.distance_to(enemy.global_position)
		if dist < nearest_dist:
			nearest_dist = dist
			nearest = enemy

	return nearest

func _handle_shooting():
	if not is_auto_shooting:
		return

	var now = Time.get_ticks_msec() / 1000.0
	if now - last_shot_time < shoot_cooldown:
		return

	last_shot_time = now
	_shoot()

func _shoot():
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

func take_damage(amount: int):
	if is_invincible:
		return

	current_hp -= amount

	if get_tree() and get_tree().current_scene and get_tree().current_scene.has_method("start_screen_shake"):
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
