# Enemy.gd
extends CharacterBody2D

const TOUCH_COOLDOWN: float = 0.5

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
	
	var dir: Vector2 = MathUtils.seek_direction(global_position, player.global_position)
	velocity = dir * speed
	move_and_slide()
	
	# 接触伤害（碰撞体半宽之和约 30，放宽到 35 确保碰撞时必触发）
	if _touch_cd <= 0.0 and global_position.distance_to(player.global_position) < 35.0:
		if player.has_method("take_damage"):
			player.take_damage(damage)
			_touch_cd = TOUCH_COOLDOWN

func _get_player() -> Node2D:
	var arr := get_tree().get_nodes_in_group(&"player")
	return arr[0] if arr.size() > 0 else null

func take_damage(amount: int) -> void:
	current_health -= amount
	_flash_hurt()
	if current_health <= 0:
		GameManager.add_xp(xp_reward)
		queue_free()

func _flash_hurt() -> void:
	modulate = Color(1, 1, 1, 0.6)
	create_tween().tween_property(self, "modulate", Color.WHITE, 0.12)
